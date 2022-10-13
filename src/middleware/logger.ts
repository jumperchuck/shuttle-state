import { Middleware } from 'shuttle-state';

export default function logger(name?: string): Middleware {
  const prefix = name ? `${name} > ` : '';
  return (api) => {
    return {
      setState(next) {
        return (action) => {
          console.group(`${prefix}setState`, new Date().toLocaleString());
          console.info('%cprev state:', 'color: gray', api.getState());
          next(action);
          console.info('%cnext state:', 'color: green', api.getState());
          console.groupEnd();
        };
      },
      resetState(next) {
        return () => {
          console.group(`${prefix}resetState`, new Date().toLocaleString());
          console.info('%cprev state:', 'color: gray', api.getState());
          next();
          console.info('%cnext state:', 'color: green', api.getState());
          console.groupEnd();
        };
      },
    };
  };
}
