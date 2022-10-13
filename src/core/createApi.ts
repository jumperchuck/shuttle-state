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
  Middleware,
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
    set: operator.set,
    reset: operator.reset,
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
    listeners.forEach(({ listener, selector, equalFn }) => {
      const newValue = selector(newState);
      const preValue = selector(prevState);
      if (!equalFn(newValue, preValue)) {
        listener(newValue, preValue);
      }
    });
  };

  const middlewares: ReturnType<Middleware>[] = [];

  const compose = (key: keyof ShuttleStateApi<S>, next: (...args: any[]) => any) => {
    return middlewares.reduce((handle, item) => {
      if (item[key]) {
        return item[key]!(handle);
      }
      return handle;
    }, next);
  };

  const api: ShuttleStateApi<S, T> = {
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
    use(middleware) {
      middlewares.push(middleware(api));
    },
  };

  return {
    getState() {
      return compose('getState', api.getState)();
    },
    setState(action) {
      return compose('setState', api.setState)(action);
    },
    resetState() {
      return compose('resetState', api.resetState)();
    },
    subscribe(listener, selector = defaultSelector, equalFn = defaultEqualFn) {
      return compose('subscribe', api.subscribe)(listener, selector, equalFn);
    },
    destroy() {
      return compose('destroy', api.destroy)();
    },
    clone(operator) {
      return compose('clone', api.clone)(operator);
    },
    use(middleware) {
      return compose('use', api.use)(middleware);
    },
  };
}
