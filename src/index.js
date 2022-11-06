import { initGloablAPI } from "./gloablAPI"
import { initMixin } from "./init"
import { initMixinState } from "./initState"
import { initLifeCycle } from "./lifeCycle"

function MyVue2(options){
    this._init(options)
}

initMixin(MyVue2)//扩展了init方法

initLifeCycle(MyVue2)//vm._update  vm._render

initMixinState(MyVue2)//实现了$nextTick、$watch

initGloablAPI(MyVue2)

export default MyVue2