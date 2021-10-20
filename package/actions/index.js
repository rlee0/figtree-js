import { get as _get, set as _set } from "object-path-immutable";

import _flow from "lodash/flow";

const $value = () => (fns) => _flow(fns)();

const $flow = () => (fns) => (e) => {
  return _flow(fns.map((fn) => (typeof fn === "function" ? fn : () => fn)))(e);
};

const $getData =
  ({ getData }) =>
  (args) =>
  () => {
    const [path] = args;
    return getData(path);
  };

const $setData =
  ({ setData }) =>
  (args) =>
  (prev) => {
    const [path] = args;
    return setData(path, prev);
  };

const $get = () => (args) => (e) => {
  const [path] = args;
  return _get(e, path) || null;
};

const $set = () => (args) => (e) => {
  const [path] = args;
  return _set(e, path) || null;
};

const $log = () => () => (prev) => {
  return console.log(prev);
};

const $stringify = () => (args) => (prev) => {
  const [replacer, space] = args;
  return JSON.stringify(prev, replacer, space);
};

const $fetch = () => (fns) => (prev) => {
  return fetch(prev)
    .then((response) => response.json())
    .then((json) => _flow(fns)(json))
    .catch((err) => console.error(err.message));
};

const $map = () => (fns) => (prev) => {
  return prev.map((...p) => _flow(fns)(p));
};

const $template = () => (args) => (prev) => {
  const [, index] = prev;
  const [source, label] = args;

  const iterate = (obj, replacer) => {
    let newObj = replacer(obj);
    if (typeof newObj !== "object") return newObj;
    Object.keys(newObj).forEach((k) => {
      newObj = _set(newObj, k, iterate(newObj[k], replacer));
    });
    return newObj;
  };
  return iterate(source, (o) => {
    if (typeof o !== "string") return o;
    return o.replace(/\{\{(.*?)\}\}/gim, (match, group) => {
      if (group === label) return index.toString();
      return match;
    });
  });
};
const actions = {
  $fetch,
  $flow,
  $get,
  $getData,
  $log,
  $map,
  $set,
  $setData,
  $stringify,
  $template,
  $value,
};

export default actions;
