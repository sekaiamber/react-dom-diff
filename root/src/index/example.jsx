const React = require('react');
require('./example.scss');

import factory from './nodeFactory'
import { metaString } from './nodeFactory'

import logger from './log'

let r = React.createElement(
  window._components['R'],
  {}
)

export default class Example extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      from: this.props.from,
      to: this.props.to,
      toComponent: r,
      fromComponent: r,
      log: []
    }
  }
  onFromDataChange(v) {
    this.setState({from: v.target.value});
  }
  onToDataChange(v) {
    this.setState({to: v.target.value});
  }
  handleChange() {
    let callbackname = `__${Math.floor(Math.random() * 1000)}__`;
    window[callbackname] = (msg) => {
      let log = this.state.log;
      log.push(msg);
    }
    let from = metaString.analysis(`<R>${this.state.from}</R>`, `{callback: window['${callbackname}']}`);
    let to = metaString.analysis(`<R>${this.state.to}</R>`, `{callback: window['${callbackname}']}`);
    logger.disable = true;
    this.setState({
      toComponent: from,
      fromComponent: from,
      log: []
    }, () => {
      logger.disable = false;
      this.setState({
        toComponent: to
      }, () => {
        delete window[callbackname];
        this.setState({log: this.state.log});
      })
    })
  }
  render() {
    return (
      <div className="exampleborder">
        <div className="factory">
          <div className="inputarea">
            <textarea cols="30" rows="10" onChange={this.onFromDataChange.bind(this)} value={this.state.from}></textarea>
            <div className="sign">&gt;</div>
            <textarea cols="30" rows="10" onChange={this.onToDataChange.bind(this)} value={this.state.to}></textarea>
          </div>
          <div className="optarea">
            <input type="button" value="Change" onClick={this.handleChange.bind(this)}/>
          </div>
        </div>
        <div className="example">
          <div className="fromComponent">{this.state.fromComponent}</div>
          <div className="sign">&gt;</div>
          <div className="toComponent">{this.state.toComponent}</div>
          <div className="logger">
            <ol>
              {this.state.log.map((log, i) => (
                <li key={i} className={log.level}>{log.message}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    )
  }
}
Example.defaultProps = {
  from: '<A />',
  to: '<B />'
}