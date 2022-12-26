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
    // const h3 = document.createElement("h3")
    // h3.textContent = this.title
    // return h3
    return createVNode("h3", {}, this.title)
  },
}).mount("#app")
