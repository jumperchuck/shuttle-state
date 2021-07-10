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

## 快速上手

### 创建一个State

返回的是一个hook，可以传递任何类型的参数，经过`createState`包装后，就变成了持久化，且全局共享的state
```tsx
import { createState } from 'shuttle-state';

const useValue = createState('');
const useCount = createState(0);
const useList = createState(['China', 'GuangDong', 'ShenZhen']);
const useProduct = createState({
  name: 'water',
  price: 100,
});
```

然后在组件里使用，不需要用Provider包裹，就像`useState`那样使用
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

传递selector函数，组件将在变化时重新渲染
```tsx
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

### 创建一个Container

基于React Context使用，被Provider包裹的`state`会自动创建一个新的状态在当前上下文
```tsx
import { Provider, createContainer } from 'shuttle-state';

const container1 = createContainer();
const container2 = createContainer();

const App = () => {
  return (
    <div>
      <Provider container={container2}>
        <Component />
      </Provider>
      <Provider container={container2}>
        <Component />
      </Provider>
      <Component />
    </div>
  );
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

在组件外部获取或者修改当前上下文中的`state`
```tsx
const container = createContainer();
container.getState(useValue);
container.setState(useValue, 'new');
container.subscribe(useValue, (newState, prevState) => {});
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
  return ...
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

### 在组件外部获取/修改/监听状态

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

在React Context下，需要通过`createContainer`来获取和订阅当前上下文中的state
```tsx
const container = createContainer();

<Provider container={container}>
  ...
</Provider>

const name = container.getState(useProduct).name;
const unsub1 = container.subscribe(useProduct, (newState, prevState) => {});
const unsub2 = container.subscribe(useProduct, (newName, prevName) => {}, state => state.name);
container.setState(useProduct, (state) => ({ ...state, name: '123' }));
container.destroy();
```

### 在React Context下使用全局状态

默认情况下，在Provider下使用的state都会自动创建一个新的状态挂载到当前的`container`里，如果想在当前Context中使用全局状态而不是创建局部状态，
需要提前将这个state添加进`container`里
```tsx
const container = createContainer();

container.addState(useValue);

<Provider container={container}>
  <UseValue />
</Provider>
```

如果依赖其他state产生出的状态也需要提前添加进`container`中
```tsx
const useValue1 = createState('');
const useValue2 = createState('');
const useValue3 = createState(({ get }) => get(useValue1, Number) + get(useValue2, Number));

const container = createContainer();
container.addState(useValue1);

<Provider container={container}>
  <UseValue1 />
  <UseValue2 />
  <UseValue3 />
</Provider>
```

复制一个新的container
```
const newContainer = container.clone();
```

## Debug
🤔

## API

### createState

### createContainer

### createApi

### useContainer

### useApi
