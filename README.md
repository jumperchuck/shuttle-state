English | [简体中文](./README-CN.md)

# shuttle-state

> The state manager for React，generate a global state. It can also be used as a local state in any Provider.

[![npm version](https://img.shields.io/npm/v/shuttle-state.svg?logo=npm)](https://www.npmjs.com/package/shuttle-state)
[![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/shuttle-state.svg?logo=javascript)](https://www.npmjs.com/package/shuttle-state)
![React](https://img.shields.io/npm/dependency-version/shuttle-state/peer/react?logo=react)

```
npm install --save shuttle-state
# or
yarn add shuttle-state
```

## Features

- Like `Recoil` create an atom state
- Simple and efficient, no providers needed, just like `useState` used
- Can `get` / `set` / `subscribe` outside the component
- Support `Context`, Perfect support `Typescript`
- Support `Redux Devtools`, can use middleware extension function 

## Quick Start

### Create a state

It's a hook! You can put anything with `createState` to create persistent global shared state.
```tsx
import { createState } from 'shuttle-state';

const useValue = createState('');
```

### Use the state

Then bind your component, no providers needed. Use it like `useState`.  with an API for `reset` to reset the initial state.
```tsx
const Component = () => {
  const [value, setValue, resetValue] = useValue();
  return (
    <div>
      <input value={value} onChange={e => setValue(e.target.value)} />
      <button onClick={resetValue} />
    </div>
  );
}
```

It can also be invoked outside the component
```tsx
useValue.getState();
useValue.setState('new');
useValue.resetState();
useValue.subscribe((newState, prevState) => {});
```

Select your state and the component will re-render on changes.
```tsx
const useProduct = createState({
  name: 'water',
  price: 100,
});

const Component = () => {
  const [name, setProduct, resetProduct] = useProduct(state => state.name);
  return (
    <div>
      <input
        value={name}
        onChange={e => { 
          setProduct(product => ({ ...product, name: e.target.value }))
        }} 
      />
      <button onClick={resetProduct} />
    </div>
  );
}
```

## Advanced Usages

### Create a state with computed values

By the getter function as the first parameter, `get` return to any status of the latest value, and will automatically collect this dependency to the corresponding state.
```tsx
const useShow = createState(false);
const useCount1 = createState(1);
const useCount2 = createState(2);

// After useCount1 or useCount2 changes, it will be re-triggered getter
const useSum = createState(({ get }) => get(useCount1) + get(useCount2));

// Each triggering getter will re-collect dependence. If useCount is not used, the useCount changes will not trigger
const useRealCount = createState(({ get }) => {
  if (get(useShow)) {
    return get(useCount) * 2;
  }
  return 0;
});
```

Use the setter function as the second parameter, you can customize the behavior of `setState`.
```tsx
const useDoubledCount = createState(
  ({ get }) => get(useCount) * 2,
  ({ get, set, reset }, newValue) => {
    set(useCount, get(useCount) - newValue);
    reset(useList);
  }
);
// will modify useCount and reset useList
const [count, setCount] = useDoubledCount();
setCount(10);
```

Async actions
```ts
const useDoubledCount = createState(
  ({ get }) => get(useCount) * 2,
  async ({ get, set, reset }, url) => {
    const response = await fetch(url);
    set(useCount, (await response.json()));
  }
);
```

### Select the state by Selector

It detects changes with strict-equality `===` by default, this is efficient for atomic state.
```tsx
const useDiscount = create({
  name: 'discount',
  value: 10,
  type: 1,
})

// use in getter
const useProduct = createState(({ get }) => {
  const discount = get(useDiscount, (state) => state.value);
  return { name: '', price: 100 - discount }
});
// use in component
const [name] = useProduct(state => state.name);
```

If state is not an atom state, you want to construct a selected object, you can compare the change by the transfer function, and you can achieve MapStateTops similar to REDUX through the `shallow` function.
```tsx
import { shallow } from 'shuttle-state/compare';

// use in getter
const useProduct = createState(({ get }) => {
  const discount = get(useDiscount, (state) => ({ value: state.value, name: state.name }), shallow);
  return { name: '', price: 100 - discount.name }
});

// use in component
const [{ name, price }] = useProduct(state => ({ name: product.name, price: product.price }), shallow);
```

You can also use the `deep` to perform deep contrast or custom comparison functions.
```tsx
import { deep } from 'shuttle-state/compare';

useProduct(state => state, deep);
useProduct(state => state, (newState, prevState) => compare(newState, prevState));
```

### Get / Set / Subscribe state outside the component

In some cases, we need to modify or subscribe to changes outside the components.

```tsx
const useProduct = createState(() => ({ name: '', price: 100, quantity: 1 }));

// Get the latest value under the global
const name = useProduct.getState().name;
// Listening to all changes
const unsub1 = useProduct.subscribe((newState, prevState) => {});
// Listening to "name" changes
const unsub2 = useProduct.subscribe((newName, prevName) => {}, state => state.name);
// Listening to "name/price/quantity" changes
const unsub3 = useProduct.subscribe((newState, prevState) => {}, state => state, shallow);
// Updating name, will trigger listeners
useProduct.setState(state => ({ ...state, name: '123' }));
// Updating quantity, will trigger unsub1
useProduct.setState(state => ({ ...state, quantity: 1 }));
// Unsubscribe
unsub1();
unsub2();
unsub3();
// removing all listeners
useProduct.destroy();
```

## React Context

`createState` defaults to create a global state, no need provide context. However, in some cases, it may be necessary to use a Context injection state or partial state.

### Create a container

Create a container with `createContainer` that returns an object that needs to be used with the Provider.

```tsx
import { createState } from 'shuttle-state'
import { createContainer } from 'shuttle-state/context';

const container = createContainer();

const Page = () => {
  return (
    <Provider container={container}>
      <Component />
    </Provider>
  )
}
```

Create in the component needs to `destroy` when unmount to prevent memory leakage.
```tsx
import { useEffect } from 'react';
import { Provider, createContainer } from 'shuttle-state';

const App = () => {
  const container = createContainer();

  useEffect(() => container.destroy, [container]);

  return (
    <Provider container={container}>
      <Component />
    </Provider>
  );
}
```

### Use the container

The `state` used in the current context automatically create a new initialization state and mounts it under `container`.

```tsx
import { createState } from 'shuttle-state'
import { createContainer } from 'shuttle-state/context';

const container = createContainer();

const useValue = createState('');

const Component = () => {
  const [value, setValue] = useValue();
  return <input value={value} onChange={e => setValue(e.target.value)} />
}

const Page1 = () => {
  return <Component />
}

const Page2 = () => {
  return <Component />
}

const Page3 = () => {
  return (
    <Provider container={container}>
      <Component />
    </Provider>
  )
}

const Page4 = () => {
  return (
    <Provider container={container}>
      <Component />
    </Provider>
  )
}
```
> In the example, Page1 and Page2 use the global state, Page3 and Page4 use the same container, so Page3 and Page4 share the same state

`get` / `set` / `subscribe` the state in the context outside the component.
```tsx
container.getState(useValue);
container.setState(useValue, 'new');
container.resetState(useValue);
container.subscribe(useValue, (newState, prevState) => {});
container.destroy();
```

### Using a global state

State used under the provider will automatically create a new state mounted to the current `container` by default, if you want to use the global state in the current context, you need to add this state in `container`
```tsx
const container = createContainer();

container.addState(useValue);

<Provider container={container}>
  <useValue />
</Provider>
```

Relying on the computed values generated by other state also needs to add into the `container` in advance.
```tsx
const useValue1 = createState('');
const useValue2 = createState('');
const useValue3 = createState(({ get }) => get(useValue1, Number) + get(useValue2, Number));

const container = createContainer();
container.addState(useValue1);
container.addState(useValue2);

<Provider container={container}>
  <UseValue1 />
  <UseValue2 />
  <UseValue3 />
</Provider>
```

Clone a new container
```tsx
const newContainer = container.clone();
```

## Debug

### Use Redux Devtools

Using the `devtools` plugin, the state changes will be recorded and output to Redux devtools, taking a string parameter to indicate the different states

```tsx
import { createState } from 'shuttle-state';
import { devtools } from 'shuttle-state/middleware';

const useData = createState({});
useData.use(devtools('data'));
```

### Use Logger

Using the `logger` plugin, the state change will be printed to the console, taking a string parameter to indicate the different states

```tsx
import { createState } from 'shuttle-state';
import { logger } from 'shuttle-state/middleware';

const useData = createState({});
useData.use(logger('data'));
```

## 中间件

## API

### core
```tsx
import { createState, createApi } from 'shuttle-state';
```

### context
```tsx
import { Provider, createContainer, useApi, useContainer } from 'shuttle-state/context';
```

### compare
```tsx
import { shallow, deep, isShuttleState } from 'shuttle-state/compare';
```

### middleware
```tsx
import { logger, devtools } from 'shuttle-state/middleware';
```

