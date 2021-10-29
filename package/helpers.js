import deepmerge from "deepmerge";

export const isElement = (obj) => obj && typeof obj === "object" && obj.as;

const isAction = (o) =>
  o &&
  typeof o === "object" &&
  !Array.isArray(o) &&
  Object.keys(o)[0][0] === "$";

export const iter = (replacer, [breakFn, continueFn], currPath) => {
  return (obj) => {
    if (breakFn && breakFn(obj, currPath)) return obj;
    if (!continueFn || continueFn(obj, currPath)) {
      obj = replacer(obj, currPath);
    }
    if (typeof obj !== "object") return obj;
    const newObj = Array.isArray(obj) ? [] : {};
    for (const k in obj) {
      const nextPath = currPath ? `${currPath}.${k}` : k;
      newObj[k] = iter(replacer, [breakFn, continueFn], nextPath)(obj[k]);
    }
    return newObj;
  };
};

export const onElement = [(o) => !o || typeof o !== "object", isElement];
export const onParam = [(o) => !o || typeof o !== "object" || o.as, isAction];
export const onAction = [(o) => !o || typeof o !== "object", isAction];
export const onOverride = [(o) => !o, (o) => typeof o === "string"];

export const combineMerge = (target, source, options) => {
  const destination = target.slice();
  source.forEach((item, index) => {
    if (typeof destination[index] === "undefined") {
      destination[index] = options.cloneUnlessOtherwiseSpecified(item, options);
    } else if (options.isMergeableObject(item)) {
      destination[index] = deepmerge(target[index], item, options);
    } else if (target.indexOf(item) === -1) {
      destination.push(item);
    }
  });
  return destination;
};
