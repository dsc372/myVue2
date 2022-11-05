import { initMixin } from "./init"
import { initLifeCycle } from "./lifeCycle"
import Watcher, { nextTick } from "./observe/watcher"

function MyVue2(options){
    this._init(options)
}

MyVue2.prototype.$nextTick=nextTick

MyVue2.prototype.$watch=function(expOrFn,cb){
    new Watcher(this,expOrFn,{user:true},cb)
}

initMixin(MyVue2)

initLifeCycle(MyVue2)

export default MyVue2