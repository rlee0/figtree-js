import { get as _get, set as _set } from "object-path-immutable"
import {
  atomFamily,
  selectorFamily,
  useRecoilCallback,
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
  return (path) => _get(loadable.contents, path)
}

export const setStore = () =>
  useRecoilCallback(
    ({ set }) =>
      (path, newValue) => {
        return set(storeSelector(path), newValue)
      },
    []
  )
