const ncname=`[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
const qnameCapture=`((?:${ncname}\\:)?${ncname})`
const startTagOpen= new RegExp(`^<${qnameCapture}`)//匹配起始标签 <xxx
const endTag=new RegExp(`^<\\/${qnameCapture}[^>]*>`)//匹配结束标签 </xxx>
const attribute=/^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/  //匹配属性
const startTagClose=/^\s*(\/?)>/ // >或/>
const defaultTagRE=/\{\{((?:.|\r?\n)+?)\}\}/g //{{}}
//vue3没有采用正则

export function complieToFunction(template){
    //1.将template转化为ast语法树
    let ast=parseHTML(template)
}

function parseHTML(html){
    //此行一下为构建语法树所需的数据结构
    const ELEMENT_TYPE=1
    const TEXT_TYPE=3
    const stack=[]//用于存放元素
    let currentParent//指向栈中的最后一个
    let root;

    //此行一下为解析html
    function advance(n){
        html=html.substring(n)
    }
    function parseStartTag(){
        const start =html.match(startTagOpen)
        if(start){
            const match={
                tagName:start[1],
                attrs:[],
            }
            advance(start[0].length)
            //一直解析，直到匹配到'>'符号
            let attr,end
            while(!(end=html.match(startTagClose))&&(attr=html.match(attribute))){
                advance(attr[0].length)
                match.attrs.push({name:attr[1],value:attr[3]||attr[4]||attr[5]||true})
                //下标具体是3、4、5中的哪一个由html.match(attribute)的返回值决定,true是因为有些属性没值时默认为true
            }
            if(end){
                advance(end[0].length)
            }
            return match
        }
        return false
    }
    while(html){
        let textEnd=html.indexOf('<')
        //textEnd为0说明是一个标签，大于零则指的是文本结束的位置
        if(textEnd===0){
            const startTagMatch=parseStartTag()
            if(startTagMatch){//处理开始标签
                start(startTagMatch.tagName,startTagMatch.attrs)
                continue
            }
            const endTagMatch=html.match(endTag)
            if(endTagMatch){//处理结束标签
                end(endTagMatch[1])
                advance(endTagMatch[0].length)
                continue
            }
        }else if(textEnd>0){
            let text=html.substring(0,textEnd);
            if(text.trim()!==''){
                chars(text)
            }
            if(text){
                advance(text.length)
            }
            continue
        }
    }
    
    //此行以下为构建语法树  
    function createASTElement(tag,attrs){
        return{
            tag,
            type:ELEMENT_TYPE,
            children:[],
            attrs,
            parent:null
        }
    }
    function start(tagName,attrs){
        let node=createASTElement(tagName,attrs)
        if(!root)root=node
        if(currentParent){
            node.parent=currentParent
            currentParent.children.push(node)
        }
        stack.push(node)
        currentParent=node
    }
    function chars(text){//文本直接放到currentParent的children中
        currentParent.children.push({
            type:TEXT_TYPE,
            text,
            parent:currentParent
        })
    }
    function end(tagName){
        stack.pop()
        currentParent=stack[stack.length-1]
    }
    console.log(root)
}