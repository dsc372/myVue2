//重写数组中的方法
let oldArrayProto=Array.prototype
export let newArrayProto=Object.create(oldArrayProto)
let methods=['push','pop','shift','unshift','reverse','sort','splice']
methods.forEach(method=>{
    newArrayProto[method]=function(...args){
        const res=oldArrayProto[method].call(this,...args)
        //若对数组的操作为添加数据，且添加的内容为对象，则需要劫持
        let inserted;
        switch(method){
            case 'push':
                inserted=args
                break
            case 'unshift':
                inserted=args
                break
            case 'splice':
                inserted=args.slice(2)
                break
            default:
                break 
        }
        if(inserted){
            this.__observe__.walkArray(inserted)//inserted是数组，此处对数组中的对象进行劫持
        }
        console.log(`${method}时要做的事`)
        this.__observe__.dep.notify()
        return res
    }
})
