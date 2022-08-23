import type { ElementOf, RefObject, Props, Methods, Widget } from 'novo-ui';

// === exports =======================================================

export { classes, combineStyles, createRef, createElemRef, css };

// === exported functions ============================================

function createRef<T>(value: T | null = null): RefObject<T> {
  return { value };
}

function createElemRef<T extends HTMLElement>(): RefObject<T>;
function createElemRef<C extends Widget<any, any>>(): RefObject<ElementOf<C>>;

function createElemRef() {
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

function css(parts: TemplateStringsArray, ...values: any[]): string {
  if (parts.length === 1) {
    return parts[0];
  }

  const arr: string[] = [];

  parts.forEach((part, idx) => {
    arr.push(part);

    const value = values![idx];

    if (value != null) {
      arr.push(String(values![idx]));
    }
  });

  return arr.join('');
}

// === local helpers =================================================

const hasOwn = {}.hasOwnProperty;
