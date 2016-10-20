# React Virtual DOM Diff算法解析

这篇文章是我用来分析React Virtual DOM的行为的，加之自己对React的理解而成。

*注：所有例子可以自行编辑尝试，组件名称只能是[A-Z]或[a-z]或[0-9]单个字符*

React开发之初，Facebook的开发人员认为，页面上同一个组件的变化，可以视作**状态**的变化，而状态的变化事实上是无关乎View的，于是每个组件其实可以视为一个**状态机**，为了管理这个状态变化，他们创造了Virtual DOM，当两个状态需要比较时，他们使用Diff算法对两个DOM进行比较。

[纯粹的Diff算法](http://grfia.dlsi.ua.es/ml/algorithms/references/editsurvey_bille.pdf)的时间复杂度为O(n^3)，显然是不行的，而React的开发者们却神奇地将这个算法提升至O(n)的时间复杂度，根据[官方文档](https://facebook.github.io/react/docs/reconciliation.html)，他们将场景限定在了下面两个大前提中：

1. 两个相同组件产生类似的DOM结构，不同的组件产生不同的DOM结构；
2. 对于同一层次的一组子节点，它们可以通过唯一的id进行区分。

根据我的深入挖掘，我将更加细致地描述这两点，并加入第三点：

1. 两个相同组件产生类似的DOM结构，不同的组件产生不同的DOM结构；
   1. React认为：通过同一个ReactComponet构造器产生的组件实例，将会产生类似的DOM结构，即使我们通过代码将实际产生的DOM编写地完全不同，它也认为它们相似，这两个Virtual DOM的状态变化将被列入Diff算法中进行比较。
   2. React认为：通过不同的ReactComponent构造器产生的组件实例，它们产生的DOM完全不相似，即使这两个组件的源代码完全一样，它也认为它们不同。这两者的状态变化将不被列入Diff算法中比较，直接销毁状态前的DOM再创建新的DOM。
   3. React通过比较组件构造器的指针，可以很方便的指出两个组件是否是相似的。
2. 对于同一层次的一组子节点，它们可以通过唯一的id进行区分。
   1. React采用全局刷新的思路，即无关乎状态前后的DOM是否有关系。
   2. React允许动态生成Virtual DOM，但它指出，需要分配给每个Virtual DOM一个ID，这个ID帮助它更有效率地操作DOM。
   3. 若不给Virtual DOM指定ID，则React认为状态改变前后所有的DOM都无关，并且将全部销毁所有DOM再创建新的DOM。
3. React对待HTML元素和ReactComponent完全一致。

乍看一眼如此粗暴的大前提十分不靠谱，然而这却是整个React渲染机制的基础，事实也证明这两个假设在大部分场景下都十分准确合理。

下面我将给出具体例子来说明上面的行为。

## 不同节点之间的状态比较

HTML节点之间的比较，无非两种情况：

1. 节点标签不同。比如`<div>`和`<span>`。
2. 节点标签相同，但属性不同。比如`<div class="a">`和`<div class="b">`。

因为第二种情况事实上就是直接去更新元素本身，我们不讨论，我们只讨论第一种情况。

第一个例子，我将一个`<div>`元素替换为`<span>`元素，从DOM上来看就是这样子：

```html
<R>           <R>
  <div>  -->    <span>
</R>          </R>
```

根据上面的前提`1.2`，React直接认为`span`跟`div`不同，所以React直接删除了`div`元素，并插入`span`元素，具体步骤为：

1. 销毁div元素
2. 创建span结点
3. 将span渲染出来并插入到R结点下
4. 更新R结点

同样，根据上面的前提`3`，我们知道对于React来说，组件跟HTML元素完全一致，所以若情况变成下面这样：

```html
<R>           <R>
  <A />  -->    <B />
</R>          </R>
```

React的行为也如上面所诉，需要注意的是，正是因为上面的前提`3`，使得React将**彻底删除**A组件下的所有DOM节点，举个例子，若上面的例子中的A和B都长这样：

```html
<div>
  <h1>header</h1>
  <p>Some text...</p>
</div>
```

那么React还是认为它们不同，将直接删除整个A，而不是等B再去比较其中的`h1`和`p`。这样内部元素将不会用于后续比较，提高了比较效率。

有些同学可能会问，上面那种情况下，直接全部删除再插入DOM难道不是一种性能损失么？事实上这种是极端情况。一般情况下两个不同的组件他们的内部元素相差巨大。

*实例1：点击Change查看*

## DOM元素整体迁移的困惑

假设我们有这样的例子：

状态1：

```html
<R>
  <A>
    <B />
    <C />
  </A>
  <D />
</R>
```

状态2：

```html
<R>
  <D>
    <A>
      <B />
      <C />
    </A>
  </D>
</R>
```

也即是说，我们将整个`A`移动到了与它平级的`D`下，正常情况下，我们习惯这么操作：

1. 从R节点移出A。
2. 将A移到D的下面。

合情合理，有理有据。

然而让我们看看React是怎么做的：

*实例2：点击Change查看*

事实证明，React是完全依据上述前提`1.1`和前提`1.2`来规划操作：

1. 因为状态1的A组件和状态2相同位置的D组件完全不同，所以依次销毁ABCD组件。
2. 根据DOM树结构，依次创建DABC结点。
3. 从子到父依次渲染BCAD结点。
4. 最后更新R元素。

这体现了React又一个特性：**逐层比较**，下面是一张示意图：

![逐层比较](http://cdn4.infoqstatic.com/statics_s2_20161011-0321/resource/articles/react-dom-diff/zh/resources/0909000.png)

也就是说，React只会比较同一个父结点下同样深度同样位置的子节点，对其运用上面3个大前提来做比较。

## 神奇的KEY

对于上面实例2，很多同学又开始不满了：逐层比较我是明白了，但是D组件被无缘无故删除又创建，太浪费了！于是React开发人员加入了一个简单又神奇的Key属性，使得同层内部比较变得十分高效。

举个例子：

![key](http://cdn4.infoqstatic.com/statics_s2_20161011-0321/resource/articles/react-dom-diff/zh/resources/0909004.png)

我们要在ABCDE中插入F，如果React按照普通的做法，根据前提`2.1`和前提`2.3`，势必得出下面的操作：

![key](http://cdn4.infoqstatic.com/statics_s2_20161011-0321/resource/articles/react-dom-diff/zh/resources/0909005.png)

React将逐个更新元素，并在末尾增加一个E，从而产生巨大的性能损失。

而当设置了Key之后，React就会这样来操作：

![key](http://cdn4.infoqstatic.com/statics_s2_20161011-0321/resource/articles/react-dom-diff/zh/resources/0909006.png)

所以，上述实例2可以修改为：

*实例3：点击Change查看*

这时你会发现React的行为产生了相应的变化。

再给两个例子来更好的体会一下：

*实例4和实例5：点击Change查看*

这两个例子只不过为每个元素增加了Key，却大幅减少了DOM操作。

## 小结

本文通过几个例子来说明了React的diff算法是如何在Virtual DOM中产生比较操作的，它解释了React如何一步步提升自己的性能，并有助于我们理解组件的生命周期，以及编写出高性能的React组件。