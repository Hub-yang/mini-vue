// import { createApp } from "vue"
import "./style.css"
import App from "./App.vue"
// 引入createVNode
import { createVNode } from "./mini-vue/runtime-core/vnode"

// 根据传入的App组件为模板创建app实例，调用实例的mount方法，接收一个选择器，将app的被描述为dom的数据追加到选择器对应容器中
// createApp(App).mount("#app")

// 手写部分
// 引入createApp方法
import { createApp } from "./mini-vue"
// 观察传入的App组件(有render和setup函数)，后续先使用render渲染简单的结构
createApp({
  data() {
    return {
      title: "Hello,minivue!",
    }
  },
  render() {
    // 对title类型进行判断，做不同处理
    if (Array.isArray(this.title)) {
      return createVNode(
        "div",
        {},
        this.title.map((item) => createVNode("h3", {}, item))
      )
    } else {
      return createVNode("h3", {}, this.title)
    }
  },
  mounted() {
    // 验证字符串变字符串的更新
    setTimeout(() => {
      this.title = "666"
    }, 1000)
    // 验证字符串变数组的更新
    setTimeout(() => {
      this.title = ["one", "two"]
    }, 2000)
    // // 验证数组变字符串的更新
    // setTimeout(() => {
    //   this.title = "888"
    // }, 3000)
    // // 验证数组变数组的更新(增删改)
    // setTimeout(() => {
    //   this.title = ["three", "four"]
    // }, 4000)
    // setTimeout(() => {
    //   this.title = ["five"]
    // }, 5000)
  },
}).mount("#app")
