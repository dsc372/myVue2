import { isSameVnode } from "./index"

export function createEle(vnode) {
  //通过虚拟DOM创建真实DOM
  let { tag, props, children, text } = vnode
  if (createComponent(vnode)) {
    //vnode为组件节点
    return vnode.componentInstance.$el //createComponent(vnode)会调用init，init会创建vnode.componentInstance
  }
  if (typeof tag === "string") {
    //元素节点
    vnode.el = document.createElement(tag) //将真实节点与虚拟节点对应起来，后续如果修改属性方便操作
    patchProps(vnode.el, {}, props)
    children.forEach((child) => {
      vnode.el.appendChild(createEle(child))
    })
  } else {
    //此时tag===undefined，为文本节点
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}

function createComponent(vnode) {
  let i = vnode.props
  if (i && (i = i.hook) && (i = i.init)) {
    //此时i为vnode.props.hook.init
    i(vnode)
  }
  if (vnode.componentInstance) {
    return true
  }
}

function patchProps(el, oldProps = {}, newProps = {}) {
  if (el) {//组件的虚拟节点调用该函数时el为undefined
    //老的属性中有的，新的属性中没有就删除
    let oldStyles = oldProps.style || {}
    let newStyles = newProps.style || {}
    for (let key in oldStyles) {
      if (!newStyles[key]) {
        el.style[key] = ""
      }
    }
    for (let key in oldProps) {
      if (!newProps) {
        el.removeAttribute(key)
      }
    }
    //用新属性覆盖旧属性
    for (let key in newProps) {
      if (key === "style") {
        for (let styleName in newProps.style) {
          el.style[styleName] = newProps.style[styleName]
        }
      } else {
        el.setAttribute(key, newProps[key])
      }
    }
  }
}

export function patch(oldNode, vnode) {
  //既有初始化的功能，又有更新的逻辑
  if (!oldNode) {
    //vnode为组件的虚拟节点
    return createEle(vnode)
  }
  const isRealElement = oldNode.nodeType //nodeType属性是元素固有的
  if (isRealElement) {
    const parentElm = oldNode.parentNode //parentNode属性是元素固有的
    let newElm = createEle(vnode)
    parentElm.insertBefore(newElm, oldNode.nextSibling) //插入新的真实DOM
    parentElm.removeChild(oldNode) //删除老的真实DOM
    return newElm
  } else {
    //oldVNode也是虚拟节点，比较两个虚拟节点，更新有变化的部分
    patchVnode(oldNode, vnode)
  }
}

function patchVnode(oldNode, vnode) {
  //1.两个节点不是同一个节点，直接删除老的用新的替换
  if (!isSameVnode(oldNode, vnode)) {
    //元素节点
    let el = createEle(vnode)
    oldNode.el.parentNode.replaceChild(el, oldNode.el)
    return el
  }
  //2.两个节点是同一个节点（通过节点的tag和key判断），比较两个节点的属性是否有差异，将差异的更新
  let el = (vnode.el = oldNode.el)
  if (!oldNode.tag) {
    //文本节点
    if (oldNode.text !== vnode.text) {
      el.textContent = vnode.text
    }
  }
  patchProps(el, oldNode.props, vnode.props)
  //3.两个节点比较完毕后，就需要比较二者的子节点
  let oldChildren = oldNode.children || []
  let newChildren = vnode.children || []
  //3.1一方有儿子，一方没儿子
  //3.2双方都有儿子
  if (oldChildren.length > 0 && newChildren.length > 0) {
    //需要完整的diff算法
    updateChild(el, oldChildren, newChildren)
  } else if (newChildren.length > 0) {
    mountChildren(el, newChildren)
  } else if (oldChildren.length > 0) {
    el.innerHTML = ""
  }
  return el
}

function mountChildren(el, children) {
  for (let i = 0; i < children.length; i++) {
    let child = children[i]
    el.appendChild(createEle(child))
  }
}

function updateChild(el, oldChildren, newChildren) {
  let oldStartIndex = 0
  let newStartIndex = 0
  let oldEndIndex = oldChildren.length - 1
  let newEndIndex = newChildren.length - 1

  let oldStartNode = oldChildren[0]
  let newStartNode = newChildren[0]
  let oldEndNode = oldChildren[oldEndIndex]
  let newEndNode = newChildren[newEndIndex]

  function makeIndexByKey(children) {
    let map = {}
    children.forEach((child, index) => {
      map[child.key] = index
    })
    return map
  }

  let map = makeIndexByKey(oldChildren)

  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (!oldStartNode) {
      //乱序时会置空移走的节点
      oldStartNode = oldChildren[++oldStartIndex]
    } else if (!oldEndNode) {
      //乱序时会置空移走的节点
      oldEndNode = oldChildren[--oldEndIndex]
    } else if (isSameVnode(oldStartNode, newStartNode)) {
      patchVnode(oldStartNode, newStartNode)
      oldStartNode = oldChildren[++oldStartIndex]
      newStartNode = newChildren[++newStartIndex]
    } else if (isSameVnode(oldEndNode, newEndNode)) {
      patchVnode(oldEndNode, newEndNode)
      oldEndNode = oldChildren[--oldEndIndex]
      newEndNode = newChildren[--newEndIndex]
    } else if (isSameVnode(oldEndNode, newStartNode)) {
      patchVnode(oldEndNode, newStartNode)
      el.insertBefore(oldEndNode.el, oldStartNode.el) //insertBefore会将原来的元素移走
      oldEndNode = oldChildren[--oldEndIndex]
      newStartNode = newChildren[++newStartIndex]
    } else if (isSameVnode(oldStartNode, newEndNode)) {
      patchVnode(oldStartNode, newEndNode)
      el.insertBefore(oldStartNode.el, oldEndNode.el.nextSibling)
      oldStartNode = oldChildren[++oldStartIndex]
      newEndNode = newChildren[--newEndIndex]
    } else {
      //乱序，根据老列表做一个映射，用新的去找，找到则移动，找不到则添加，最后删除多余的
      let moveIndex = map[newStartNode.key]
      if (moveIndex !== undefined) {
        let moveNode = oldChildren[index]
        el.insertBefore(moveNode.el, oldStartNode.el)
        oldChildren[moveIndex] = undefined
        patchVnode(moveNode, newStartNode)
      } else {
        el.insertBefore(createEle(newStartNode), oldStartNode.el)
      }
      newStartNode = newChildren[++newStartIndex]
    }
  }
  if (newStartIndex <= newEndIndex) {
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      let childEl = createEle(newChildren[i])
      let anchor = newChildren[newEndIndex + 1]
        ? newChildren[newEndIndex + 1].el
        : null
      el.insertBefore(childEl, anchor)
    }
  }
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      if (oldChildren[i]) {
        //乱序时会置空移走的节点
        let childEl = oldChildren[i].el
        el.removeChild(childEl)
      }
    }
  }
}
