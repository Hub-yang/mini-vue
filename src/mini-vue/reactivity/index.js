// 被激活的副作用，此案例中就是componentUpdateFn
let activeEffect
// 为了方便外界调用，创建一个effect方法，将外界的副作用函数传入并赋值给activeEffect
export function effect(fn) {
  activeEffect = fn
}

// 实现reactive
export function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      const value = Reflect.get(...arguments)
      // 依赖收集
      track(target, key)
      return value
    },
    set(target, key, value) {
      const result = Reflect.set(...arguments)
      // 依赖触发
      trigger(target, key)
      return result
    },
    deleteProperty(target, key) {
      const result = Reflect.deleteProperty(...arguments)
      // 依赖触发
      trigger(target, key)
      return result
    },
  })
}

// 依赖收集：首先创建一个数据结构保存依赖关系：{ target : { key:[ fn1,fn2,... ] } }
// 创建一个WeakMap
const targetMap = new WeakMap()

function track(target, key) {
  // 判断是否存在被激活的副作用函数
  if (activeEffect) {
    let depsMap = targetMap.get(target)
    // 首次depsMap不存在，需要创建:键为当前target，值为Map对象
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()))
    }
    // 获取depsMap中key对应的Set
    let deps = depsMap.get(key)
    // 首次deps不存在，需要创建：键为当前key，值为一个Set
    if (!deps) {
      depsMap.set(key, (deps = new Set()))
    }
    // deps中添加当前被激活的副作用函数
    deps.add(activeEffect)
  }
  // console.log("targetMap===", targetMap)
}

// 依赖触发
function trigger(target, key) {
  // 先获取depsmap
  const depsMap = targetMap.get(target)
  // 再获取deps，执行内部依赖
  if (depsMap) {
    const deps = depsMap.get(key)
    if (deps) {
      deps.forEach((fn) => fn())
    }
  }
}
