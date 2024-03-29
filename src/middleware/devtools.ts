import { Middleware } from 'shuttle-state';

type Config = {
  instanceID?: number;
  name?: string;
  serialize?: boolean;
  actionCreators?: any;
  latency?: number;
  predicate?: any;
  autoPause?: boolean;
};

type Message = {
  type: string;
  payload?: any;
  state?: any;
};

type ConnectionResult = {
  subscribe: (dispatch: (message: Message) => void) => void;
  unsubscribe: () => void;
  send: (action: string, state: any) => void;
  init: (state: any) => void;
  error: (payload: any) => void;
};

type Extension = {
  connect: (options?: Config) => ConnectionResult;
};

export default function devtools(name?: string): Middleware {
  let extension: Extension | undefined;
  try {
    extension = (window as any).__REDUX_DEVTOOLS_EXTENSION__;
  } catch {}
  if (process.env.NODE_ENV === 'development') {
    if (!extension) {
      console.warn('Please install/enable Redux devtools');
    }
  } else {
    extension = undefined;
  }
  return (api) => {
    if (extension) {
      const devtools = extension.connect({ name });
      const prefix = name ? `${name} > ` : '';
      devtools.subscribe((message) => {
        if (message.type === 'DISPATCH' && message.state) {
          if (
            message.payload.type === 'JUMP_TO_ACTION' ||
            message.payload.type === 'JUMP_TO_STATE'
          ) {
            api.setState(JSON.parse(message.state));
          } else {
            api.setState(JSON.parse(message.state));
          }
        } else if (
          message.type === 'DISPATCH' &&
          message.payload &&
          message.payload.type === 'COMMIT'
        ) {
          devtools.init(api.getState());
        } else if (
          message.type === 'DISPATCH' &&
          message.payload &&
          message.payload.type === 'IMPORT_STATE'
        ) {
          const { nextLiftedState } = message.payload;
          const actions = nextLiftedState ? nextLiftedState.actionsById : undefined;
          const computedStates = nextLiftedState ? nextLiftedState.computedStates : [];

          computedStates.forEach(({ state }: { state: any }, index: number) => {
            const action = actions[index] || `${prefix}setState`;

            if (index === 0) {
              devtools.init(state);
            } else {
              api.setState(state);
              devtools.send(action, api.getState());
            }
          });
        }
      });
      devtools.init(api.getState());
      return {
        setState(next) {
          return (action) => {
            next(action);
            devtools.send(`${prefix}setState`, api.getState());
          };
        },
        resetState(next) {
          return () => {
            next();
            devtools.send(`${prefix}resetState`, api.getState());
          };
        },
      };
    }
    return {};
  };
}
