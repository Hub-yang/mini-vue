// runtime-core
// 2.创建自定义渲染器（custom renderer api）
export function createRenderer(options) {
  // render方法负责渲染组件内容,其中平台相关代码通过option实现
  const render = (rootComponent, selector) => {
    // 获取宿主元素
    const container = options.querySelector(selector)
    // 获取要渲染的元素（调用rootComponent的render方法，这里注意修正一下this，因为要拿data里的数据，详情看main中的render函数）
    const el = rootComponent.render.apply(rootComponent.data())
    // 追加元素到宿主
    options.insert(el, container)
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
        render(rootComponent, selector)
      },
    }
    return app
  }
}
