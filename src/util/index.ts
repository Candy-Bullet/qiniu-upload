export function isFunction(val: any): val is Function {
  return val && typeof val === 'function'
}
