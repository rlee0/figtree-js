import React, { memo, useCallback, useEffect } from "react";
import { isElement, revIter } from "./helpers";

import _flow from "lodash/flow";
import create from "zustand";
import { createElement } from "react";
import store from "./store";

const useStore = create(store);

const replaceTemplateSelector = (state) => state.replaceTemplate;
const replaceOverrideSelector = (state) => state.replaceOverride;
const replaceComponentSelector = (state) => state.replaceComponent;
const replaceActionSelector = (state) => state.replaceAction;
const renderElementSelector = (state) => state.renderElement;

const RJFPRoot = memo(({ entry, actions, elements, data, components }) => {
  const { createStore } = useStore();

  useEffect(() => {
    const initialConfig = { actions, elements, data, components };
    createStore(initialConfig);
  }, []);
  return <RJFPLoader entry={entry} />;
});

const RJFPLoader = ({ entry }) => {
  const replaceTemplate = useStore(replaceTemplateSelector);
  const replaceOverride = useStore(replaceOverrideSelector);
  const replaceComponent = useStore(replaceComponentSelector);
  const replaceAction = useStore(replaceActionSelector);
  const renderElement = useStore(renderElementSelector);
  const element = useStore(
    useCallback(
      (state) => (state.elements ? state.elements[entry] : null),
      [entry]
    )
  );
  if (!element) return null;

  const { as, children, ...props } = revIter(
    replaceAction(
      revIter(
        element,
        _flow([replaceTemplate, replaceOverride, replaceComponent]),
        [(o) => !o || typeof o !== "object", (o, p) => isElement(o, p)]
      )
    ),
    _flow(renderElement),
    [(o) => !o || typeof o !== "object", (o, p) => isElement(o, p)]
  );
  return (
    <RJFPElement as={as} {...props}>
      {children}
    </RJFPElement>
  );
};

export const RJFPElement = memo((element) => {
  const { as, children, ...props } = element;
  return createElement(as, props, children);
});

RJFPRoot.displayName = "RJFPRoot";
RJFPLoader.displayName = "RJFPLoader";
RJFPElement.displayName = "RJFPElement";

export default RJFPRoot;
