import { ContainerType, ShuttleStateApi } from './types';

export type ApiMappings = Record<string, ShuttleStateApi<any> & { isClone?: boolean }>;

export default function createContainer(cloneApis?: ApiMappings) {
  const apis: ApiMappings = {};

  const container: ContainerType = {
    getApi(shuttleState) {
      const key = shuttleState.toString();
      if (!apis[key]) container.addState(shuttleState, true);
      return apis[key];
    },
    addState(shuttleState, clone = false) {
      const key = shuttleState.toString();
      if (!apis[key]) {
        apis[key] = clone
          ? { ...shuttleState.clone(container), isClone: clone }
          : shuttleState;
      }
    },
    removeState(shuttleState) {
      const key = shuttleState.toString();
      if (apis[key]?.isClone) {
        apis[key].destroy();
      }
      delete apis[key];
    },
    hasState(shuttleState) {
      const key = shuttleState.toString();
      return !!apis[key];
    },
    getState(shuttleState) {
      const key = shuttleState.toString();
      if (!apis[key]) container.addState(shuttleState, true);
      return apis[key].getState();
    },
    setState(shuttleState, newState) {
      const key = shuttleState.toString();
      if (!apis[key]) container.addState(shuttleState, true);
      apis[key].setState(newState);
    },
    resetState(shuttleState) {
      if (shuttleState) {
        const key = shuttleState.toString();
        if (!apis[key]) container.addState(shuttleState, true);
        else apis[key]?.resetState();
      } else {
        Object.values(apis).forEach((item) => {
          if (item.isClone) {
            item.resetState();
          }
        });
      }
    },
    subscribe(shuttleState, listener, selector, equalFn) {
      const key = shuttleState.toString();
      if (!apis[key]) container.addState(shuttleState, true);
      return apis[key].subscribe(listener, selector, equalFn);
    },
    destroy() {
      Object.values(apis).forEach((item) => {
        if (item.isClone) {
          item.destroy();
        }
      });
    },
    clone() {
      return createContainer(apis);
    },
  };

  if (cloneApis) {
    Object.keys(cloneApis).forEach((key) => {
      const { isClone, clone } = cloneApis[key];
      apis[key] = isClone ? { isClone, ...clone(container) } : cloneApis[key];
    });
  }

  return container;
}
