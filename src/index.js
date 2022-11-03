import { initMixin } from "./init"

function MyVue2(options){
    this._init(options)
}

initMixin(MyVue2)

export default MyVue2