import { SetStateAction } from 'react';
import {
  ShuttleState,
  ShuttleStateApi,
  Listener,
  Selector,
  EqualFn,
  Unsubscribe,
  GetSetStateType,
} from 'shuttle-state';

export type ApiMappings = Record<string, ShuttleStateApi<any> & { isClone?: boolean }>;

export interface ContainerType {
  getApi: <S, T>(shuttleState: ShuttleState<S, T>) => ShuttleStateApi<S, T>;
  addState: <S, T>(shuttleState: ShuttleState<S, T>, clone?: boolean) => void;
  removeState: <S, T>(shuttleState: ShuttleState<S, T>) => void;
  hasState: <S, T>(shuttleState: ShuttleState<S, T>) => boolean;
  getState: <S, T>(shuttleState: ShuttleState<S, T>) => S;
  setState: <TState extends ShuttleState<any>>(
    shuttleState: TState,
    newState: SetStateAction<GetSetStateType<TState>>,
  ) => void;
  resetState: <S, T>(shuttleState?: ShuttleState<S, T>) => void;
  subscribe: <S, V = S>(
    shuttleState: ShuttleState<S>,
    listener: Listener<V>,
    selector?: Selector<S, V>,
    equalFn?: EqualFn<V>,
  ) => Unsubscribe;
  destroy: () => void;
  clone: () => ContainerType;
}
