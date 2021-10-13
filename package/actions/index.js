import { get as _get, set as _set } from "object-path-immutable";

import _flow from "lodash/flow";

const $flow = () => (fns) => (e) => {
  return _flow(fns.map((fn) => (typeof fn === "function" ? fn : () => fn)))(e);
};

const $value = () => (fns) => _flow(fns)();

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
  return _get(e, path);
};

const $set = () => (args) => (e) => {
  const [path] = args;
  return _set(e, path);
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
  const [source, propName] = args;
  return {
    ...source,
    overrides: {
      ...source.overrides,
      [propName || "index"]: index.toString(),
    },
  };
};

const actions = {
  $value,
  $flow,
  $getData,
  $setData,
  $get,
  $set,
  $log,
  $stringify,
  $fetch,
  $map,
  $template,
};

export default actions;
