import { initState } from "./initState"
import {complieToFunction} from './complie/index.js'
import { callHook, mountComponent } from "./lifeCycle.js"
import { mergeOptions } from "./utils/mergeOptions"

export function initMixin(MyVue2){
    MyVue2.prototype._init=function(options){
        const vm=this
        vm.$options=mergeOptions(this.constructor.options,options)
        callHook(vm,'beforeCreate')
        initState(vm)
        callHook(vm,'created')
        if(options.el){
            vm.$mount(options.el)
        }
    }
    MyVue2.prototype.$mount=function(el){
       const vm=this
       const opts=vm.$options
       el=document.querySelector(el);
       if(!opts.render){//优先级render>template>el
        let template
        if(!opts.template){
            if(el){
                template=el.outerHTML
            }else{
                console.error('模板解析失败')
            }
        }else{
            template=opts.template
        }
        opts.render=complieToFunction(template)//后两种情况最后也要有一个render
       }
       mountComponent(vm,el)//new一个Watcher，new的过程中会完成初次渲染
    }
}