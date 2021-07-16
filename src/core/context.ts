import { ShuttleState, ShuttleStateApi } from './types';

export default {
  useApi: <S, T>(shuttleState: ShuttleState<S, T>): ShuttleStateApi<S, T> => shuttleState,
};
