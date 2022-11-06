import { mergeOptions } from "./utils/mergeOptions"

export function initGloablAPI(MyVue2){
    MyVue2.options={}
    MyVue2.mixin=function(mixin){
        this.options=mergeOptions(this.options,mixin)
    }
    MyVue2.extend=function(options){       
        function Sub(options={}){//最终使用一个组件就是new一个Sub实例
            this._init(options)
        }
        Sub.prototype=Object.create(MyVue2.prototype)//Sub.prototype.__proto__===MyVue2.prototype
        Sub.prototype.constructor=Sub
        Sub.options=options
        return Sub
    }
}