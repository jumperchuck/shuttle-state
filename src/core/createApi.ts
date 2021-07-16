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
  ApiOperator,
} from './types';

type DepInfo = {
  value: any;
  selector: Selector<any>;
  equalFn: EqualFn<any>;
};

type ListenerInfo = {
  listener: Listener<any>;
  selector: Selector<any>;
  equalFn: EqualFn<any>;
};

export const defaultSelector = <S, V = S>(state: S) => state as unknown as V;

export const defaultEqualFn = Object.is;

export const defaultOperator: ApiOperator = {
  get: (shuttleState) => shuttleState.getState(),
  set: (shuttleState, newState) => shuttleState.setState(newState),
  reset: (shuttleState) => shuttleState.resetState(),
  subscribe: (shuttleState, listener) => shuttleState.subscribe(listener),
};

export default function createApi<S, T = S>(
  getter: Getter<S>,
  setter?: Setter<T>,
  operator = defaultOperator,
): ShuttleStateApi<S, T> {
  const registeredDeps: Record<
    string,
    {
      deps: DepInfo[];
      unsubscribe: Unsubscribe;
    }
  > = {};

  const setterOptions: SetterOptions = {
    get: operator.get,
    set: operator.set,
    reset: operator.reset,
  };

  const getterOptions: GetterOptions = {
    get: (
      shuttleState: ShuttleState<any>,
      selector = defaultSelector,
      equalFn = defaultEqualFn,
    ) => {
      const key = shuttleState.toString();
      const value = selector(operator.get(shuttleState));
      if (!registeredDeps[key]) {
        const deps: DepInfo[] = [];
        const listener = (newValue: any) => {
          if (deps.some((item) => !item.equalFn(item.selector(newValue), item.value))) {
            notify(initialState());
          }
        };
        const unsubscribe = operator.subscribe(shuttleState, listener);
        registeredDeps[key] = { deps, unsubscribe };
      }
      registeredDeps[key].deps.push({ value, selector, equalFn });
      return value;
    },
  };

  const listeners = new Set<ListenerInfo>();

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

  const notify = (newState: S) => {
    if (state === newState) return;
    const prevState = state;
    state = newState;
    for (const { listener, selector, equalFn } of listeners) {
      const newValue = selector(newState);
      const preValue = selector(prevState);
      if (!equalFn(newValue, preValue)) {
        listener(newValue, preValue);
      }
    }
  };

  let api: ShuttleStateApi<S, T> = {
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
    clone(operator) {
      return createApi(getter, setter, operator);
    },
    use() {},
  };

  return {
    getState() {
      return api.getState();
    },
    setState(action) {
      return api.setState(action);
    },
    resetState() {
      return api.resetState();
    },
    subscribe(listener, selector = defaultSelector, equalFn = defaultEqualFn) {
      return api.subscribe(listener, selector, equalFn);
    },
    destroy() {
      return api.destroy();
    },
    clone(operator) {
      return api.clone(operator);
    },
    use(middleware) {
      api = middleware(api);
    },
  };
}
