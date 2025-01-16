
import { createElement, crateTextElement, render } from "./src";
import { useState } from "./src/render";
const app = document.getElementById('app');
const element = createElement(
  "h1", 
  { class:'h1', id:'h1element', style:'color:blue;' }, 
  //这是个text而不是对象，因此要创建一个text节点来处理这种基础数据类型
  "Hello World",
  createElement("p", { class:'p', id:'pelement', style:'background:red' }, "This is a paragraph")
);
// const handleChange = e => {
//   //now it works, what about the components?
//   renderer(e.target.value);
  
// };
// const renderer = value =>{
//   const element1 = createElement(
//     'div',
//     null,
//     createElement('input', {
//       oninput: (e) => {
//         handleChange(e);
//       }
//     }),
//     createElement('h2', null, value)
//   )
//   render(element1, app);
// }
// renderer('hello')
// console.log(element);
const element2 = (props) => {
  const [state, setState] = useState(1);
  return createElement('button', {onclick: () => setState(pre => pre + 1)}, state);// function as action
};
console.log(typeof element2);

const element3 = createElement(element2, { name: 'world' });

render(element3, app);

