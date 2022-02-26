import * as R from "ramda";
import React from "react";
export const isArray = obj => {
  if (Array.isArray(obj)) return true;
  return false;
};
export const convertPath = path => {
  if (!path) return [];
  return typeof path === "string" ? R.split(".")(path).map(k => k.match(/[0-9]+/) ? parseInt(k) : k) : path;
};
export const isElement = o => {
  if (!o || typeof o !== "object" || !o.type) return false;
  const elementKeys = ["type", "props", "children"];
  if (R.isEmpty(R.omit(elementKeys)(o))) return true;
  return false;
};
export const flattenObj = (obj = {}, prefix = "") => {
  if (!obj) return null;
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + "." : "";
    if (typeof obj[k] === "object") Object.assign(acc, flattenObj(obj[k], pre + k));else acc[pre + k] = obj[k];
    const r = acc;
    if (R.isEmpty(r)) return obj;
    return r;
  }, {});
};

const isAction = o => {
  const re = new RegExp(/^\$\w+$/, "g");
  if (re.test(Object.keys(o)[0])) return true;
  return false;
};

export const walk = (replacer, [breakFn, continueFn]) => {
  return (obj, path) => {
    if (!path) path = "";
    if (typeof path !== "string") path = path.toString();
    if (breakFn && breakFn(obj, path)) return obj;
    if (!continueFn || continueFn(obj, path)) obj = replacer(obj, path);
    if (typeof obj !== "object" || !obj) return obj;
    if ( /*#__PURE__*/React.isValidElement(obj)) return obj;
    return Object.keys(obj).reduce((acc, key) => {
      const nextPath = path ? `${path}.${key}` : key;
      acc[key] = walk(replacer, [breakFn, continueFn])(obj[key], nextPath);
      return acc;
    }, Array.isArray(obj) ? [] : {});
  };
};
export const onElement = [o => typeof o !== "object", isElement];
export const escapeRegExp = string => {
  return string.replace(/\n/g, "\\n").replace(/"/g, '\\"');
};
export const onParam = [o => !o || typeof o !== "object" || o.type, isAction];
export const onAction = [o => !o || typeof o !== "object", isAction];
export const onOverride = [o => !o || typeof o === "string" && !o.match(/%.*?%/), o => typeof o === "string"];
export const onProp = [o => !o || typeof o === "string" && !o.match(/{{.*?}}/), o => typeof o === "string" && o.match(/{{.*?}}/)];
export const replaceProps = obj => {
  const omitted = [];
  const nextObj = JSON.parse(JSON.stringify(obj).replace(/"[^"]*({{.*?}})[^"]*"/g, (match, value) => {
    if (!value) return match;
    const pathStr = value.replace(/{{(.*?)}}/g, "$1");
    const propName = pathStr.split(".")[0];
    if (omitted.indexOf(propName) === -1) omitted.push(propName);
    const r = R.path(convertPath(pathStr))(obj.props);
    if (r === undefined) return '""';

    if (typeof r === "string") {
      return match.replace(/{{(.*?)}}/g, escapeRegExp(r));
    }

    if (typeof r === "object") {
      return match.replace(/"[^"]*({{.*?}})[^"]*"/g, JSON.stringify(r));
    }

    if (typeof r === "boolean") return r;
    if (!isNaN(parseInt(r))) return parseInt(r);
    return null;
  }));
  const props = R.omit(omitted)(nextObj.props);
  return { ...nextObj,
    props
  };
};
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
  if ( /*#__PURE__*/React.isValidElement(obj)) return true;
  if (typeof obj === "string") return true;
  if (typeof obj === "number") return true;
  if (typeof obj === "boolean") return true;
  if (obj === null) return true;
  if (obj === undefined) return true;
  return false;
};