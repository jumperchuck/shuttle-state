import { createState, createContainer } from '../src';

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
});
