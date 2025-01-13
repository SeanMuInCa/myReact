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

function render(element, container) {
	nextTask = {
		dom: container,
		props: {
			children: [element],
		},
	};
}

let nextTask = null;

function workLoop(deadline) {
	let shouldYield = false;
	while (nextTask && !shouldYield) {
		nextTask = performanceTask(nextTask);
		//check the remaining time less than 1 ms, then yield
		shouldYield = deadline.timeRemaining() < 1;
	}
	requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop);

function performanceTask(fiber) {
	// TODO add dom node
	if (!fiber.dom) {
		fiber.dom = createDom(fiber);
	}
	if (fiber.parent) {
		fiber.parent.dom.appendChild(fiber.dom);
	}
	// TODO create new fibers
	const elements = fiber.props.children;
	let index = 0;
	let prevSibling = null;

	while (index < elements.length) {
		const element = elements[index];
		const newFiber = {
			type: element.type,
			props: element.props,
			parent: fiber,
			dom: null,
		};
		if (index === 0) {
			fiber.child = newFiber;
		} else {
			prevSibling.sibling = newFiber;
		}
		prevSibling = newFiber;
		index++;
	}
    // TODO return next unit of work
	if (fiber.child) {
		return fiber.child;
	}
	let nextFiber = fiber;
	while (nextFiber) {
		if (nextFiber.sibling) {
			return nextFiber.sibling;
		}
		nextFiber = nextFiber.parent;
	}
}
export default render;
