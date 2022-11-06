import Dep from "./observe/dep.js"
import { observe } from "./observe/index.js"
import Watcher, { nextTick } from "./observe/watcher"

export function initState(vm) {
  const opts = vm.$options
  if (opts.data) {
    initData(vm)
  }
  if (opts.computed) {
    initComputed(vm)
  }
  if (opts.watch) {
    initWatch(vm)
  }
}

function initData(vm) {
  function myProxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get() {
        return vm[target][key]
      },
      set(newValue) {
        if (newValue === vm[target][key]) return
        else vm[target][key] = newValue
      },
    })
  }
  let data = vm.$options.data
  data = typeof data === "function" ? data.call(vm) : data
  vm._data = data
  observe(data)
  for (let key in data) {
    myProxy(vm, "_data", key)
  }
}

function initComputed(vm) {
  //new Watcher()是为了缓存
  function defineComputed(target, key, userDef) {
    const setter = userDef.set || (() => {})
    Object.defineProperty(target, key, {
      get: createComputedGetter(key),
      set: setter,
    })
  }

  function createComputedGetter(key) {
    return function () {
      const watcher = this._computedWatchers[key]
      if (watcher.dirty) {
        watcher.evaluate()
      }
      if (Dep.target) {
        //要让computed中使用到的属性的dep也能被渲染watcher观察
        watcher.depend()
      }
      return watcher.value
    }
  }
  const computed = vm.$options.computed
  const watchers = (vm._computedWatchers = {})
  for (let key in computed) {
    let userDef = computed[key]
    let callback = typeof userDef === "function" ? userDef : userDef.get
    watchers[key] = new Watcher(vm, callback, { lazy: true })
    defineComputed(vm, key, userDef)
  }
}

function initWatch(vm) {
  function createWatcher(vm, key, handler) {
    //handler可能是字符串或函数
    if (typeof handler === "string") {
      handler = vm[handler]
    }
    return vm.$watch(key, handler)
  }
  let watch = vm.$options.watch
  for (let key in watch) {
    const handler = watch[key] //可能是字符串(调用methods中的方法)、数组、函数
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}

export function initMixinState(MyVue2) {
  MyVue2.prototype.$nextTick = nextTick

  MyVue2.prototype.$watch = function (expOrFn, cb) {
    new Watcher(this, expOrFn, { user: true }, cb)
  }
}
