//h() _c()
export function createElementVNode(vm, tag, props, ...children) {
  if (props == null) props = {}
  let key = props.key
  if(key){
    delete props.key
  }
  return vnode(vm, tag, key, props, children)
}

//_v()
export function createTextVNode(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text)
}

//创建描述虚拟节点的对象，可以增加一些自定义属性
function vnode(vm, tag, key, props, children, text) {
  //key为元素的标识，一般放在props中
  return {
    vm,
    tag,
    key,
    props,
    children,
    text,
  }
}
