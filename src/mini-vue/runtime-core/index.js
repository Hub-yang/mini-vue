// 5.引入createVNode
import { createVNode } from "./vnode"
// 4.引入reactive，代理data；引入effect，收集激活的副作用函数
import { reactive, effect } from "../reactivity"
// runtime-core
// 2.创建自定义渲染器（custom renderer api）
export function createRenderer(options) {
  // render方法负责渲染组件内容,其中平台相关代码通过option实现
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

    //patch方法：n1:老节点；n2:新节点
    const patch = (n1, n2, container) => {
      // 根据n2判断节点类型：如果是字符串说明是原生节点element；如果是对象说明是组件
      // 从n2结垢出type进行判断
      const { type } = n2
      if (typeof type === "string") {
        // 处理原生节点
        processElement(...arguments)
      } else {
        // 处理组件
        processComponent(...arguments)
      }
    }

    // 处理组件
    const processComponent = (n1, n2, container) => {
      // 如果n1不存在，说明是首次挂载，即根组件的挂载
      if (n1 === null) {
        // 挂载流程
        mountComponent(n2, container)
      } else {
        // patch流程
      }
    }

    // 挂载流程做三件事
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
      mount(selector) {
        // 这里创建根组件的虚拟DOM,这里注意此时传入的type是一个对象
        const vnode = createVNode(rootComponent)
        // 这里render其实是传入根组件的vnode，并将根组件的vnode转换为真实dom，将其追加到宿主元素
        render(vnode, selector)
      },
    }
    return app
  }
}
