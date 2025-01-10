function crateTextElement(text){
    return {
        type: "TEXT_ELEMENT",
        props:{
            nodeValue: text,
            children: [],
        }
    }
}

export default crateTextElement;