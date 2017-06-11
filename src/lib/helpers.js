/* eslint-disable */
export function isInitialOrHasNoParents(chunk) {
  return chunk.isInitial() || chunk.parents.length === 0;
}

export function isInvalidOrder(a, b) {
  const bBeforeA = a.getPrevModules().includes(b);
  const aBeforeB = b.getPrevModules().includes(a);
  return aBeforeB && bBeforeA;
}

export function getOrder(a, b) {
  const aOrder = a.getOrder();
  const bOrder = b.getOrder();
  if (aOrder < bOrder) return -1;
  if (aOrder > bOrder) return 1;
  const aIndex = a.getOriginalModule().index2;
  const bIndex = b.getOriginalModule().index2;
  if (aIndex < bIndex) return -1;
  if (aIndex > bIndex) return 1;
  const bBeforeA = a.getPrevModules().includes(b);
  const aBeforeB = b.getPrevModules().includes(a);
  if (aBeforeB && !bBeforeA) return -1;
  if (!aBeforeB && bBeforeA) return 1;
  const ai = a.identifier();
  const bi = b.identifier();
  if (ai < bi) return -1;
  if (ai > bi) return 1;
  return 0;
}

export function getLoaderObject(loader) {
  if (isString(loader)) {
    return { loader };
  }
  return loader;
}

export function mergeOptions(a, b) {
  if (!b) return a;
  Object.keys(b).forEach((key) => {
    a[key] = b[key];
  });
  return a;
}

export function isString(a) {
  return typeof a === 'string';
}

export function isFunction(a) {
  return isType('Function', a);
}

export function isType(type, obj) {
  return Object.prototype.toString.call(obj) === `[object ${type}]`;
}
