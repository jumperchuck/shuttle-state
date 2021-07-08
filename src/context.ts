import React, { createContext, useContext } from 'react';
import { ContainerType, ShuttleState } from './types';

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

export const useApi = <S>(shuttleState: ShuttleState<S>) => {
  const container = useContainer();
  if (container) {
    return container.getApi(shuttleState);
  }
  return shuttleState;
};

export default Context;
