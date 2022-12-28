// 5.引入createVNode
import { createVNode } from "./vnode"
// 4.引入reactive，代理data；引入effect，收集激活的副作用函数
import { reactive, effect } from "../reactivity"
// runtime-core
// 2.创建自定义渲染器（custom renderer api）
export function createRenderer(options) {
  // render方法负责渲染组件内容,其中平台相关代码通过option实现
  // 从options中解构出需要的方法并重新命名，重命名是为了增加辨识度，避免冲突
  const {
    createElement: hostCreateElement,
    insert: hostInsert,
    setElementText: hostSetElementText,
    remove: hostRemove,
    parentElement: hostParentElement,
  } = options
  const render = (vnode, container) => {
    // // 获取宿主元素
    // const container = options.querySelector(selector)
    // // 获取要渲染的元素（调用rootComponent的render方法，这里注意修正一下this，因为要拿data里的数据，详情看main中的render函数）
    // // 使用代理的data
    // const observed = reactive(rootComponent.data())
    // // 定义组件更新函数
    // const componentUpdateFn = () => {
    //   // 更新函数要做的事
    //   const el = rootComponent.render.apply(observed)
    //   // 测试值的更新，更新之前先将容器内容清空，注意源码中是没有这个方法的
    //   options.setElementText(container, "")
    //   // 追加元素到宿主
    //   options.insert(el, container)
    // }
    // // 收集激活的副作用函数,这里就是componentUpdateFn
    // effect(componentUpdateFn)
    // // 初始化时要调用一次组件更新函数
    // componentUpdateFn()
    // 新版render内容
    // 首先判断vnode，如果存在，则为mount或者patch，否则为unmount
    if (vnode) {
      // patch中第一个参数为是否存在上一次的计算结果，上一次的计算结果通常保存在container的_vnode中，一般来讲第一次patch应该为空,然后每次都进行保存
      patch(container._vnode || null, vnode, container)
      container._vnode = vnode
    }
  }

  //5.1patch方法：n1:老节点；n2:新节点
  const patch = (n1, n2, container) => {
    // 根据n2判断节点类型：如果是字符串说明是原生节点element；如果是对象说明是组件
    // 从n2结垢出type进行判断
    const { type } = n2
    if (typeof type === "string") {
      // 处理原生节点
      processElement(n1, n2, container)
    } else {
      // 处理组件
      processComponent(n1, n2, container)
    }
  }

  // 5.2处理组件
  const processComponent = (n1, n2, container) => {
    // 如果n1不存在，说明是首次挂载，即根组件的挂载
    if (n1 === null) {
      // 挂载流程
      mountComponent(n2, container)
    } else {
      // patch流程，后续添加
    }
  }

  // 组件挂载流程做三件事
  // 1.组件实例化
  // 2.状态初始化（响应式）
  // 3.副作用安装
  const mountComponent = (initialVNode, container) => {
    // 创建组件实例
    const instance = {
      data: {},
      vnode: initialVNode,
      isMounted: false,
    }
    // 初始化组件状态（我们的例子中即做根组件data的响应式）
    const { data: dataOptions } = instance.vnode.type
    instance.data = reactive(dataOptions())

    // 安装(收集)渲染函数副作用
    setupRenderEffect(instance, container)
  }

  const setupRenderEffect = (instance, container) => {
    // 声明组件更新函数
    const componentUpdateFn = () => {
      const { render } = instance.vnode.type
      // 判断当前组件是否挂载，没有则走创建流程，有则走更新流程
      if (!instance.isMounted) {
        // 创建流程
        // 执行组件render，获取其vnode（首次为根组件的render）
        // 将获取的vnode保存在instance的subtree中，供下次更新作为旧节点进行比较
        const vnode = (instance.subtree = render.call(instance.data))
        // 递归patch当前vnode,首次第一个参数传null
        patch(null, vnode, container)
        // 执行生命周期挂载钩子
        if (instance.vnode.type.mounted) {
          instance.vnode.type.mounted.call(instance.data)
        }
        // 更新isMounted标识符
        instance.isMounted = true
      } else {
        // 更新流程
        // 拿出上一次的vnode
        const preVnode = instance.subtree
        // 执行render拿到当前的vnode
        const nextVnode = render.call(instance.data)
        // 保存当前的vnode
        instance.subtree = nextVnode
        // 执行patch，传入新旧两个vnode
        patch(preVnode, nextVnode)
      }
    }
    // 建立更新机制,收集被激活的副作用
    effect(componentUpdateFn)
    // 首次执行组件更新函数
    componentUpdateFn()
  }

  // 5.3处理节点
  const processElement = (n1, n2, container) => {
    // 如果n1不存在则是首次执行，需要创建节点(转换真实dom的操作)
    if (n1 === null) {
      // 挂载阶段
      mountElement(n2, container)
    } else {
      // 更新阶段
      patchElement(n1, n2)
    }
  }

  const mountElement = (vnode, container) => {
    // 创建真实dom节点,这里将创建好的节点保存在vnode的el中供后续更新使用
    const el = (vnode.el = hostCreateElement(vnode.type))
    // 执行判断，设置节点内容
    // 文本则直接赋值
    if (typeof vnode.children === "string") {
      el.textContent = vnode.children
      // 数组则需要递归创建子节点
    } else {
      vnode.children.forEach((child) => patch(null, child, el))
    }

    // 追加元素到宿主
    hostInsert(el, container)
  }

  // 编写patchElement
  const patchElement = (n1, n2) => {
    // 获取要更新的元素节点
    // 元素挂载阶段已经将元素保存在了vnode的el中，可以从n1也就是老节点的vnode中直接获取，然后再将el保存在新节点的vnode也就是n2中，供下一次更新使用
    const el = (n2.el = n1.el)
    // 更新type相同的节点，实际上还要考虑key（这里省略key的判断）
    if (n1.type === n2.type) {
      // 获取新旧vnode的子元素
      const oldCh = n1.children
      const newCh = n2.children
      // 根据子元素情况做不同处理
      // 如果老节点是字符串
      if (typeof oldCh === "string") {
        // 新节点也是字符串，则为字符串的替换
        if (typeof newCh === "string") {
          hostSetElementText(el, newCh)
        } else {
          // 新节点是其他子元素，则先清空文本，在进行批量创建追加
          hostSetElementText(el, "")
          // patch创建并追加子元素(批量处理)
          newCh.forEach((v) => patch(null, v, el))
        }
        // 如果老节点是数组
      } else {
        // 新节点是字符串，则清空el并设置文本,代码表示为直接将文本赋值给el
        if (typeof newCh === "string") {
          hostSetElementText(el, newCh)
          // 新节点也是数组：最复杂的情况，需要diff算法
        } else {
          updateChildren(oldCh, newCh, el)
        }
      }
    } else {
      console.log("新旧节点不同")
      // 保存父节点
      const parent = hostParentElement(n1.el)
      // 删除旧节点
      hostRemove(n1.el)
      // 创建新节点
      patch(null, n2, parent)
    }
  }

  // 编写两个数组情况的更新：最简单的diff算法
  const updateChildren = (oldCh, newCh, parent) => {
    // 最简单的diff思路：新旧数组直接进行比较，共同部分不进行比较直接更新，再比较两者长度，新的长则将追加多余部分，老的长则删除多余部分
    // 第一步：获取较短的数组长度，即为新旧节点的共同部分，循环进行patch更新，注意是更新
    let len = Math.min(oldCh.length, newCh.length)
    for (let i = 0; i < len; i++) {
      patch(oldCh[i], newCh[i])
    }
    // 第二步：判断两者长度，新数组长则将剩余部分创建追加，老数组长则将剩余部分删除
    if (newCh.length > oldCh.length) {
      // 截取剩余部分进行创建追加
      newCh.slice(len).forEach((child) => patch(null, child, parent))
    } else {
      // 截取剩余部分进行删除，删除方法单独创建,注意这里是删除虚拟dom也就是child的el，这才是真实节点
      oldCh.slice(len).forEach((child) => hostRemove(child.el))
    }
  }
  return {
    render,
    // 提供给开发者的createApp方法,之所以要使用高阶函数封装一下是为了扩展createApp方法，使用render配置实现通用渲染，平台无关
    createApp: createAppApi(render),
  }
}

// 3.创建createAppApi方法（通用代码，不涉及平台特有代码）
export function createAppApi(render) {
  return function createApp(rootComponent) {
    // app为应用实例，所有开发者可以调用的方法在这里实现
    const app = {
      mount(container) {
        // 这里创建根组件的虚拟DOM,这里注意此时传入的type是一个对象
        const vnode = createVNode(rootComponent)
        // 这里render其实是传入根组件的vnode，并将根组件的vnode转换为真实dom，将其追加到宿主元素
        render(vnode, container)
      },
    }
    return app
  }
}
