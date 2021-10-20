import * as imm from "object-path-immutable";

import { iterate, onAction, onElement, onParam, revIterate } from "./helpers";

import React from "react";
import _flow from "lodash/flow";
import _omit from "lodash/omit";
import _set from "lodash/set";

const initializeStore = (set) => (v) => set(v);

const callbacks = (get, set) => ({
  getData: (p) => imm.get(get().data, p),
  setData: (p, v) => set((prev) => ({ data: imm.set(prev.data, p, v) })),
});

const replaceOverride = (get) => (obj) => {
  return revIterate(
    obj,
    _flow([
      (o) => {
        const template = get().elements[o.as];
        return template ? imm.merge(template, _omit(o, "as")) : o;
      },
      (o) => {
        Object.keys(o).forEach((p) => _set(o, p, o[p]));
        return o;
      },
    ]),
    onElement
  );
};

const replaceArgs = (get) => (obj) => {
  const actionReplacer = get().replaceAction;
  return iterate(obj, actionReplacer, onParam);
};

const replaceAction = (get) => (obj) => {
  const replaceArgs = get().replaceArgs;
  const callbacks = get().callbacks;
  return iterate(
    obj,
    (o) => {
      const actionType = Object.keys(o)[0];
      const action = get().actions[actionType];
      const args = replaceArgs(o[actionType]);
      return action(callbacks)(args) || "";
    },
    onAction
  );
};

const replaceElement = (get) => (obj) => {
  return revIterate(
    obj,
    (o, key) => {
      const { as, children, ...props } = o;
      const Component = get().components[as] || as;
      return (
        <Component key={key} {...props}>
          {children}
        </Component>
      );
    },
    onElement
  );
};

const createRJFPElement = (get) => (obj) => {
  return _flow([
    get().replaceOverride,
    get().replaceAction,
    get().replaceElement,
  ])(obj);
};

const store = (set, get) => ({
  initializeStore: initializeStore(set),
  callbacks: callbacks(get, set),
  replaceOverride: replaceOverride(get),
  replaceArgs: replaceArgs(get),
  replaceAction: replaceAction(get),
  replaceElement: replaceElement(get),
  createRJFPElement: createRJFPElement(get),
});

export default store;
