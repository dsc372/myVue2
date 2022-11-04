import Watcher from "./observe/watcher.js";
import { createElementVNode, createTextVNode } from "./vdom/index.js"

function createEle(vnode){
    function patchProps(el,props){
        for(let key in props){
            if(key==='style'){
                for(let styleName in props.style){
                    el.style[styleName]=props.style[styleName]
                }
            }else{
                el.setAttribute(key,props[key])
            }
        }
    }
    //通过虚拟DOM创建真实DOM
    let {tag,props,children,text}=vnode
    if(typeof tag ==='string'){//元素节点
        vnode.el=document.createElement(tag);//将真实节点与虚拟节点对应起来，后续如果修改属性方便操作
        patchProps(vnode.el,props)
        children.forEach(child=>{
            vnode.el.appendChild(createEle(child))
        })
    }else{//此时tag===undefined，为文本节点
        vnode.el=document.createTextNode(text)
    }
    return vnode.el
}

function patch(oldNode,vnode){//既有初始化的功能，又有更新的逻辑
    const isRealElement=oldNode.nodeType//nodeType属性是元素固有的
    if(isRealElement){
        const parentElm=oldNode.parentNode//parentNode属性是元素固有的
        let newElm=createEle(vnode)
        parentElm.insertBefore(newElm,oldNode.nextSibling)//插入新的真实DOM
        parentElm.removeChild(oldNode)//删除老的真实DOM
        return newElm
    }else{
        //oldVNode也是虚拟节点，使用diff算法
    }
}

export function initLifeCycle(MyVue2){
    MyVue2.prototype._update=function(vnode){
        const vm=this
        const el=vm.$el
        vm.$el=patch(el,vnode)
    }
    MyVue2.prototype._render=function(){
        const vm=this
        return vm.$options.render.call(vm)//让之前with中的this指向vm
    }
    MyVue2.prototype._c=function(){//处理元素  _c('div',{属性}...，children)
        return createElementVNode(this,...arguments)
    }
    MyVue2.prototype._v=function(){//处理文本 _v(text)
        return createTextVNode(this,...arguments)
    }
    MyVue2.prototype._s=function(value){//处理{{}}
        if(typeof value !=='object')return value
        return JSON.stringify(value)
    }
}


export function mountComponent(vm,el){
    //1.通过render生成虚拟DOM  vm._render()
    //2.由虚拟DOM生成真是DOM  vm._update()
    vm.$el=el
    const updateComponent=()=>{
        vm._update(vm._render())
    }
    let w=new Watcher(vm,updateComponent,true)//true用于标识是一个渲染watcher
    //3.最后挂载到el上
}