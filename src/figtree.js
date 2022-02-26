import * as R from "ramda";

import React, { useState } from "react";
import { convertPath, onElement } from "../helpers";
import {
  isArray,
  isValidChild,
  onAction,
  onParam,
  replaceProps,
  walk,
} from "./util";

import { useEffect } from "react/cjs/react.development";
import zustand from "zustand";

export function Figtree({ store, ...props }) {
  const [entry, setEntry] = useState(props.entry);
  const [tree, setTree] = useState(null);
  useEffect(() => setEntry(props.entry), [props.entry]);
  useEffect(() => {
    const seed = R.path(convertPath(entry))(config);
    setTree(api.renderTree(seed, entry));
  }, [store.getState(), entry]);
  const { api, ...config } = store();
  return tree;
}

function figtree(config) {
  return (set, get) => {
    const applyPaths = walk((obj, key) => {
      if (R.path(convertPath("props.data-path"))(obj)) return obj;
      return R.assocPath(convertPath("props.data-path"), key)(obj);
    }, onElement);

    const applyElements = (obj) => {
      const elements = get().elements;
      const { type, ...rest } = obj;
      if (!elements[type]) return obj;
      const replacedElement = R.assocPath(
        convertPath("props.data-path"),
        `elements.${type}`
      )(R.mergeDeepRight(elements[type], rest));
      return replaceProps(replacedElement);
    };

    const applyActions = walk((obj, key) => {
      const actions = get().actions;
      const actionType = Object.keys(obj)[0];
      const action = actions[actionType];
      if (!action) return obj;
      const path = `${key}.${actionType}`;
      const args = walk(applyActions, onParam)(obj[actionType], path);
      return action({ get, set, path })(args);
    }, onAction);

    const renderTree = (obj, key) => {
      if (!key) return null;
      if (isValidChild(obj)) return obj;
      if (isArray(obj)) return obj.map((o, i) => renderTree(o, `${key}.${i}`));
      const { type, ...rest } = applyActions(applyElements(obj, key), key);
      const Component = get().components[type] || type;
      const props =
        Component === React.Fragment ? { key } : { ...rest.props, key };
      return (
        <Component {...props}>
          {renderTree(rest.children, `${key}.children`)}
        </Component>
      );
    };
    return {
      ...config,
      api: {
        renderTree,
        get,
        set,
      },
    };
  };
}

export function create(config) {
  return R.pipe(figtree, zustand)(config);
}
