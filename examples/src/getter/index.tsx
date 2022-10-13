import React from 'react';
import { createState } from 'shuttle-state';
import { devtools } from 'shuttle-state/middleware';

const wait = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

const useData1 = createState({
  id: 0,
});

const useData2 = createState(({ get, set }) => {
  const id = get(useData1, (state) => state.id);
  return {
    id,
    update: async (newId: number) => {
      await wait(1000);
      console.log('update', newId);
      set(useData1, (state) => ({ ...state, id: newId }));
    },
  };
});

useData2.use(devtools('use'));

export default function () {
  const [data2] = useData2();

  return (
    <div>
      <span>{data2.id}</span>
      <button onClick={() => data2.update(data2.id + 1)}>Click</button>
    </div>
  );
}
