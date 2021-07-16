import React from 'react';
import { createState } from 'shuttle-state';

const useValue1 = createState('');

const useValue2 = createState('');

const useValue3 = createState(({ get }) => get(useValue1).length + get(useValue2).length);

const Value1 = () => {
  const [value, setValue, resetValue] = useValue1();
  return (
    <div>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <button onClick={resetValue}>reset</button>
    </div>
  );
};

const Value2 = () => {
  const [value, setValue, resetValue] = useValue2();
  return (
    <div>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <button onClick={resetValue}>reset</button>
    </div>
  );
};

const Value3 = () => {
  const [value] = useValue3();
  return (
    <div>
      Total length: {value}
      <em style={{ backgroundColor: 'yellow', marginLeft: 20 }}>
        This is computed value
      </em>
    </div>
  );
};

export default function () {
  return (
    <div>
      <Value1 />
      <Value2 />
      <Value3 />
    </div>
  );
}
