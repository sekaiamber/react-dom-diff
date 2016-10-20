import {render} from 'react-dom';
import { example1, example2, example3, example4, example5 } from './examples'
const React = require('react');

require('./index.scss');


render(example1, document.getElementById("example1"));
render(example2, document.getElementById("example2"));
render(example3, document.getElementById("example3"));
render(example4, document.getElementById("example4"));
render(example5, document.getElementById("example5"));
