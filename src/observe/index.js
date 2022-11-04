import { newArrayProto } from "./array"
import Dep from "./dep"

class Observe {
  constructor(data) {
    //vue2中Obejec.defineProperty只能劫持已存在的属性（为此vue2里面写了一些API，如$set,$delete）
    Object.defineProperty(data, "__observe__", {
      value: this, //这里的this是指class Observe这个实例，赋值给data是因为重写七个数组方法时要用到walkArray,同时可以作为已劫持的标识
      enumerable: false, //设置为不可枚举，不然会死循环
    })
    if (Array.isArray(data)) {
      //若对数组中的每一项都进行劫持，则会严重影响性能，所以在这里修改7个方法用来响应式修改数组本身
      data.__proto__ = newArrayProto
      this.walkArray(data)
    } else {
      this.walkObj(data)
    }
  }
  walkObj(data) {
    Object.keys(data).forEach((key) => defineReactive(data, key, data[key]))
  }
  walkArray(data) {
    data.forEach((item) => observe(item)) //数组中的内容若为对象，仍然要劫持
  }
}

export function defineReactive(target, key, value) {
  //形成了闭包，value不会被销毁
  observe(value) //若value为对象(包括数组），则对对象中的所有属性进行劫持（数组会在劫持过程中被单独处理）
  let dep =new Dep()
  Object.defineProperty(target, key, {
    get() {
      console.log("get时要做的事")
      if(Dep.target){//只有在watcher中get这个属性时才会有Dep.target，才需和这个watcher产生联系
        dep.depend()//让这个属性的dep记住调用这个属性的组件的watcher,同时watcher观察这个dep
      }
      return value
    },
    set(newValue) {
      if (value === newValue) return
      observe(newValue) //若newValue为对象，则对对象中的所有属性进行劫持（数组会在劫持过程中被单独处理）
      value = newValue
      console.log("set时要做的事")
      dep.notify()//通知所有观察该dep的watcher更新
    },
  })
}

export function observe(data) {
  if (typeof data !== "object" || data === null) return
  //如果一个对象已经被劫持过了，那就不需要再被劫持了（要判断一个对象是否被劫持过，可以添加一个__observe__实例，用实例来判断是否被劫持了
  if(data.__observe__ instanceof Observe)return data
  return new Observe(data)
}
