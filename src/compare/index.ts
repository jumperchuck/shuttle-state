import { ShuttleState } from 'shuttle-state';

export function isShuttleState(obj: unknown): obj is ShuttleState<any> {
  return isObject(obj, 'Function') && obj.toString().startsWith('shuttle-state');
}

export function isObject(obj: unknown, type = 'Object'): obj is Object {
  return Object.prototype.toString.call(obj) === `[object ${type}]`;
}

export function shallow<T, U>(objA: T, objB: U) {
  return compare(objA, objB, false);
}

export function deep<T, U>(objA: T, objB: U) {
  return compare(objA, objB, true);
}

export default function compare<T, U>(objA: T, objB: U, deep: boolean) {
  if (Object.is(objA, objB)) {
    return true;
  }
  if (
    (Array.isArray(objA) && Array.isArray(objB)) ||
    (isObject(objA) && isObject(objB))
  ) {
    const keysA = Object.keys(objA);
    if (keysA.length !== Object.keys(objB).length) {
      return false;
    }
    for (let i = 0; i < keysA.length; i++) {
      if (!Object.prototype.hasOwnProperty.call(objB, keysA[i])) {
        return false;
      }
      if (deep) {
        if (!compare(objA[keysA[i] as keyof T], objB[keysA[i] as keyof U], deep)) {
          return false;
        }
      } else {
        if (!Object.is(objA[keysA[i] as keyof T], objB[keysA[i] as keyof U])) {
          return false;
        }
      }
    }
    return true;
  }
  return false;
}
