
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

//review summary
//1. create element convert type, props and children to fiber
//2. render fiber to dom but the recursion will block the thread, so use requestIdleCallback to make sure it won't block the thread
//3. fiber is a tree structure, so we can use recursion to render it
//4. fiber connect with dom, parent, child, sibling, type, props with dom
//5. render and commit, render is async commit is sync, so that we can render page faster
//6. myDiff based on type to decide what is the next action to fiber and the oldfiber, add update or delete
//7. change props listeners and so on
//8. function components is special, no dom
//9. hooks is based on index to decide which hook to use