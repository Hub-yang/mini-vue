export function createVNode(type, props, children) {
  // 返回一个虚拟DOM，即一个js对象
  return { type, props, children }
}
