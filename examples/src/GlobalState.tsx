import React from 'react';
import { createState, ShuttleState } from 'shuttle-state';

const useValue1 = createState('');
const useValue2 = createState({});
const useValue3 = createState(({ get }) => {
  const value1 = get(useValue1);
  const value2 = get(useValue2, Number);
  return Number(value1) + value2;
});

const Value = (props: { useValue: ShuttleState<any> }) => {
  const { useValue } = props;
  const [value, setValue, resetValue] = useValue();
  return (
    <div>
      <input value={value} onChange={(event) => setValue(event.target.value)} />
      <button onClick={resetValue}>RESET</button>
    </div>
  );
};

export default function () {
  return (
    <div>
      <Value useValue={useValue1} />
      <Value useValue={useValue2} />
      <Value useValue={useValue3} />
    </div>
  );
}
