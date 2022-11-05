import Dep, { popTarget, pushTarget } from "./dep"

let id = 0

class Watcher {
  //不同组件有不同的watcher
  constructor(vm, expOrFn, option,cb) {//exOrFn为回触发属性get()的字符串货或函数，cb为watch的watcher的回调
    //vm为watcher所观察的实例，callback为回调函数
    this.id = id++
    this.vm = vm
    this.renderWatcher = option //这是否是一个渲染watcher
    this.deps = [] //存放被当前watcher观察的dep，计算属性和卸载组件时要用
    this.depsId = new Set()
    if(typeof expOrFn==='string'){
      this.getter=function(){
        return vm[expOrFn]
      }
    }else{
      this.getter = expOrFn //getter意味着调用这个函数会发生取值操作
    }
    this.cb=cb
    this.lazy = option.lazy
    this.dirty = this.lazy
    this.user=option.user
    this.value=this.lazy ? undefined : this.get()//用于存放watch的oldValue
  }
  addDep(dep) {
    if (!this.depsId.has(dep.id)) {
      this.deps.push(dep)
      this.depsId.add(dep.id)
      dep.addSub(this)
    }
  }
  evaluate() {
    this.value = this.get()
    this.dirty = false
  }
  get() {
    pushTarget(this) //创建渲染watcher时将当前渲染watcher挂在到Dep.target上，之后this.getter()时会调用_render会走到响应式属性的get()上
    let value = this.getter.call(this.vm)
    popTarget() //渲染完后清空
    return value
  }
  depend(){//要让computed中使用到的属性的dep也能被渲染watcher观察
    let i=this.deps.length
    while(i--){
        this.deps[i].depend()
    }
  }
  update() {
    if (this.lazy) {
      this.dirty = true//重新渲染时会重新取值
    } else {
      //异步更新，同步更新会造成性能浪费
      queueWatcher(this)
    }
  }
  run(){//update后要做的事
    let oldValue=this.value
    let newValue=this.get()
    if(this.user){
      this.cb.call(vm,oldValue,newValue)
    }
  }
}

let que = []
let has = {} //用于去重
let pending = false //防抖
function queueWatcher(watcher) {
  if (!has[watcher.id]) {
    que.push(watcher)
    has[watcher.id] = true
    if (!pending) {
      //无论update多少次，最终只执行一次刷新
      nextTick(flushSchedulerQueue) //让flushSchedulerQueue异步执行
      pending = true
    }
  }
}
function flushSchedulerQueue() {
  que.forEach((watcher) => {
    watcher.run()
  })
  que = []
  has = {}
  pending = false
}

//把$nextTick函数和渲染函数处理成异步的
let callbacks = []
let waiting = false
function flushCallbacks() {
  callbacks.forEach((cb) => cb())
  callbacks = []
  waiting = false
}
export function nextTick(cb) {
  callbacks.push(cb)
  if (!waiting) {
    Promise.resolve().then(flushCallbacks) //源码中不只用了Promise，用了优雅降级
    waiting = true
  }
}

export default Watcher
