import type { RefObject, Widget } from 'novo-ui';

// === exports =======================================================

export { classes, combineStyles, createRef, createRefFor };

// === exported functions ============================================

function createRef<T>(value: T | null = null): RefObject<T> {
  return { value };
}

function createRefFor<T extends object>(
  component: Widget<{ ref: RefObject<T> }>
): RefObject<T> {
  return createRef();
}

function combineStyles(styles: string | string[]) {
  return (Array.isArray(styles) ? styles : [styles])
    .map((it) => it.trim())
    .join('\n\n// -----------\n\n');
}

function classes(
  ...args: (
    | undefined
    | null
    | false
    | string
    | (undefined | null | false | string)[]
    | Record<string, boolean>
  )[]
): string {
  const arr: string[] = [];

  for (const arg of args) {
    if (arg) {
      if (typeof arg === 'string') {
        arr.push(arg);
      } else if (Array.isArray(arg)) {
        for (const s of arg) {
          if (s) {
            arr.push(s);
          }
        }
      } else {
        for (const key in arg) {
          if (hasOwn.call(arg, key) && (arg as any)[key]) {
            arr.push(key);
          }
        }
      }
    }
  }

  return arr.join(' ');
}

// === local helpers =================================================

const hasOwn = {}.hasOwnProperty;
