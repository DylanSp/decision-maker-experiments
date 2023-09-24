export function areAllElementsDistinct<T>(arr: Array<T>): boolean {
  const uniqueElements = new Set(arr);
  return arr.length === uniqueElements.size;
}

export function repeatNTimes<T>(element: T, n: number): Array<T> {
  return new Array<T>(n).fill(element);
}
