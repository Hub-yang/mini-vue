import { createRenderer } from "../runtime-core"

// runtime-dom
let renderer

// 平台相关代码
// dom平台
const rendererOptions = {
  querySelector(selector) {
    return document.querySelector(selector)
  },
  // insert统一一下appendChild和insertBefore
  insert(child, parent, anchor) {
    parent.insertBefore(child, anchor || null)
  },
  setElementText(el, text) {
    el.textContent = text
  },
  // 创建节点
  createElement(tag) {
    return document.createElement(tag)
  },
  // 删除节点
  remove(el) {
    // 查找父节点
    const parent = el.parentElement
    if (parent) {
      parent.removeChild(el)
    }
  },
}
// ensureRenderer确保renderer单例
function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions))
}
export function createApp(rootComponent) {
  const app = ensureRenderer().createApp(rootComponent)
  // 先保存mount方法，再对其进行扩展
  const mount = app.mount
  app.mount = function (selectorOrContainer) {
    // 这里简写了，直接认为传入的是选择器，正常情况下需要进行判断。
    const container = document.querySelector(selectorOrContainer)
    mount(container)
  }
  return app
}
