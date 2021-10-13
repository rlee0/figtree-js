import * as requiredHooks from "../../hooks"

import { get as _get, set as _set } from "object-path-immutable"

import React from "react"
import _flow from "lodash/flow"
import _isEmpty from "lodash/isEmpty"
import _omit from "lodash/omit"
import deepmerge from "deepmerge"
import iterPath from "iter-path"
import { overwriteMerge } from "../../helpers"

const iterPathStopOnElement = (value) => {
  if (!value) return true
  if (typeof value !== "object") return true
  if (value.as !== undefined) return true
  return false
}

export const Element = ({ entry, raw }) => {
  const getStore = requiredHooks.getStore()
  const setStore = requiredHooks.setStore()

  const applyTemplates = (obj) => {
    const template = getStore(`elements.${obj.as}`)
    if (!template) return obj
    const overrides = _omit(obj, "as")
    const replaceOptions = { arrayMerge: overwriteMerge }
    const replaced = deepmerge(template, overrides, replaceOptions)
    return applyTemplates(replaced)
  }
  const applyActions = (obj) => {
    const contIter = (o) => o.$ !== undefined
    const actionReplacer = (o) => {
      const actionType = Object.keys(o)[0]
      const action = getStore(`actions.${actionType}`)
      if (!action) return o
      const args = o[actionType]
      const actionArgs = iterPath(args, actionReplacer, [
        (o) => typeof o === "object",
        () => false,
      ])
      return action({ getStore, setStore })(actionArgs)
    }
    const workflowReplacer = (o) => {
      let isFunction = false
      const workflow = o.$.map((actionRef, i) => {
        const action = actionReplacer(actionRef)
        if (typeof action !== "function") return () => action
        if (i === 0) isFunction = true
        return action
      })
      return isFunction ? (e) => workflow.map((w) => w(e)) : _flow(workflow)()
    }
    return iterPath(obj, workflowReplacer, [contIter, iterPathStopOnElement])
  }
  const applyComponents = (obj) => {
    if (!obj || !obj.as || typeof obj.as !== "string") return obj
    const [componentPath, ...subComponentPaths] = obj.as.split(".")
    const subComponentPath = subComponentPaths.join(".")
    const component = getStore(`components.${componentPath}`)
    if (!component) return obj
    if (!subComponentPath) return _set(obj, "as", component)
    return _set(obj, "as", _get(component, subComponentPath))
  }
  const applyChildren = (obj) => {
    if (!obj) return obj
    if (!obj.children) return obj
    if (typeof obj.children !== "object") return obj
    if (_isEmpty(obj.children)) return obj
    const createChildren = (o, childEntry) => {
      if (typeof o === "function") return o()
      if (typeof o !== "object") return o
      if (Array.isArray(o)) {
        return o.map((child, c) => {
          if (!child) return null
          return createChildren(child, `${childEntry}.children.${c}`)
        })
      }
      return (
        <Element key={childEntry} entry={`${childEntry}.children`} raw={o} />
      )
    }
    return _set(obj, "children", createChildren(obj.children, entry))
  }
  const el = raw || getStore(`elements.${entry}`)
  if (!el) return null
  const element = _flow([
    applyTemplates,
    applyActions,
    applyComponents,
    applyChildren,
  ])(el)
  if (_isEmpty(element)) return null
  return <ElementDisplay {...element} id={entry} />
}

const ElementDisplay = React.memo(({ as, children, ...props }) => {
  return React.createElement(as, props, children)
})

ElementDisplay.displayName = "ElementDisplay"

export default Element
