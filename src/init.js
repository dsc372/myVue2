import { initState } from "./initState"
import {complieToFunction} from './complie/index.js'
import { mountComponent } from "./lifeCycle.js"

export function initMixin(MyVue2){
    MyVue2.prototype._init=function(options){
        const vm=this
        vm.$options=options
        initState(vm)
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
       mountComponent(vm,el)//通过render生成虚拟DOM，由虚拟DOM生成真是DOM，最后挂载到el上
    }
}