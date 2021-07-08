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
  get: <S>(shuttleState: ShuttleState<S>) => S;
  set: <S>(shuttleState: ShuttleState<S>, newState: S) => void;
  reset: <S>(shuttleState: ShuttleState<S>) => void;
};

export type Setter<T> = (options: SetterOptions, newValue: T) => void;

export interface ContainerType {
  getApi: <S>(shuttleState: ShuttleState<S>) => ShuttleStateApi<S>;
  addState: <S>(shuttleState: ShuttleState<S>, clone?: boolean) => void;
  removeState: <S>(shuttleState: ShuttleState<S>) => void;
  hasState: <S>(shuttleState: ShuttleState<S>) => boolean;
  getState: <S>(shuttleState: ShuttleState<S>) => S;
  setState: <S>(shuttleState: ShuttleState<S>, newState: SetStateAction<S>) => void;
  resetState: <S>(shuttleState?: ShuttleState<S>) => void;
  subscribe: <S, V = S>(
    shuttleState: ShuttleState<S>,
    listener: Listener<V>,
    selector?: Selector<S, V>,
    equalFn?: EqualFn<V>,
  ) => Unsubscribe;
  destroy: () => void;
  clone: () => ContainerType;
}

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
  clone: (container?: ContainerType) => ShuttleStateApi<S, T>;
}
