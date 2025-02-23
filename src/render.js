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
function createDom(fiber) {
	//创建dom
	const dom =
		fiber.type === "TEXT_ELEMENT"
			? document.createTextNode("")
			: document.createElement(fiber.type);
	//看是否有子元素，如有就递归
	//here is the doomed part, recursion, and we need to optimize it
	//once we start the recursion, we can't stop it. it will stop the main thread
	// element.props.children.forEach(item=>render(item,dom));
	//样式
	Object.keys(fiber.props)
		.filter((item) => item !== "children")
		.forEach((item) => (dom[item] = fiber.props[item]));
	console.log(dom, "dom");

	return dom;
	// //挂载dom
	// container.appendChild(dom);
}
function render(element, container) {
	wipRoot = {
		dom: container,
		props: {
			children: [element],
		},
		alternate: currentRoot,
		child: null,
	};
	deletions = [];
	nextUnitOfWork = wipRoot;
}

let nextUnitOfWork = null;
//wip means half way done, so that root means
let wipRoot = null;

let currentRoot = null;

let deletions = null;
function workLoop(deadline) {
	let shouldYield = false;
	while (nextUnitOfWork && !shouldYield) {
		nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

		shouldYield = deadline.timeRemaining() < 1; // not enough time to operate
	}
	if (!nextUnitOfWork && wipRoot) {
		commitRoot();
	}
	// the real react doesn't use it, it has its own scheduler
	requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop); //call this method will inject a parameter to the workLoop

const commitRoot = () => {
	deletions.forEach(commitWork);
	commitWork(wipRoot.child);
	currentRoot = wipRoot;
	wipRoot = null;
};

const commitWork = (fiber) => {
	if (!fiber) return;
	// parent node
	let fiberParent = fiber.parent;
	//here is why we need a fragment as the root element
	while (!fiberParent.dom) {
		fiberParent = fiberParent.parent;
	}
	const domParent = fiberParent.dom;
	if (domParent) {
		//we need to do more than just append
		// domParent.appendChild(fiber.dom);
		if (fiber.tag === "ADD" && fiber.dom != null) {
			domParent.appendChild(fiber.dom);
		} else if (fiber.tag === "UPDATE" && fiber.dom != null) {
			updateDom(fiber.dom, fiber.alternate.props, fiber.props);
		} else if (fiber.tag === "DELETE") {
			// domParent.removeChild(fiber.dom);
			// for the same reason as add
			commitDelete(fiber, domParent);
		}
	}
	commitWork(fiber.child);
	commitWork(fiber.sibling);
};

function commitDelete(fiber, domParent) {
	if (fiber.dom) {
		domParent.removeChild(fiber.dom);
	} else {
		//if no dom, recursively to find a next dom
		commitDelete(fiber.child, domParent);
	}
}
function updateDom(dom, oldProps, newProps) {
	//deal with event
	const isEvent = (key) => key.startsWith("on");
	//remove old properties
	Object.keys(oldProps)
		.filter((key) => key !== "children" && !isEvent(key))
		.forEach((key) => {
			if (key !== newProps[key]) {
				dom[key] = null;
			}
		});
	//set new or changed properties
	Object.keys(newProps)
		.filter((key) => key !== "children" && !isEvent(key))
		.forEach((key) => {
			if (key !== oldProps[key] || !key in oldProps) {
				dom[key] = newProps[key];
			}
		});
	//remove old or changed event listeners
	Object.keys(oldProps)
		.filter((key) => !key in newProps || isEvent(key))
		.forEach((key) => {
			if (isEvent(key)) {
				const eventType = key.toLowerCase().substring(2);
				dom.removeEventListener(eventType, oldProps[key]);
			} else {
				dom[key] = null;
			}
		});
	//add new or changed event listeners
	Object.keys(newProps)
		.filter(isEvent)
		.forEach((key) => {
			const eventType = key.toLowerCase().substring(2);
			dom.addEventListener(eventType, newProps[key]);
		});
}

