export const isElement = (obj) => obj && typeof obj === "object" && obj.as;

export const isAction = (obj) =>
  obj &&
  typeof obj === "object" &&
  !Array.isArray(obj) &&
  Object.keys(obj).length === 1 &&
  Object.keys(obj)[0][0] === "$";

export const iterate = (
  obj,
  replacer,
  [breakFn, continueFn],
  currPath = []
) => {
  if (breakFn && breakFn(obj, currPath)) return obj;
  if (!continueFn || continueFn(obj, currPath)) obj = replacer(obj, currPath);
  if (typeof obj !== "object") return obj;
  Object.keys(obj).forEach((k) => {
    const nextPath = [...currPath, k];
    obj[k] = iterate(obj[k], replacer, [breakFn, continueFn], nextPath);
  });
  return obj;
};

export const revIterate = (
  obj,
  replacer,
  [breakFn, continueFn],
  currPath = []
) => {
  if (breakFn && breakFn(obj, currPath)) return obj;
  if (typeof obj !== "object") return obj;
  let res = Array.isArray(obj) ? [] : {};
  Object.keys(obj).forEach((k) => {
    const nextPath = [...currPath, k];
    res[k] = revIterate(obj[k], replacer, [breakFn, continueFn], nextPath);
  });
  if (!continueFn || continueFn(res, currPath)) return replacer(res, currPath);
  return res;
};

export const onElement = [(o) => !o || typeof o !== "object", isElement];
export const onParam = [(o) => !o || typeof o !== "object" || o.as, isAction];
export const onAction = [(o) => !o || typeof o !== "object", isAction];
