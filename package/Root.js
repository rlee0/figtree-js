import { useCallback, useEffect } from "react";

import create from "zustand";
import store from "./store";

const useStore = create(store);
const initializeStore = useStore.getState().initializeStore;
const createRJFPElement = useStore.getState().createRJFPElement;

const Root = ({ entry, elements, data, actions, components }) => {
  useEffect(() => initializeStore({ elements, data, actions, components }), []);
  const element = useStore(
    useCallback(
      (state) => {
        try {
          const elements = state.elements[entry];
          return createRJFPElement(elements);
        } catch (err) {
          return null;
        }
      },
      [entry]
    )
  );

  return element;
};

Root.displayName = "Root";

export default Root;
