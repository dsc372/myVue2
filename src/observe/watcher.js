import Dep from "./dep"

let id=0

class Watcher{//不同组件有不同的watcher
    constructor(vm,updateComponent,option){//vm为watcher所观察的实例，updateComponent为更新函数
        this.id=id++
        this.renderWatcher=option//这是否是一个渲染watcher
        this.deps=[]//存放被当前watcher观察的dep，计算属性和卸载组件时要用
        this.depsId=new Set()
        this.getter=updateComponent//getter意味着调用这个函数会渲染页面，渲染页面时可以发生取值操作
        this.get()
    }
    addDep(dep){
        if(!this.depsId.has(dep.id)){
            this.deps.push(dep)
            this.depsId.add(dep.id)
            dep.addSub(this)
        }
    }
    get(){
        Dep.target=this//创建渲染watcher时将当前渲染watcher挂在到Dep.target上，之后this.getter()时或调用_render会走到响应式属性的get()上
        this.getter()
        Dep.target=null//渲染完后清空
    }
    update(){
        this.get()
    }
}

export default Watcher