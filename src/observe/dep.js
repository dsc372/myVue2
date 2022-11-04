let id=0

class Dep{//被观察者，每一个响应式数据都有一个dep
    constructor(){
        this.id=id++
        this.subs=[];//存放观察当前dep的watcher
    }
    depend(){//让这个属性的dep记住调用这个属性的组件的watcher(addDep()中去重判断后会调用addSub()),同时watcher观察这个dep
        Dep.target.addDep(this)
    }
    addSub(watcher){
        this.subs.push(watcher)
    }
    notify(){
        this.subs.forEach(watcher=>{watcher.update()})
    }
}

Dep.target=null

export default Dep