/* eslint-disable no-unused-vars */
import {
  del as _del,
  get as _get,
  insert as _insert,
  push as _push,
  set as _set,
  update as _update,
} from "object-path-immutable"

import _flow from "lodash/flow"
import { iterPath } from "../helpers"

const eq = {
  "===": (a, b) => a === b,
  "!==": (a, b) => a !== b,
  "<": (a, b) => a < b,
  ">": (a, b) => a > b,
  "<=": (a, b) => a <= b,
  ">=": (a, b) => a >= b,
}

const actions = {
  $flow: () => (args) => (prev) => {
    const actionArgs = args.map((arg) => {
      if (typeof arg !== "function") return () => arg
      return arg
    })
    return _flow(actionArgs)(prev)
  },
  $getStore:
    ({ getStore }) =>
    (args) => {
      return getStore(args[0])
    },
  $setStore:
    ({ setStore }) =>
    (args) =>
    (prev) => {
      const [path] = args
      if (!prev) return setStore(path, [])
      return setStore(path, prev)
    },
  $update: () => (args) => (prev) => {
    const [path, fn] = args
    return _update(prev, path, fn)
  },
  $delete: () => (args) => (prev) => {
    const [path] = args
    return _del(prev, path)
  },
  $insert: () => (args) => (prev) => {
    const [path, newValue, index] = args
    return _insert(prev, path, newValue, index)
  },
  $push: () => (args) => (prev) => {
    const [path, newValue] = args
    return _push(prev, path, newValue)
  },
  $log: () => () => (prev) => {
    return console.log(prev)
  },
  $get: () => (args) => (prev) => {
    const [path] = args
    return _get(prev, path)
  },
  $stringify: () => (args) => (prev) => {
    return JSON.stringify(prev, ...args)
  },
  $parse: () => (args) => (prev) => {
    try {
      return JSON.parse(prev, args)
    } catch (err) {
      console.error(err.message)
    }
  },
  $fetch: () => (args) => (prev) => {
    return fetch(prev)
      .then((response) => response.json())
      .then((json) => _flow(args)(json))
      .catch((err) => console.error(err.message))
  },
  $map: () => (args) => (prev) => {
    if (!prev) return
    return prev.map((p) => _flow(args)(p))
  },
  $template: () => (args) => (prev) => {
    const source = args[0]
    const contFn = (o) => typeof o === "string"
    const replacer = (value) =>
      value.replace(/\{\{(.*?)\}\}/g, (_, matchGroup) => _get(prev, matchGroup))
    return iterPath(source, replacer, [contFn])
  },
  $length: () => () => (prev) => {
    return prev.length
  },
  $check: () => (args) => (prev) => {
    const [op, comparator, valueTrue, valueFalse] = args
    return eq[op](
      prev,
      typeof comparator === "function" ? comparator() : comparator
    )
      ? valueTrue
      : valueFalse
  },
  $assign: () => (args) => () => {
    return args.join("")
  },
}

export default actions
