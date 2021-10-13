import _get from "lodash/get";
import _set from "lodash/set";
import { isValidElement } from "react";

export const isElement = (obj, path) =>
  obj && typeof obj === "object" && obj.as && path.length > 0;

export const isAction = (obj) =>
  obj &&
  typeof obj === "object" &&
  !Array.isArray(obj) &&
  Object.keys(obj).length === 1 &&
  _get(Object.keys(obj), "0.0") === "$";

export const isValidElementObj = (o) =>
  !o || (typeof o !== "object" && typeof o !== "function") || isValidElement(o);

export const revIter = (
  obj,
  replacer,
  [breakFn, continueFn],
  currPath = []
) => {
  if (breakFn && breakFn(obj, currPath) === true) return obj;
  if (typeof obj !== "object") return obj;
  let res = Array.isArray(obj) ? [] : {};
  Object.keys(obj).forEach((k) => {
    const value = _get(obj, k);
    const nextPath = [...currPath, k];
    res = _set(
      res,
      k,
      revIter(value, replacer, [breakFn, continueFn], nextPath)
    );
  });
  if (!continueFn || continueFn(res, currPath) === true) {
    return replacer(res, currPath);
  }
  return res;
};

export const objectDeepKeys = (obj) => {
  return Object.keys(obj)
    .filter((key) => obj[key] instanceof Object)
    .map((key) => objectDeepKeys(obj[key]).map((k) => `${key}.${k}`))
    .reduce((x, y) => x.concat(y), Object.keys(obj));
};
