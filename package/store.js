import * as imm from "object-path-immutable";

import { RJFPElement } from "./Root";
import React from "react";
import _merge from "lodash/merge";
import _omit from "lodash/omit";
import _set from "lodash/set";
import { createElement } from "react";
import { isAction } from "./helpers";

const createStore = (set) => (v) => set((prev) => ({ ...prev, ...v }));
const getData = (get) => (p) => imm.get(get().data, p);
const setData = (set) => (p, v) => {
  set((prev) => imm.set(prev, `data.${p}`, v));
};
const replaceTemplate = (get) => (el) => {
  const template = get().elements[el.as];
  return template ? _merge(template, _omit(el, "as")) : el;
};
const replaceOverride = (el) => {
  let n = {};
  Object.keys(el).forEach((p) => _set(n, p, el[p]));
  return n;
};
const replaceComponent = (get) => (el) => {
  _set(el, "as", get().components[el.as] || el.as);
  return el;
};
const replaceParams = (get) => (obj) => {
  return obj.map((o) => {
    if (typeof o !== "object" || o.as) return o;
    if (isAction(o)) return get().replaceAction(o);
    Object.keys(o).forEach((k) => _set(o, k, get().replaceParams(o[k])));
    return o;
  });
};
const replaceAction = (get) => (el) => {
  if (!el || typeof el !== "object") return el;
  if (isAction(el)) {
    const actionType = Object.keys(el)[0];
    const args = get().replaceParams(el[actionType]);
    const action = get().actions[actionType];
    const res = get().replaceAction(
      action({ getData: get().getData, setData: get().setData })(args)
    );
    return res;
  }
  Object.keys(_omit(el, "as")).forEach((propName) => {
    const propValue = imm.get(el, propName);
    el[propName] = get().replaceAction(propValue); // useCallback??
  });
  return el;
};

const renderElement = (el, path) => {
  const key = path.join(".");
  const { as, children, ...props } = el;
  return (
    <RJFPElement key={key} as={as} {...props}>
      {children}
    </RJFPElement>
  );
};

const store = (set, get) => ({
  createStore: createStore(set),
  getData: getData(get),
  setData: setData(set),
  replaceTemplate: replaceTemplate(get),
  replaceComponent: replaceComponent(get),
  replaceParams: replaceParams(get),
  replaceAction: replaceAction(get),
  renderElement,
  replaceOverride,
});

export default store;
