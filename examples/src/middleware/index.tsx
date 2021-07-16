import React from 'react';
import { createState } from 'shuttle-state';
import { devtools, logger } from 'shuttle-state/middleware';

const useValue = createState('');
useValue.use(logger('value'));
useValue.use(devtools('value'));

export default function () {
  const [value, setValue, resetValue] = useValue();
  return (
    <div>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <button onClick={resetValue}>reset</button>
    </div>
  );
}
