//h() _c()

function isReservedTag(tag){
  return ['a','div','p','button','span','ul','li','span','img'].includes(tag)
}
export function createElementVNode(vm, tag, props, ...children) {
  if (props == null) props = {}
  let key = props.key
  if(key){
    delete props.key
  }
  if(isReservedTag(tag)){//如果是原始标签
    return vnode(vm, tag, key, props, children)
  }else{
    let Ctor=vm.$options.components[tag]
    return createComponentVnode(vm,tag,key,props,children,Ctor)
  }
}

//_v()
export function createTextVNode(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text)
}

//创建描述虚拟节点的对象，可以增加一些自定义属性
function vnode(vm, tag, key, props, children, text,componentOptions) {
  //key为元素的标识，一般放在props中
  return {
    vm,
    tag,
    key,
    props,
    children,
    text,
    componentOptions,
  }
}

//创建组件的虚拟节点
function createComponentVnode(vm,tag,key,props,children,Ctor){
  if(typeof Ctor==='object'){//Ctor可能是对象
    Ctor=vm.$options._base.extend(Ctor)
  }
  props.hook={
    init(vnode){
      let instance=vnode.componentInstance=new vnode.componentOptions.Ctor
      instance.$mount()//创建instance.$el
    }
  }
  return vnode(vm,tag,key,props,children,null,{Ctor})
}

export function isSameVnode(vNode1,vNode2){
  return vNode1.tag===vNode2.tag&&vNode1.key===vNode2.key
}
