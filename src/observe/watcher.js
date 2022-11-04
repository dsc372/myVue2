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
        //异步更新，同步更新会造成性能浪费
        queueWatcher(this)
    }
}

let que=[]
let has={}//用于去重
let pending=false//防抖
function queueWatcher(watcher){
    if(!has[watcher.id]){
        que.push(watcher)
        has[watcher.id]=true
        if(!pending){//无论update多少次，最终只执行一次刷新
            nextTick(flushSchedulerQueue)//让flushSchedulerQueue异步执行
            pending=true
        }
    }
}
function flushSchedulerQueue(){
    que.forEach(watcher=>{
        watcher.get()
    })
    que=[]
    has={}
    pending=false
}


//把$nextTick函数和渲染函数处理成异步的
let callbacks=[]
let waiting=false
function flushCallbacks(){
    callbacks.forEach(cb=>cb())
    callbacks=[]
    waiting=false
}
export function nextTick(cb){
    callbacks.push(cb)
    if(!waiting){
        Promise.resolve().then(flushCallbacks)//源码中不只用了Promise，用了优雅降级
        waiting=true
    }
}

export default Watcher