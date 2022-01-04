import React, { isValidElement } from "react";
import isEmpty from "ramda/src/isEmpty";
import omit from "ramda/src/omit";
import split from "ramda/src/split";
export const convertPath = path => {
  if (!path) return [];
  return typeof path === "string" ? split(".")(path).map(k => k.match(/[0-9]+/) ? parseInt(k) : k) : path;
};
export const isElement = (o, p) => {
  if (!o || typeof o !== "object" || !o.type) return false;

  if (p) {
    const path = convertPath(p);
    if (path[path.length - 1] !== "props") return true;
  }

  if (omit(["type", "props", "children", "key", "data-testid"])(Object.keys(o)).length === 0) {
    return true;
  }

  return false;
};
export const flattenObj = (obj = {}, prefix = "") => {
  if (!obj) return null;
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + "." : "";
    if (typeof obj[k] === "object") Object.assign(acc, flattenObj(obj[k], pre + k));else acc[pre + k] = obj[k];
    const r = acc;
    if (isEmpty(r)) return obj;
    return r;
  }, {});
};

const isAction = o => {
  const re = new RegExp(/^\$\w+$/, "g");
  if (re.test(Object.keys(o)[0])) return true;
  return false;
};

export const walkElement = replacer => (obj, path) => {
  const nextObj = replacer(obj, path);
  if (isValidChild(nextObj)) return nextObj;
  if (!nextObj.children) return nextObj;
  if (isValidChild(nextObj.children)) return nextObj;

  if (Array.isArray(nextObj.children)) {
    return { ...nextObj,
      children: nextObj.map((o, i) => {
        return walkElement(replacer)(o, `${path}.children.${i}`);
      })
    };
  }

  return nextObj;
};
export const walk = (replacer, [breakFn, continueFn]) => {
  return (obj, path) => {
    if (breakFn && breakFn(obj, path)) return obj;
    if (!continueFn || continueFn(obj, path)) obj = replacer(obj, path);
    if (typeof obj !== "object" || isEmpty(obj) || !obj) return obj;
    if ( /*#__PURE__*/React.isValidElement(obj)) return obj;
    const r = Object.keys(obj).reduce((acc, key) => {
      const nextPath = path ? path.concat(".").concat(key) : key;
      acc[key] = walk(replacer, [breakFn, continueFn])(obj[key], nextPath);
      return acc;
    }, Array.isArray(obj) ? [] : {});
    if (isEmpty(r)) return obj;
    return r;
  };
};
export const onElement = [(o, k) => {
  if (k.indexOf("$") !== -1) return true;
  return !o || typeof o !== "object";
}, isElement];
export const escapeRegExp = string => {
  return string.replace(/\n/g, "\\n").replace(/"/g, '\\"');
};
export const onParam = [o => !o || typeof o !== "object" || o.type, isAction];
export const onAction = [o => !o || typeof o !== "object", isAction];
export const onOverride = [o => !o || typeof o === "string" && !o.match(/%.*?%/), o => typeof o === "string"];
export const onProp = [o => !o || typeof o === "string" && !o.match(/{{.*?}}/), o => typeof o === "string"];
export function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    console.error(e);
    return false;
  }

  return true;
}
export const getByPath = arr => obj => {
  let newObj = obj;
  arr.forEach(field => newObj = newObj[field]);
  return newObj;
};
export const isValidChild = obj => {
  if ( /*#__PURE__*/isValidElement(obj)) return true;
  if (typeof obj === "string") return true;
  if (typeof obj === "number") return true;
  if (typeof obj === "boolean") return true;
  if (obj === null) return true;
  if (obj === undefined) return true;
  return false;
};