import { initMixin } from "./init"
import { initLifeCycle } from "./lifeCycle"

function MyVue2(options){
    this._init(options)
}

initMixin(MyVue2)

initLifeCycle(MyVue2)

export default MyVue2