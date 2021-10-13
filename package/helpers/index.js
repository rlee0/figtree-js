import _concat from "lodash/concat"
import _flatMap from "lodash/flatMap"
import _forOwn from "lodash/forOwn"
import _has from "lodash/has"
import _isEqual from "lodash/isEqual"
import _transform from "lodash/transform"
import deepmerge from "deepmerge"

export const combineMerge = (target, source, options) => {
  const destination = target.slice()
  source.forEach((item, index) => {
    if (typeof destination[index] === "undefined") {
      destination[index] = options.cloneUnlessOtherwiseSpecified(item, options)
    } else if (options.isMergeableObject(item)) {
      destination[index] = deepmerge(target[index], item, options)
    } else if (target.indexOf(item) === -1) {
      destination.push(item)
    }
  })
  return destination
}

export const overwriteMerge = (_destinationArray, sourceArray) => sourceArray

export function diff(base, object) {
  if (!object) {
    throw new Error(`The object compared should be an object: ${object}`)
  }
  if (!base) return object
  const result = _transform(object, (result, value, key) => {
    if (!_has(base, key)) result[key] = value
    if (!_isEqual(value, base[key])) {
      result[key] =
        typeof value === "object" && typeof base[key] === "object"
          ? diff(base[key], value)
          : value
    }
  })
  _forOwn(base, (_value, key) => {
    if (!_has(object, key)) result[key] = undefined
  })
  return result
}

export const getAllPaths = (obj, parentKey) => {
  let result
  if (Array.isArray(obj)) {
    result = _flatMap(obj, (o, idx) =>
      getAllPaths(o, parentKey ? `${parentKey}.${idx}` : idx)
    )
  } else if (typeof obj === "object") {
    result = _flatMap(Object.keys({ ...obj }), (key) =>
      getAllPaths({ ...obj }[key], key).map(
        (subkey) => (parentKey ? `${parentKey}.` : "") + subkey
      )
    )
  } else {
    result = []
  }
  return _concat(result, parentKey || [])
}

export const isElement = (obj) => {
  if (typeof obj !== "object") return false
  if (obj.type) return true
  return false
}

export const REACT_EVENTS = [
  "onAbort",
  "onAnimationEnd",
  "onAnimationIteration",
  "onAnimationStart",
  "onBlur",
  "onCanPlay",
  "onCanPlayThrough",
  "onChange",
  "onClick",
  "onCompositionEnd",
  "onCompositionStart",
  "onCompositionUpdate",
  "onContextMenu",
  "onCopy",
  "onCut",
  "onDoubleClick",
  "onDrag",
  "onDragEnd",
  "onDragEnter",
  "onDragExit",
  "onDragLeave",
  "onDragOver",
  "onDragStart",
  "onDrop",
  "onDurationChange",
  "onEmptied",
  "onEncrypted",
  "onEnded",
  "onError",
  "onFocus",
  "onInput",
  "onKeyDown",
  "onKeyPress",
  "onKeyUp",
  "onLoad",
  "onLoadedData",
  "onLoadedMetadata",
  "onLoadStart",
  "onMouseDown",
  "onMouseEnter",
  "onMouseLeave",
  "onMouseMove",
  "onMouseOut",
  "onMouseOver",
  "onMouseUp",
  "onPaste",
  "onPause",
  "onPlay",
  "onPlaying",
  "onProgress",
  "onRateChange",
  "onScroll",
  "onSeeked",
  "onSeeking",
  "onSelect",
  "onStalled",
  "onSubmit",
  "onSuspend",
  "onTimeUpdate",
  "onTouchCancel",
  "onTouchEnd",
  "onTouchMove",
  "onTouchStart",
  "onTransitionEnd",
  "onVolumeChange",
  "onWaiting",
  "onWheel",
]
