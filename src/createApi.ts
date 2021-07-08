import {
  Getter,
  Setter,
  ShuttleState,
  Listener,
  Unsubscribe,
  GetterOptions,
  SetterOptions,
  ShuttleStateApi,
  Selector,
  EqualFn,
  ContainerType,
} from './types';

type Deps = {
  value: any;
  selector: Selector<any>;
  equalFn: EqualFn<any>;
};

export const defaultSelector = <S, V = S>(state: S) => state as unknown as V;

export const defaultEqualFn = Object.is;

export default function createApi<S, T = S>(
  getter: Getter<S>,
  setter?: Setter<T>,
  container?: ContainerType,
): ShuttleStateApi<S, T> {
  const registeredDeps: Record<
    string,
    {
      deps: Deps[];
      unsubscribe: Unsubscribe;
    }
  > = {};

  const setterOptions: SetterOptions = {
    get: (shuttleState) =>
      container ? container.getState(shuttleState) : shuttleState.getState(),
    set: (shuttleState, newState) =>
      container
        ? container.setState(shuttleState, newState)
        : shuttleState.setState(newState),
    reset: (shuttleState) =>
      container ? container.resetState(shuttleState) : shuttleState.resetState(),
  };

  const getterOptions: GetterOptions = {
    get: (
      shuttleState: ShuttleState<any>,
      selector = defaultSelector,
      equalFn = defaultEqualFn,
    ) => {
      const key = shuttleState.toString();
      const value = selector(setterOptions.get(shuttleState));
      if (!registeredDeps[key]) {
        const deps: Deps[] = [];
        const listener = (newValue: any) => {
          if (deps.some((item) => !item.equalFn(item.selector(newValue), item.value))) {
            notify(initialState());
          }
        };
        const unsubscribe = container
          ? container.subscribe(shuttleState, listener)
          : shuttleState.subscribe(listener);
        registeredDeps[key] = { deps, unsubscribe };
      }
      registeredDeps[key].deps.push({ value, selector, equalFn });
      return value;
    },
  };

  const initialState = () => {
    Object.values(registeredDeps).forEach((item) => {
      item.deps.splice(0, item.deps.length);
    });
    const defaultState =
      // @ts-ignore
      typeof getter === 'function' ? getter(getterOptions) : getter;
    if (defaultState instanceof Promise) {
      defaultState.then(notify);
    }
    return defaultState;
  };

  let state: S = initialState();

  const listeners = new Set<{
    listener: Listener<any>;
    selector: Selector<any>;
    equalFn: EqualFn<any>;
  }>();

  const notify = (newState: S) => {
    if (state === newState) return;
    const prevState = state;
    state = newState;
    for (let { listener, selector, equalFn } of listeners) {
      const newValue = selector(newState);
      const preValue = selector(prevState);
      if (!equalFn(newValue, preValue)) {
        listener(newValue, preValue);
      }
    }
  };

  return {
    getState() {
      return state;
    },
    setState(action) {
      // @ts-ignore
      const newState = typeof action === 'function' ? action(state) : action;
      if (setter) {
        setter(setterOptions, newState);
      } else {
        notify(newState);
      }
    },
    resetState() {
      notify(initialState());
    },
    subscribe(listener, selector = defaultSelector, equalFn = defaultEqualFn) {
      const item = { listener, selector, equalFn };
      listeners.add(item);
      return () => listeners.delete(item);
    },
    destroy() {
      Object.keys(registeredDeps).forEach((key) => {
        registeredDeps[key].unsubscribe();
        delete registeredDeps[key];
      });
      listeners.clear();
    },
    clone(container) {
      return createApi(getter, setter, container);
    },
  };
}
