import { get as _get, set as _set } from 'object-path-immutable'

import _flow from 'lodash/flow'

const $value = () => (fns) =>
  _flow(fns.map((fn) => (typeof fn !== 'function' ? () => fn : fn)))()

const $getData =
  ({ getData }) =>
  (args) =>
  (prev) => {
    if (args && args[0]) return getData(args[0] || '')
    return getData(prev)
  }

const $setData =
  ({ getData, setData }) =>
  (args) =>
  (prev) => {
    const [path, value] = args
    setData(path, value || prev)
    return getData(path, value || prev)
  }

const $log = () => () => (prev) => {
  console.log(prev)
  return prev
}

const $stringify = () => (args) => (prev) => {
  const [replacer, space] = args
  return JSON.stringify(prev, replacer, space)
}

const $map = () => (fns) => (prev) => {
  if (!prev) return null
  return prev.map((item, index) => _flow(fns)([item, index.toString()]))
}

const $template = () => (args) => (prev) => {
  const [source] = args
  const replacer = (o) => {
    if (Array.isArray(o)) {
      return o.map((p) => {
        if (p === '%%') return prev
        return replacer(p)
      })
    }
    if (typeof o === 'object') {
      let newObj = {}
      Object.keys(o).forEach((k) => {
        if (o[k] === '%%') newObj = prev
        else newObj[k] = replacer(o[k])
      })
      return newObj
    }
    if (typeof o === 'string') {
      return o
        .replace(/%%/g, prev)
        .replace(/%(\S+)%/g, (_m, group) => _get(prev, group) || [])
    }
    return o
  }
  return replacer(source)
}

const $fetch = () => (fns) => (url) => {
  fetch(url)
    .then((res) => res.json())
    .then((json) => {
      _flow(fns)(json)
    })
    .catch(console.error)
}

const actions = {
  $fetch,
  $getData,
  $log,
  $map,
  $setData,
  $stringify,
  $template,
  $value,
}

export default actions
