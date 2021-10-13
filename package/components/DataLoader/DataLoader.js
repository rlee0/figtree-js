import * as requiredHooks from "../../hooks"

import _get from "lodash/get"
import _isEmpty from "lodash/isEmpty"
import _isEqual from "lodash/isEqual"
import _set from "lodash/set"
import actions from "../../actions"
import { useEffect } from "react"

// const iterChildren =
//   ({ hooks }) =>
//   (node) => {
//     return Children.toArray(node).map((child) => {
//       if (!isValidElement(child)) return child
//       const type = typeof child.type === "string" ? child.type : child.type.name
//       if (type === "Element") return cloneElement(child, { hooks })
//       return cloneElement(
//         child,
//         child.props,
//         iterChildren({ hooks })(child.props.children)
//       )
//     })
//   }

const DataLoader = ({ children, ...raw }) => {
  const getStore = requiredHooks.getStore()
  const setStore = requiredHooks.setStore()

  useEffect(() => {
    if (!raw) return
    const newStore = { actions, ...raw }
    if (_isEqual(getStore(""), newStore)) return
    setStore("", newStore)
  }, [])

  return children
}

export default DataLoader
