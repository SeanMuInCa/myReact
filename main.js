import { createElement, crateTextElement, render } from "./src";

const element = createElement(
  "h1", 
  { class:'h1', id:'h1element', style:'color:blue;' }, 
  //这是个text而不是对象，因此要创建一个text节点来处理这种基础数据类型
  "Hello World",
  createElement("p", { class:'p', id:'pelement', style:'background:red' }, "This is a paragraph")
);

console.log(element);

const app = document.getElementById('app');
render(element, app);