const React = require('react');

import Example from './example'

var example1 = <Example />
var example2 = <Example from={"<A>\n  <B />\n  <C />\n</A>\n<D />"} to={"<D>\n  <A>\n    <B />\n    <C />\n  </A>\n</D>"}/>
var example3 = <Example from={'<A>\n  <B />\n  <C />\n</A>\n<D key="D"/>'} to={'<D key="D">\n  <A>\n    <B />\n    <C />\n  </A>\n</D>'}/>

var example4 = <Example from={"<A />\n<B />"} to={"<B />\n<A />"} />
var example5 = <Example from={'<A key="A" />\n<B key="B" />'} to={'<B key="B" />\n<A key="A" />'} />

export {
  example1, example2, example3, example4, example5
}