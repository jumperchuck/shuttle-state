import React, { useEffect, useMemo } from 'react';
import { Provider, createContainer } from 'shuttle-state/context';

import Todos from '../todos';

const container = createContainer();

export default function () {
  const localContainer = useMemo(() => createContainer(), []);

  useEffect(() => localContainer.destroy, [localContainer.destroy]);

  return (
    <div>
      <Provider container={container}>
        <Todos />
      </Provider>
      <Provider container={localContainer}>
        <Todos />
      </Provider>
    </div>
  );
}
