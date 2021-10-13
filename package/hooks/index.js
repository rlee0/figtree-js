import {
  push as _add,
  del as _del,
  get as _get,
  insert as _ins,
  set as _set,
  update as _upd,
} from "object-path-immutable"
import {
  atomFamily,
  selectorFamily,
  useRecoilCallback,
  useRecoilValue,
  useRecoilValueLoadable,
} from "recoil"
import { diff, getAllPaths } from "../helpers"

const store = atomFamily({
  key: "rjfp-store",
  default: null,
})

const storeSelector = selectorFamily({
  key: "rjf-storeSelector",
  get:
    (path) =>
    ({ get }) =>
      !path ? get(store("")) : get(store(path)),
  set:
    (path) =>
    ({ get, set }, value) => {
      set(store(path), value)
      const prev = get(store(""))
      const curr = _set(prev, path, value)
      const updatePaths = [...getAllPaths(diff(prev, curr)), ""]
      updatePaths.forEach((updatePath) => {
        const currValue = _get(curr, updatePath)
        set(
          store(updatePath),
          typeof currValue === "function" ? () => currValue : currValue
        )
      })
    },
})

export const getStore = () => {
  const loadable = useRecoilValueLoadable(store(""))
  return (path) =>
    loadable.valueMaybe() ? _get(loadable.valueMaybe(), path) : null
}

export const setStore = () =>
  useRecoilCallback(
    ({ set }) =>
      (path, newValue) => {
        return set(storeSelector(path), newValue)
      },
    []
  )
