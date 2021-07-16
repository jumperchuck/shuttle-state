import React, { createContext, useContext } from 'react';
import { context, ShuttleState, ShuttleStateApi } from 'shuttle-state';
import { ContainerType } from './types';

export const Context = createContext<ContainerType | null>(null);

export const Provider: React.FC<{ container: ContainerType }> = (props) => {
  const { container, ...rest } = props;

  return React.createElement(Context.Provider, {
    value: container,
    ...rest,
  });
};

export const Consumer = Context.Consumer;

export const useContainer = () => useContext(Context);

export const useApi = <S, T>(shuttleState: ShuttleState<S, T>): ShuttleStateApi<S, T> => {
  const container = useContainer();
  if (container) {
    return container.getApi(shuttleState);
  }
  return shuttleState;
};

context.useApi = useApi;

export default Context;
