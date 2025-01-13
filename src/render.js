function render(element, container){
    //创建dom
    const dom = element.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(element.type);
    //看是否有子元素，如有就递归
    //here is the doomed part, recursion, and we need to optimize it
    //once we start the recursion, we can't stop it. it will stop the main thread
    element.props.children.forEach(item=>render(item,dom));
    //样式
    Object.keys(element.props).filter(item=>item!=='children').forEach(item=>dom[item]=element.props[item]);
    //挂载dom
    container.appendChild(dom);
}

export default render;