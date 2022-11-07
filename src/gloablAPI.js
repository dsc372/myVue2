import { mergeOptions } from "./utils/mergeOptions"

export function initGloablAPI(MyVue2){
    MyVue2.options={
        _base:MyVue2//Sub中可能要用到MyVue2中的一些静态方法，可以从这里拿
    }
    MyVue2.mixin=function(mixin){
        this.options=mergeOptions(this.options,mixin)
    }

    //手动创建组件
    MyVue2.extend=function(options){       
        function Sub(options={}){//最终使用一个组件就是new一个Sub实例
            this._init(options)
        }
        Sub.prototype=Object.create(MyVue2.prototype)//Sub.prototype.__proto__===MyVue2.prototype
        Sub.prototype.constructor=Sub
        Sub.options=mergeOptions(MyVue2.options,options)
        return Sub
    }

    MyVue2.options.components={}
    MyVue2.component=function(name,definition){
        //如果definition已经是一个函数，说明用户自己调用了MyVue2.extend
        definition=typeof definition ==='function'?definition:MyVue2.extend(definition)
        MyVue2.options.components[name]=definition
    }
}