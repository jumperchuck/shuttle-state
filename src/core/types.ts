import { Dispatch, SetStateAction } from 'react';

export type Listener<T> = (newState: T, prevState: T) => void;

export type Unsubscribe = () => void;

export type Selector<S, V = S> = (state: S) => V;

export type EqualFn<S> = (newState: S, prevState: S) => boolean;

export type GetterOptions = {
  get: <S, V = S>(
    shuttleState: ShuttleState<S>,
    selector?: Selector<S, V>,
    equalFn?: EqualFn<S>,
  ) => V;
};

export type Getter<T> = T | Promise<T> | ((options: GetterOptions) => T | Promise<T>);

export type SetterOptions = {
  get: <S, T>(shuttleState: ShuttleState<S, T>) => S;
  set: <TState extends ShuttleState<any>>(
    shuttleState: TState,
    newState: SetStateAction<GetSetStateType<TState>>,
  ) => void;
  reset: <S, T>(shuttleState: ShuttleState<S, T>) => void;
};

export type Setter<T> = (options: SetterOptions, newValue: T) => void;

export type ApiOperator = SetterOptions & {
  subscribe: <T>(shuttleState: ShuttleState<T>, listener: Listener<T>) => Unsubscribe;
};

export interface ShuttleState<S, T = S> extends ShuttleStateApi<S, T> {
  <V = S>(selector?: Selector<S, V>, equalFn?: EqualFn<V>): [
    V,
    Dispatch<SetStateAction<T>>,
    () => void,
  ];
}

export interface ShuttleStateApi<S, T = S> {
  getState: () => S;
  setState: Dispatch<SetStateAction<T>>;
  resetState: () => void;
  subscribe: <V = S>(
    listener: Listener<V>,
    selector?: Selector<S, V>,
    equalFn?: EqualFn<V>,
  ) => Unsubscribe;
  destroy: () => void;
  clone: (operator?: ApiOperator) => ShuttleStateApi<S, T>;
  use: (middleware: Middleware) => void;
}

export interface Middleware {
  (api: ShuttleStateApi<any>): ShuttleStateApi<any>;
}

export type GetGetStateType<Api> = Api extends ShuttleStateApi<infer S> ? S : unknown;

export type GetSetStateType<Api> = Api extends ShuttleStateApi<infer S, infer T>
  ? T
  : unknown;
