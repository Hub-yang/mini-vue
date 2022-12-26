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
}
// ensureRenderer确保renderer单例
function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions))
}
export function createApp(rootComponent) {
  return ensureRenderer().createApp(rootComponent)
}
