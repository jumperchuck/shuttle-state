import { createState } from '../src';
import { createContainer } from '../src/context';
import { shallow } from '../src/compare';

describe('createState().subscribe()', () => {
  it('should be called if new state is different', () => {
    const useValue = createState('0');
    const fn = jest.fn();
    useValue.subscribe(fn);
    useValue.setState('1');
    expect(fn).toHaveBeenCalled();
  });

  it('should not be called if new state is same', () => {
    const useValue = createState('0');
    const fn = jest.fn();
    useValue.subscribe(fn);
    useValue.setState('0');
    expect(fn).not.toHaveBeenCalled();
  });

  it('should be called if dependence state is different', () => {
    const useValue1 = createState(1);
    const useValue2 = createState(2);
    const useValue3 = createState(({ get }) => get(useValue1) + get(useValue2));
    const fn = jest.fn();
    useValue3.subscribe(fn);
    useValue1.setState(3);
    expect(fn).toHaveBeenCalled();
  });

  it('should not be called if dependence state is same', () => {
    const useValue1 = createState(1);
    const useValue2 = createState(2);
    const useValue3 = createState(({ get }) => get(useValue1) + get(useValue2));
    const fn = jest.fn();
    useValue3.subscribe(fn);
    useValue1.setState(1);
    useValue2.setState(2);
    expect(fn).not.toHaveBeenCalled();
  });

  it('should be called if new slice state is different', () => {
    const useProduct = createState({ name: '', price: 10 });
    const fn = jest.fn();
    useProduct.subscribe(fn, (state) => state.price);
    useProduct.setState({ name: '', price: 20 });
    expect(fn).toHaveBeenCalled();
  });

  it('should not be called if new slice state is same', () => {
    const useProduct = createState({ name: '', price: 10 });
    const fn = jest.fn();
    useProduct.subscribe(fn, (state) => state.price);
    useProduct.setState({ name: '', price: 10 });
    expect(fn).not.toHaveBeenCalled();
  });

  it('should be called if slice dependence state is different', () => {
    const useProduct = createState({ name: '', price: 10 });
    const useCount = createState(1);
    const useAmount = createState(
      ({ get }) => get(useProduct, (state) => state.price) * get(useCount),
    );
    const fn = jest.fn();
    useAmount.subscribe(fn);
    useProduct.setState({ name: '', price: 40 });
    expect(fn).toHaveBeenCalled();
  });

  it('should not be called if slice dependence state is same', () => {
    const useProduct = createState({ name: '', price: 10 });
    const useCount = createState(1);
    const useAmount = createState(
      ({ get }) => get(useProduct, (state) => state.price) * get(useCount),
    );
    const fn = jest.fn();
    useAmount.subscribe(fn);
    useProduct.setState({ name: '', price: 10 });
    expect(fn).not.toHaveBeenCalled();
  });

  it('should be called if new slice state is different from shallow', () => {
    const useProduct = createState({ name: '', price: 10 });
    const fn = jest.fn();
    useProduct.subscribe(fn, (state) => [state.price], shallow);
    useProduct.setState({ name: '', price: 20 });
    expect(fn).toHaveBeenCalled();
  });

  it('should not be called if new slice state is same from shallow', () => {
    const useProduct = createState({ name: '', price: 10 });
    const fn = jest.fn();
    useProduct.subscribe(fn, (state) => [state.price], shallow);
    useProduct.setState({ name: '', price: 10 });
    expect(fn).not.toHaveBeenCalled();
  });
});

describe('createContainer().subscribe()', () => {
  it('should be called if new state is different', () => {
    const container = createContainer();
    const useValue = createState('0');
    const fn = jest.fn();
    container.subscribe(useValue, fn);
    container.setState(useValue, '1');
    expect(fn).toHaveBeenCalled();
  });

  it('should not be called if new state is same', () => {
    const container = createContainer();
    const useValue = createState('0');
    const fn = jest.fn();
    container.subscribe(useValue, fn);
    container.setState(useValue, '0');
    expect(fn).not.toHaveBeenCalled();
  });

  it('should be called if dependence state is different', () => {
    const container = createContainer();
    const useValue1 = createState(1);
    const useValue2 = createState(2);
    const useValue3 = createState(({ get }) => get(useValue1) + get(useValue2));
    const fn = jest.fn();
    container.addState(useValue1);
    container.addState(useValue2);
    container.addState(useValue3);
    container.subscribe(useValue3, fn);
    container.setState(useValue1, 3);
    expect(fn).toHaveBeenCalled();
  });

  it('should not be called if dependence state is same', () => {
    const container = createContainer();
    const useValue1 = createState(1);
    const useValue2 = createState(2);
    const useValue3 = createState(({ get }) => get(useValue1) + get(useValue2));
    const fn = jest.fn();
    container.addState(useValue1);
    container.addState(useValue2);
    container.addState(useValue3);
    container.subscribe(useValue3, fn);
    container.setState(useValue1, 1);
    container.setState(useValue2, 2);
    expect(fn).not.toHaveBeenCalled();
  });

  it('should be called if new slice state is different', () => {
    const container = createContainer();
    const useProduct = createState({ name: '', price: 10 });
    const fn = jest.fn();
    container.addState(useProduct);
    container.subscribe(useProduct, fn, (state) => state.price);
    container.setState(useProduct, { name: '', price: 20 });
    expect(fn).toHaveBeenCalled();
  });

  it('should not be called if new slice state is same', () => {
    const container = createContainer();
    const useProduct = createState({ name: '', price: 10 });
    const fn = jest.fn();
    container.addState(useProduct);
    container.subscribe(useProduct, fn, (state) => state.price);
    container.setState(useProduct, { name: '', price: 10 });
    expect(fn).not.toHaveBeenCalled();
  });

  it('should be called if slice dependence state is different', () => {
    const container = createContainer();
    const useProduct = createState({ name: '', price: 10 });
    const useCount = createState(1);
    const useAmount = createState(
      ({ get }) => get(useProduct, (state) => state.price) * get(useCount),
    );
    const fn = jest.fn();
    container.addState(useProduct);
    container.addState(useCount);
    container.addState(useAmount);
    container.subscribe(useAmount, fn);
    container.setState(useProduct, { name: '', price: 40 });
    expect(fn).toHaveBeenCalled();
  });

  it('should not be called if slice dependence state is same', () => {
    const container = createContainer();
    const useProduct = createState({ name: '', price: 10 });
    const useCount = createState(1);
    const useAmount = createState(
      ({ get }) => get(useProduct, (state) => state.price) * get(useCount),
    );
    const fn = jest.fn();
    container.addState(useProduct);
    container.addState(useCount);
    container.addState(useAmount);
    container.subscribe(useAmount, fn);
    container.setState(useProduct, { name: '', price: 10 });
    expect(fn).not.toHaveBeenCalled();
  });

  it('should be called if new slice state is different from shallow', () => {
    const container = createContainer();
    const useProduct = createState({ name: '', price: 10 });
    const fn = jest.fn();
    container.addState(useProduct);
    container.subscribe(useProduct, fn, (state) => [state.price], shallow);
    container.setState(useProduct, { name: '', price: 20 });
    expect(fn).toHaveBeenCalled();
  });

  it('should not be called if new slice state is same from shallow', () => {
    const container = createContainer();
    const useProduct = createState({ name: '', price: 10 });
    const fn = jest.fn();
    container.addState(useProduct);
    container.subscribe(useProduct, fn, (state) => [state.price], shallow);
    container.setState(useProduct, { name: '', price: 10 });
    expect(fn).not.toHaveBeenCalled();
  });
});
