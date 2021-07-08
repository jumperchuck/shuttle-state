English | [简体中文](./README-CN.md)

# shuttle-state

> Generate a global state, or a part state in React.

```
npm install --save shuttle-state
# or
yarn add shuttle-state
```

## Quick Start

### Create a state

```tsx
import { createState } from 'shuttle-state';

const useValue = createState('');

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

### Create a container

```tsx
import { Provider, createContainer } from 'shuttle-state';

const container = createContainer();

const App = () => {
  return (
    <div>
      <Provider container={container}>
        <Component />
      </Provider>
      <Provider container={createContainer()}>
        <Component />
      </Provider>
      <Component />
    </div>
  );
}
```

### API
