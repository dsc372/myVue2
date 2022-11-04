import { parseHTML } from "./parse.js"

const defaultTagRE=/\{\{((?:.|\r?\n)+?)\}\}/g //{{}}

export function complieToFunction(template) {
  //1.将template转化为ast语法树
  let ast = parseHTML(template)
  //2.通过ast语法树，生成render方法，render方法执行后返回的结果就是虚拟DOM
  let code=`with(this){return ${codeGen(ast)}}`//with的作用就是让{}中代码的变量都去()中的地方找
  let render=new Function(code)
  return render
}

function codeGen(ast) {
  //通过ast语法树生成之后要传入render函数的代码其中_c创建元素，_v创建文本，_s处理{{}}中的变量
  let code = `_c('${ast.tag}',${
    ast.attrs.length > 0 ? propsGen(ast.attrs) : null
  }${ast.children.length > 0 ? `,${childrenGen(ast.children)}` : ""})`
  return code
}

function propsGen(attrs) {
  let str = ""
  for (let i = 0; i < attrs.length; i++) {
    if (attrs[i].name === "style") {
      let obj = {}
      attrs[i].value.split(";").forEach((item) => {
        let [key, value] = item.split(":")
        obj[key] = value
      })
      attrs[i].value = obj
    }
    str += `${attrs[i].name}:${JSON.stringify(attrs[i].value)},`
  }
  return `{${str.slice(0, -1)}}`
}

function childrenGen(children){
    function gen (child){
        if(child.type===1){
            return codeGen(child)
        }else{
            let text=child.text
            if(!defaultTagRE.test(text)){
                return `_v${JSON.stringify(text)}`
            }else{
                let tokens=[]
                let match
                defaultTagRE.lastIndex=0//!defaultTagRE.test(text)之后lastIndex已偏移
                let lastIndex=0
                while(match=defaultTagRE.exec(text)){//{{name}}  hello  {{age}}  hello
                    let index=match.index
                    if(index>lastIndex){//处理两个{{}}之间的text
                        tokens.push(JSON.stringify(text.slice(lastIndex,index).trim()))
                    }
                    tokens.push(`_s(${match[1].trim()})`)
                    lastIndex=index+match[0].length
                }
                if(lastIndex<text.length){
                    tokens.push(JSON.stringify(text.slice(lastIndex).trim()))
                }
                return `_v(${tokens.join('+')})`
            }
        }
    }
    return children.map(child=>gen(child)).join(',')
}