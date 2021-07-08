import { shallow, deep } from '../src/compare';

describe('shallow', () => {
  it('compares primitive', () => {
    expect(shallow(1, 1)).toBe(true);
    expect(shallow(1, 2)).toBe(false);

    expect(shallow('1', '1')).toBe(true);
    expect(shallow('1', '2')).toBe(false);

    expect(shallow(true, true)).toBe(true);
    expect(shallow(true, false)).toBe(false);

    expect(shallow(null, null)).toBe(true);
    expect(shallow(undefined, undefined)).toBe(true);
    expect(shallow(null, undefined)).toBe(false);
  });

  it('compares array', () => {
    expect(shallow([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(shallow([1, 2, 3], [2, 3, 4])).toBe(false);

    expect(shallow([{ name: 'ck' }, { sex: 1 }], [{ name: 'ck' }, { age: 25 }])).toBe(
      false,
    );

    expect(shallow([{ name: 'ck' }], [{ name: 'ck', sex: 1 }])).toBe(false);
  });

  it('compares object', () => {
    expect(shallow({ name: 'ck', sex: 1 }, { name: 'ck', sex: 1 })).toBe(true);

    expect(shallow({ name: 'ck', sex: 1 }, { name: 'bar', age: 25 })).toBe(false);

    expect(shallow({ name: 'ck', list: [] }, { name: 'ck', list: [] })).toBe(false);

    expect(shallow({ '0': 0, '1': 1 }, [0, 1])).toBe(false);
  });
});

describe('deep', () => {
  it('compares primitive', () => {
    expect(deep(1, 1)).toBe(true);
    expect(deep(1, 2)).toBe(false);

    expect(deep('1', '1')).toBe(true);
    expect(deep('1', '2')).toBe(false);

    expect(deep(true, true)).toBe(true);
    expect(deep(true, false)).toBe(false);

    expect(deep(null, null)).toBe(true);
    expect(deep(undefined, undefined)).toBe(true);
    expect(deep(null, undefined)).toBe(false);
  });

  it('compares array', () => {
    expect(deep([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deep([1, 2, 3], [2, 3, 4])).toBe(false);

    expect(deep([{ name: 'ck' }, { sex: 1 }], [{ name: 'ck' }, { age: 25 }])).toBe(false);

    expect(deep([{ name: 'ck', list: [] }], [{ name: 'ck', list: [] }])).toBe(true);
  });

  it('compares object', () => {
    expect(deep({ name: 'ck', sex: 1 }, { name: 'ck', sex: 1 })).toBe(true);

    expect(deep({ name: 'ck', sex: 1 }, { name: 'bar', age: 25 })).toBe(false);

    expect(
      deep(
        { name: 'ck', list: [{ name: 'ck', age: 25 }] },
        { name: 'ck', list: [{ name: 'ck', age: 25 }] },
      ),
    ).toBe(true);

    expect(deep({ '0': 0, '1': 1 }, [0, 1])).toBe(false);
  });
});
