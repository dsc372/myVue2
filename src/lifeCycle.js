import Watcher from "./observe/watcher.js";
import { createElementVNode, createTextVNode } from "./vdom/index.js"
import {patch} from "./vdom/patch.js"

export function initLifeCycle(MyVue2){
    MyVue2.prototype._update=function(vnode){
        const vm=this
        const el=vm.$el
        const preVnode=vm._vnode
        vm._vnode=vnode
        if(preVnode){
            vm.$el=patch(preVnode,vnode)
        }else{
            vm.$el=patch(el,vnode)
        }
        
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
    //3.最后挂载到el上
    vm.$el=el
    const updateComponent=()=>{
        vm._update(vm._render())
    }
    let w=new Watcher(vm,updateComponent,true)//true用于标识是一个渲染watcher
}