import React, { useEffect, useState } from "react";
import {
  combineMerge,
  iter,
  onAction,
  onElement,
  onOverride,
  onParam,
} from "./helpers";

import _flow from "lodash/flow";
import _get from "lodash/get";
import _isEqual from "lodash/isEqual";
import _pick from "lodash/pick";
import _set from "lodash/set";
import create from "zustand/vanilla";
import deepmerge from "deepmerge";

const store = (set, get) => {
  const replaceComponents = (obj) => {
    const components = get().components;
    if (!components) return obj;
    const componentReplacer = (o, key) => {
      const { as, children, ...props } = o;
      const Component = components[as] || as;
      return (
        <Component key={key} id={key} {...props}>
          {children && <>{children}</>}
        </Component>
      );
    };
    return iter(componentReplacer, onElement)(obj);
  };

  const replaceActions = (obj) => {
    const actions = get().actions;
    const data = get().data;
    const callbacks = {
      getData: (p) => _get(data, p),
      setData: (p, v) => set({ data: _set(data, p, v) }),
    };
    if (!actions) return obj;
    const actionReplacer = (o) => {
      const actionType = Object.keys(o)[0];
      const args = iter(actionReplacer, onParam)(o[actionType]);
      return actions[actionType](callbacks)(args) || [];
    };
    return iter(actionReplacer, onAction)(obj);
  };

  const replaceOverrides = (obj) => {
    const overrides = get().overrides;
    const overrideReplacer = (o) => {
      if (!overrides) return o;
      return o.replace(/%(.*?)%/g, (m, g) => {
        const res = iter(overrideReplacer, onOverride)(overrides[g]) || m;
        return typeof res !== "object" ? res : JSON.parse(JSON.stringify(res));
      });
    };
    return iter(overrideReplacer, onOverride)(obj);
  };

  const replaceTemplates = (obj) => {
    const elements = get().elements;
    const templateReplacer = (o) => {
      if (!elements) return o;
      const { as, ...rest } = o;
      const template = elements[as];
      if (!template) return o;
      return deepmerge(templateReplacer(template), rest, {
        arrayMerge: combineMerge,
      });
    };
    return iter(templateReplacer, onElement)(obj);
  };

  return {
    replaceTemplates,
    replaceOverrides,
    replaceActions,
    replaceComponents,
  };
};

const useStore = create(store);

const getState = useStore.getState;

const setState = useStore.setState;

const subscribe = useStore.subscribe;

const useReactJsonFp = (raw) => {
  const [config, setConfig] = useState(raw);
  useEffect(() => {
    return subscribe((state) => setConfig(_pick(state, Object.keys(raw))));
  }, []);
  useEffect(() => {
    if (!config) return;
    if (_isEqual(config, _pick(getState(), Object.keys(config)))) return;
    setState(config);
  }, [config]);
  if (!raw) return;
  return [config, setConfig];
};

const ReactJsonFp = (raw) => {
  const [element, setElement] = useState(null);
  useEffect(() => {
    if (!raw) return;
    if (!getState().elements) return;
    const { as, ...rest } = raw;
    const template = getState().elements[as] || { as };
    const el = deepmerge(template, rest, { arrayMerge: combineMerge });
    setElement(
      _flow([
        getState().replaceTemplates,
        getState().replaceOverrides,
        getState().replaceActions,
        getState().replaceComponents,
      ])(el)
    );
  }, [raw]);
  return element;
};

export { useReactJsonFp };

export default ReactJsonFp;
