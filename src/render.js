// function render(element, container){
//     //创建dom
//     const dom = element.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(element.type);
//     //看是否有子元素，如有就递归
//     //here is the doomed part, recursion, and we need to optimize it
//     //once we start the recursion, we can't stop it. it will stop the main thread
//     element.props.children.forEach(item=>render(item,dom));
//     //样式
//     Object.keys(element.props).filter(item=>item!=='children').forEach(item=>dom[item]=element.props[item]);
//     //挂载dom
//     container.appendChild(dom);
// }
function createDom(fiber){
    //创建dom
    const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(fiber.type);
    //看是否有子元素，如有就递归
    //here is the doomed part, recursion, and we need to optimize it
    //once we start the recursion, we can't stop it. it will stop the main thread
    // element.props.children.forEach(item=>render(item,dom));
    //样式
    Object.keys(fiber.props).filter(item=>item!=='children').forEach(item=>dom[item]=fiber.props[item]);
    console.log(dom,'dom');
    
    return dom;
    // //挂载dom
    // container.appendChild(dom);
}
function render(element, container) {
	nextUnitOfWork = {
		dom: container,
		props: {
			children: [element],
		},
        child: null,
	};

}

let nextUnitOfWork = null;

function workLoop(deadline) {
    let shouldYield = false;
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(
            nextUnitOfWork
        );
        console.log(nextUnitOfWork);
        
        shouldYield = deadline.timeRemaining() < 1;// not enough time to operate
    }
    requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop)//call this method will inject a parameter to the workLoop

function performUnitOfWork(fiber) {
    if (!fiber.dom) {
        fiber.dom = createDom(fiber);
    }
    if (fiber.parent) {
        fiber.parent.dom.appendChild(fiber.dom);
    }
    const elements = fiber.props.children;

    let prevSibling = null;

    for (let i = 0; i < elements.length; i++) {
        const newFiber = {
            dom:null,
            parent:fiber,
            props:elements[i].props,
            type:elements[i].type,
            child: null,
            sibling: null
        }
        if (i === 0) {
            fiber.child = newFiber;
        } else {
            prevSibling.sibling = newFiber;
        }
        prevSibling = newFiber;

    }

    if(fiber.child) return fiber.child;
    let nextFiber = fiber;
    while(nextFiber) {
        //with sibling nodes
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        //else go parent node
        nextFiber = nextFiber.parent;
    }
}

export default render;
