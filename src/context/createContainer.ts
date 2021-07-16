import { ApiOperator } from 'shuttle-state';
import { ContainerType, ApiMappings } from './types';

export default function createContainer(cloneApis?: ApiMappings) {
  const apis: ApiMappings = {};

  const operator: ApiOperator = {
    get: (shuttleState) => container.getState(shuttleState),
    set: (shuttleState, newState) => container.setState(shuttleState, newState),
    reset: (shuttleState) => container.resetState(shuttleState),
    subscribe: (shuttleState, listener) => container.subscribe(shuttleState, listener),
  };

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
          ? { ...shuttleState.clone(operator), isClone: clone }
          : shuttleState;
      }
    },
    removeState(shuttleState) {
      const key = shuttleState.toString();
      if (apis[key] && apis[key].isClone) {
        apis[key].destroy();
      }
      delete apis[key];
    },
    hasState(shuttleState) {
      return !!apis[shuttleState.toString()];
    },
    getState(shuttleState) {
      return container.getApi(shuttleState).getState();
    },
    setState(shuttleState, newState) {
      return container.getApi(shuttleState).setState(newState);
    },
    resetState(shuttleState) {
      if (shuttleState) {
        if (container.hasState(shuttleState)) {
          container.getApi(shuttleState).resetState();
        }
      } else {
        Object.values(apis).forEach((item) => {
          if (item.isClone) {
            item.resetState();
          }
        });
      }
    },
    subscribe(shuttleState, listener, selector, equalFn) {
      return container.getApi(shuttleState).subscribe(listener, selector, equalFn);
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
      apis[key] = isClone ? { isClone, ...clone(operator) } : cloneApis[key];
    });
  }

  return container;
}
