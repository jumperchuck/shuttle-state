import React from 'react';
import { Provider, createState, createContainer, ShuttleState } from 'shuttle-state';

const useValue1 = createState('');

const useValue2 = createState('');

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

const container = createContainer();

export default function () {
  return (
    <div>
      <Provider container={container}>
        <Value useValue={useValue1} />
        <Value useValue={useValue2} />
        <Value useValue={useValue3} />
      </Provider>
    </div>
  );
}
