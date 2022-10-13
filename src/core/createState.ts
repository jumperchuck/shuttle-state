import { useEffect, useRef, useState } from 'react';
import { Getter, Setter, ShuttleState } from './types';
import createApi, { defaultEqualFn, defaultSelector } from './createApi';
import context from './context';

let id = 0;

export default function createState<S, T = S>(getter: S | Getter<S>, setter?: Setter<T>) {
  const key = `shuttle-state-${++id}`;

  const api = createApi(getter, setter);

  const useShuttleState = ((selector = defaultSelector, equalFn = defaultEqualFn) => {
    const currentApi = context.useApi(useShuttleState);

    const selectorRef = useRef(selector);
    selectorRef.current = selector;

    const equalFnRef = useRef(equalFn);
    equalFnRef.current = equalFn;

    const [current, setCurrent] = useState(() =>
      selectorRef.current(currentApi.getState()),
    );

    const stateRef = useRef(current);
    stateRef.current = current;

    useEffect(() => {
      const diff = (newState: S) => {
        const newCurrent = selectorRef.current(newState);
        if (!equalFnRef.current(stateRef.current, newCurrent)) {
          setCurrent(newCurrent);
          stateRef.current = newCurrent;
        }
      };
      diff(currentApi.getState());
      return currentApi.subscribe(diff);
    }, [currentApi]);

    return [current, currentApi.setState, currentApi.resetState];
  }) as ShuttleState<S, T>;

  useShuttleState.toString = () => key;

  return Object.assign(useShuttleState, api);
}
