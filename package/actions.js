import { get as _get, set as _set } from "object-path-immutable";

import _flow from "lodash/flow";
import _isEqual from "lodash/isEqual";
import { iter } from "./helpers";

const $value = () => (fns) =>
  _flow(fns.map((fn) => (typeof fn !== "function" ? () => fn : fn)))();

const $flow = () => (fns) => {
  let isFn = false;
  const flowFn = _flow(
    fns.map((fn, f) => {
      if (f === 0 && typeof fn === "function") isFn = true;
      return typeof fn === "function" ? fn : () => fn;
    })
  );
  if (isFn === true) return flowFn;
  return flowFn();
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

const $fetch =
  ({ getData, setData }) =>
  () =>
  (url) => {
    fetch(url)
      .then((res) => res.text())
      .then((text) => {
        const prev = getData(url);
        if (_isEqual(prev, text)) return;
        setData(url, text);
      })
      .catch(() => setData(url, null));
    const res = getData(url);
    if (!res) return;
    return res;
  };

const $map = () => (fns) => (prev) => {
  return prev.map((...prev) => _flow(fns)(prev));
};

const $template = () => (args) => (prev) => {
  const [source, label] = args;
  const replacer = (o) =>
    o.replace(/%(.*?)%/, (match, group) => (group === label ? prev : match));
  return iter(replacer, [(o) => !o, (o) => typeof o !== "object"])(source);
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
