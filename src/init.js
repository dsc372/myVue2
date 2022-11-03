import { initState } from "./initState"

export function initMixin(MyVue2){
    MyVue2.prototype._init=function(options){
        const vm=this
        vm.$options=options
        initState(vm)
    }
}