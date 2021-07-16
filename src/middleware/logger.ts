import { Middleware } from 'shuttle-state';

export default function logger(name?: string): Middleware {
  const prefix = name ? `${name} > ` : '';
  return (api) => {
    const { setState, resetState } = api;
    api.setState = (action) => {
      console.group(`${prefix}setState`, new Date().toLocaleString());
      console.info('%cprev state:', 'color: gray', api.getState());
      setState(action);
      console.info('%cnext state:', 'color: green', api.getState());
      console.groupEnd();
    };
    api.resetState = () => {
      console.group(`${prefix}resetState`, new Date().toLocaleString());
      console.info('%cprev state:', 'color: gray', api.getState());
      resetState();
      console.info('%cnext state:', 'color: green', api.getState());
      console.groupEnd();
    };
    return api;
  };
}
