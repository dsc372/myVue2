import { observe } from "./observe/index.js"

export function initState(vm){
    const opts=vm.$options
    if(opts.data){
        initData(vm)
    }
}

function initData(vm){
    let data=vm.$options.data
    data=typeof data ==='function'?data.call(vm):data
    vm._data=data
    observe(data)
    for(let key in data){
        myProxy(vm,'_data',key)
    }
}

function myProxy(vm,target,key){
    Object.defineProperty(vm,key,{
        get(){
            return vm[target][key]
        },
        set(newValue){
            if(newValue===vm[target][key])return
            else vm[target][key]=newValue
        }
    })
}