function performUnitOfWork(fiber) {
	const isFunctionComponent = fiber.type instanceof Function;

	if (isFunctionComponent) {
		updateFunctionComponent(fiber);
	} else {
		updateHostComponent(fiber);
	}

	//covert to render and commit
	// if (fiber.parent) {
	//     fiber.parent.dom.appendChild(fiber.dom);
	// }

	//replace with diff
	// let prevSibling = null;

	// for (let i = 0; i < elements.length; i++) {
	//     const newFiber = {
	//         dom:null,
	//         parent:fiber,
	//         props:elements[i].props,
	//         type:elements[i].type,
	//         child: null,
	//         sibling: null
	//     }
	//     if (i === 0) {
	//         fiber.child = newFiber;
	//     } else {
	//         prevSibling.sibling = newFiber;
	//     }
	//     prevSibling = newFiber;
	// }

	if (fiber.child) return fiber.child;
	let nextFiber = fiber;
	while (nextFiber) {
		//with sibling nodes
		if (nextFiber.sibling) {
			return nextFiber.sibling;
		}
		//else go parent node
		nextFiber = nextFiber.parent;
	}
}

/**
 * deal with regular component
 * @param {*} fiber
 */
function updateHostComponent(fiber) {
	if (!fiber.dom) {
		fiber.dom = createDom(fiber);
	}
	const elements = fiber.props.children;
	myDiff(fiber, elements);
}

/**
 * deal with function component
 * @param {*} fiber
 */
function updateFunctionComponent(fiber) {
	console.log("i am a function component", fiber);

	wipFiber = fiber;
	hooksIndex = 0;
	wipFiber.hooks = [];
	const elements = [fiber.type(fiber.props)];
	myDiff(fiber, elements);
}

export function useState(initial) {
	const oldHook =
		wipFiber.alternate &&
		wipFiber.alternate.hooks &&
		wipFiber.alternate.hooks[hooksIndex];
	const hook = {
		state: oldHook ? oldHook.state : initial,
		queue: [],
	};
	const actions = oldHook ? oldHook.queue : [];
	actions.forEach((action) => {
		hook.state = action(hook.state);
	});
	const setState = (action) => {
		hook.queue.push(action);
		//trigger the update
		wipRoot = {
			dom: currentRoot.dom,
			props: currentRoot.props,
			alternate: currentRoot,
		};
		nextUnitOfWork = wipRoot;
		deletions = [];
	};
	wipFiber.hooks.push(hook);
	hooksIndex++;
	return [hook.state, setState];
}

//hooks
let wipFiber = null;
// index is the key to know which hook is being used
let hooksIndex = null;
//key type
// the diff method is going to compare based on key
/**
 * 1. compare the type
 * 2. same type? update
 * 3. new element different type? add
 * 4. old fiber different type? delete
 * @param {*} wipRoot
 * @param {*} elements
 */
function myDiff(wipRoot, elements) {
	let index = 0;
	//point to current fiber
	let oldFiber = wipRoot.alternate && wipRoot.alternate.child;

	let prevSibling = null;
	while (index < elements.length || oldFiber) {
		const element = elements[index];
		const sameType = oldFiber && element && element.type === oldFiber.type;
		let newFiber = null;
		if (sameType) {
			//do update
			newFiber = {
				dom: oldFiber.dom,
				props: element.props,
				type: oldFiber.type,
				alternate: oldFiber,
				parent: wipRoot,
				tag: "UPDATE",
			};
		}
		if (element && !sameType) {
			//do add
			newFiber = {
				dom: null,
				props: element.props,
				type: element.type,
				alternate: null,
				parent: wipRoot,
				tag: "ADD",
			};
		}
		if (oldFiber && !sameType) {
			//do delete
			oldFiber.tag = "DELETE";
			deletions.push(oldFiber);
		}
		// old child nodes
		if (oldFiber) {
			oldFiber = oldFiber.sibling;
		}
		// new child nodes
		if (index === 0) {
			wipRoot.child = newFiber;
		} else {
			prevSibling.sibling = newFiber;
		}
		prevSibling = newFiber;
		index++;
	}
}
export default render;
