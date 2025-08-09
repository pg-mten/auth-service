export class DtoHelper {
  static assign<T extends object>(target: T, source: T): void {
    const allowedKeys = Object.keys(target) as (keyof T)[];
    for (const key of allowedKeys) {
      if (key in source) {
        target[key] = source[key];
      }
    }
  }
}
