[English](./README.md) | 简体中文

# shuttle-state

> React状态管理器，创建全局状态，也可以穿梭在任意Provider下当作局部状态使用

[![npm version](https://img.shields.io/npm/v/shuttle-state.svg?logo=npm)](https://www.npmjs.com/package/shuttle-state)
[![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/shuttle-state.svg?logo=javascript)](https://www.npmjs.com/package/shuttle-state)
![React](https://img.shields.io/npm/dependency-version/shuttle-state/peer/react?logo=react)

```
npm install --save shuttle-state
# or
yarn add shuttle-state
```

## 特性

- 类似`Recoil`可创建原子state
- 简单高效，无需Provider包裹，就像`useState`一样使用
- 可在组件外部`获取`/`修改`/`订阅`
- 支持`Context`, 支持`Typescript`
- 支持`Redux Devtools`，可使用中间件扩展功能

## 快速上手

### 创建一个 State

返回的是一个hook，可以传递任何类型的参数，经过`createState`包装后，就变成了持久化，且全局共享的state
```tsx
import { createState } from 'shuttle-state';

const useValue = createState('');
```

### 使用 State

然后在组件里使用，不需要用Provider包裹，就像`useState`那样使用，多了一个`reset`重置初始化状态的api

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

也可以在组件外部调用
```tsx
useValue.getState();
useValue.setState('new');
useValue.resetState();
useValue.subscribe((newState, prevState) => {});
```

传递`selector`函数，组件将在变化时重新渲染
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

## 进阶方法

### 创建具有计算值的state

通过getter函数作为第一个参数，`get`返回任何状态最新的值，并且会自动收集这个依赖到对应的state
```tsx
const useShow = createState(false);
const useCount1 = createState(1);
const useCount2 = createState(2);

// useCount1和useCount2变化后会重新触发getter
const useSum = createState(({ get }) => get(useCount1) + get(useCount2));

// 每次触发getter会重新收集依赖，如果useCount未被使用，useCount变化后也不会重新触发
const useRealCount = createState(({ get }) => {
  if (get(useShow)) {
    return get(useCount) * 2;
  }
  return 0;
});
```

通过setter函数作为第二个参数，可以自定义`setState`的行为
```tsx
const useDoubledCount = createState(
  ({ get }) => get(useCount) * 2,
  ({ get, set, reset }, newValue) => {
    set(useCount, get(useCount) - newValue);
    reset(useList);
  }
);
// 将会修改useCount和重置useList
const [count, setCount] = useDoubledCount();
setCount(10);
```

异步的setter
```ts
const useDoubledCount = createState(
  ({ get }) => get(useCount) * 2,
  async ({ get, set, reset }, url) => {
    const response = await fetch(url);
    set(useCount, (await response.json()));
  }
);
```

### 通过selector选择用到的状态

默认情况下，是使用`===`检测更改，对于原子状态是很有效的
```tsx
const useDiscount = create({
  name: 'discount',
  value: 10,
  type: 1,
})

// getter函数内
const useProduct = createState(({ get }) => {
  const discount = get(useDiscount, (state) => state.value);
  return { name: '', price: 100 - discount }
});
// 组件内
const [name] = useProduct(state => state.name);
```

如果state不是一个原子状态又想要构造一个可以选择的对象，可以通过传递equalFn参数来对比变化，通过`shallow`浅对比可以实现类似redux的mapStateToProps
```tsx
import { shallow } from 'shuttle-state/compare';

// getter函数内
const useProduct = createState(({ get }) => {
  const discount = get(useDiscount, (state) => ({ value: state.value, name: state.name }), shallow);
  return { name: '', price: 100 - discount.name }
});

// 组件内
const [{ name, price }] = useProduct(state => ({ name: product.name, price: product.price }), shallow);
```

也可以通过`deep`进行深对比或者自定义对比函数
```tsx
import { deep } from 'shuttle-state/compare';

useProduct(state => state, deep);
useProduct(state => state, (newState, prevState) => compare(newState, prevState));
```

### 在组件外部获取/修改/订阅状态

某些情况下，我们需要在组件外部去修改或者订阅状态的变化

```tsx
const useProduct = createState(() => ({ name: '', price: 100, quantity: 1 }));

// 获取全局下最新的值
const name = useProduct.getState().name;
// 订阅product的变化
const unsub1 = useProduct.subscribe((newState, prevState) => {});
// 订阅product.name的变化
const unsub2 = useProduct.subscribe((newName, prevName) => {}, state => state.name);
// 订阅product的变化，浅对比，name/price/quantity变化了才会触发
const unsub3 = useProduct.subscribe((newState, prevState) => {}, state => state, shallow);
// 修改状态，将会触发所有监听
useProduct.setState(state => ({ ...state, name: '123' }));
// 修改状态，触发unsub1的监听
useProduct.setState(state => ({ ...state, quantity: 1 }));
// 注销监听器
unsub1();
unsub2();
unsub3();
// 注销所有监听器
useProduct.destroy();
```

## React Context

使用`createState`默认是创建全局状态，不需要提供context。但在某些情况下，可能需要使用context注入状态或者隔离局部状态

### 创建一个 Container

通过`createContainer`创建一个容器，返回的是一个对象，需要配合Provider使用

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

在组件内创建需要在unmount的时候`destroy`防止内存泄漏

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

### 使用 Container

在当前上下文中使用的`state`会自动创建一个新的初始化状态挂载到`container`下

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
> 在上面例子里，Page1和Page2使用的是全局状态，Page3和Page4使用的同一个container，所以Page3和Page4共享同个状态

在组件外部获取/修改/订阅当前上下文中的`state`

```tsx
container.getState(useValue);
container.setState(useValue, 'new');
container.resetState(useValue);
container.subscribe(useValue, (newState, prevState) => {});
```

### 使用全局状态

默认情况下，在Provider下使用的state都会自动创建一个新的状态挂载到当前的`container`里，如果想在当前Context中使用全局状态而不是创建局部状态，
需要提前将这个state添加进`container`里
```tsx
const container = createContainer();

container.addState(useValue);

<Provider container={container}>
  <Component />
</Provider>
```

如果依赖其他state产生出的状态也需要提前添加进`container`中
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

复制一个新的container
```tsx
const newContainer = container.clone();
```

## Debug

### 使用 Redux Devtools

使用`devtools`插件，会记录state的变化输出到Redux Devtools，接受一个string参数来标示不同的状态

```tsx
import { createState } from 'shuttle-state';
import { devtools } from 'shuttle-state/middleware';

const useData = createState({});
useData.use(devtools('data'));
```

### 使用 Logger

使用`logger`插件，会打印state的变化到控制台，接受一个string参数来标示不同的状态

```tsx
import { createState } from 'shuttle-state';
import { logger } from 'shuttle-state/middleware';

const useData = createState({});
useData.use(logger('data'));
```

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

