import * as R from "ramda";
import { convertPath, escapeRegExp, isElement, isValidChild, onAction, onParam, walk } from "./helpers";
import React from "react";
import zustand from "zustand";

const Figtree = ({
  store,
  entry
}) => {
  const {
    api,
    elements
  } = store();
  const tree = api.generateTree(R.path(convertPath(entry), elements), entry);
  return api.renderTree(tree);
};

const figtree = config => (set, get) => {
  const api = {
    get,
    set
  };

  const applyPath = (obj, propNames, q) => {
    return walk((o, p) => {
      propNames.forEach(propName => {
        o = R.assocPath(["props", propName], q && p ? `${q}.${p}` : p)(o);
      });
      return o;
    }, [o => typeof o !== "object", isElement])(obj);
  };

  const applyElements = obj => {
    const {
      type,
      ...rest
    } = obj;
    const elements = get().elements;
    const element = elements ? elements[type] : {
      type
    };
    if (!element) return obj;
    return applyProps(R.mergeDeepRight(element, rest));
  };

  const applyProps = obj => {
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
      return match;
    }));
    const props = R.omit(omitted)(nextObj.props);
    return { ...nextObj,
      props
    };
  };

  const applyActions = obj => {
    const actions = get().actions;
    if (!actions) return obj;

    const actionReplacer = (o, k) => {
      const actionType = Object.keys(o)[0];
      const args = walk((a, b) => {
        api.path = `${k}.${actionType}.${b}`;
        return actionReplacer(a, `${k}.${actionType}.${b}`);
      }, onParam)(o[actionType]);
      const action = actions[actionType](api);
      return action(args);
    };

    try {
      return walk((a, b) => actionReplacer(a, b), onAction)(obj);
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const generateTree = (obj, path) => {
    const generateLeaf = (o, p) => {
      if (isValidChild(o)) return o;

      if (Array.isArray(o)) {
        return o.map((m, k) => generateLeaf(m, `${p}.${k}`));
      }

      const key = o.props && o.props.key ? o.props.key : p;
      const {
        type,
        props,
        children
      } = R.pipe(applyElements, applyActions)(o);
      return {
        type,
        props: { ...props,
          key
        },
        children: generateLeaf(children, `${key}.children`)
      };
    };

    if (!path) return generateLeaf(obj);
    return generateLeaf(applyPath(obj, ["data-testid", "key"], path), path);
  };

  const renderTree = obj => {
    if (isValidChild(obj)) return obj;
    if (Array.isArray(obj)) return obj.map(renderTree);
    const Component = get().components[obj.type] || obj.type;
    const props = Component === React.Fragment ? {
      key: obj.props.key
    } : { ...obj.props,
      ["data-path"]: obj.props.key
    };
    return /*#__PURE__*/React.createElement(Component, props, renderTree(obj.children));
  };

  return { ...config,
    api: {
      generateTree,
      renderTree,
      applyPath,
      get,
      set
    }
  };
};

const create = R.pipe(figtree, zustand);
export { create, Figtree };