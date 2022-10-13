import React, { useEffect, useMemo } from 'react';
import { Provider, createContainer } from 'shuttle-state/context';

import Todos from '../todos';

const container = createContainer();

export default function () {
  const localContainer = useMemo(() => createContainer(), []);

  useEffect(() => localContainer.destroy, [localContainer.destroy]);

  return (
    <div>
      {/* @ts-ignore */}
      <Provider container={container}>
        <Todos />
      </Provider>
      {/* @ts-ignore */}
      <Provider container={localContainer}>
        <Todos />
      </Provider>
    </div>
  );
}
