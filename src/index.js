import { initMixin } from "./init"
import { initLifeCycle } from "./lifeCycle"
import { nextTick } from "./observe/watcher"

function MyVue2(options){
    this._init(options)
}

MyVue2.prototype.$nextTick=nextTick

initMixin(MyVue2)

initLifeCycle(MyVue2)

export default MyVue2