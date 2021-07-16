import { useEffect, useRef, useState } from 'react';
import { Getter, Setter, ShuttleState } from './types';
import createApi, { defaultEqualFn, defaultSelector } from './createApi';
import context from './context';

let id = 0;

export default function createState<S, T = S>(getter: S | Getter<S>, setter?: Setter<T>) {
  const key = `shuttle_state${++id}`;

  const api = createApi(getter, setter);

  const useShuttleState: ShuttleState<S, T> = (
    selector = defaultSelector,
    equalFn = defaultEqualFn,
  ) => {
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
  };

  useShuttleState.getState = api.getState;
  useShuttleState.setState = api.setState;
  useShuttleState.resetState = api.resetState;
  useShuttleState.subscribe = api.subscribe;
  useShuttleState.destroy = api.destroy;
  useShuttleState.clone = api.clone;
  useShuttleState.use = api.use;
  useShuttleState.toString = () => key;

  return useShuttleState;
}
