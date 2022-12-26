import { test, expect } from "vitest"
import { reactive } from "../index"

test("reactive should first", () => {
  // 一个原始对象
  const original = { foo: "bar" }
  // 一个代理对象
  const observed = reactive(original)

  // 测试：代理对象是全新的对象
  expect(observed).not.toBe(original)
  // 测试：代理对象能够访问原始对象的属性
  expect(observed.foo).toBe("bar")
  // 测试：代理对象能够修改原始对象的属性
  observed.foo = "baz"
  expect(original.foo).toBe("baz")
  // 测试：代理对象能够新增原始对象的属性
  observed.bar = "bar"
  expect(original.bar).toBe("bar")
  // 测试：代理对象能够删除原始对象的属性
  delete observed.bar
  expect(original.bar).toBe(undefined)
})
        