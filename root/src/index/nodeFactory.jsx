const React = require('react');
import logger from './log';

window.React = React;

function nodeFactory(name) {
  class _Node extends React.Component{
    constructor(props) {
      super(props);
      this.props.log && logger.log('create', `创建[${name}]结点`, this.props.callback);
    }
    componentDidMount() {
      this.props.log && logger.log('mount', `渲染[${name}]结点`, this.props.callback);
    }
    
    componentWillUnmount() {
      this.props.log && logger.log('unmount', `销毁[${name}]结点`, this.props.callback);
    }
    
    componentDidUpdate() {
      this.props.log && logger.log('update', `更新[${name}]结点`, this.props.callback);
    }
    
    render() {
      return (
        <div className={'node ' + name} data-name={name}>
          {this.props.children}
        </div>
      );
    }
  }
  _Node.defaultProps = {
    log: true
  }
  return _Node;
}

export default nodeFactory;

let _components = {}

window._components = _components;

"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890".split('').map((name) => {
  _components[name] = nodeFactory(name);
})


const metaString = {
  analysis: function(str, props) {
    props = props || null;
    props = typeof props == "string" ? props : JSON.stringify(props);
    let code = Babel.transform(str, { presets: ['react'] }).code;
    code = code.replace(/null/g, props);
    code = code.replace(/\n/g, '');
    code = code.replace(/\r/g, '');
    code = code.replace(/\( +/g, '(');
    let names = code.match(/\(./g) || [];
    names = names.map((name) => {
      return `var ${name[1]} = window._components["${name[1]}"];`;
    });
    names = names.join('');
    code = names + code;
    let component = eval(code);
    return component;
  }
}

export {
  metaString
}