import { h, patch, text } from './internal/vdom';

// === exports =======================================================

export { createElement, elem, intercept, methods, opt, props, render, req };

export type {
  Props,
  Ref,
  RefCallback,
  RefObject,
  VNode,
  Component,
  ComponentCtrl,
  ComponentInstance
};

// === exported types ================================================

declare const symOpaqueType: unique symbol;

type Props = Record<string, any>;
type VNode = any; // TODO!!!
type RefObject<T> = { value: T | null };
type RefCallback<T> = (value: T | null) => void;
type Ref<T> = RefObject<T> | RefCallback<T>;

type Component<P extends Props = {}, M extends Methods = {}> = {
  new (): ComponentInstance<P, M>;
  tagName: string;
};

type ComponentInstance<
  P extends Props = {},
  M extends Methods = {}
> = HTMLElement & P & M;

type ComponentCtrl = {
  getElement(): HTMLElement;
  update(): void;
  afterMount: (task: () => void) => void;
  beforeUpdate: (task: () => void) => void;
  afterUpdate: (task: () => void) => void;
  beforeUnmount: (task: () => void) => void;
};

// === local types ===================================================

type Func<A extends any[], R extends any> = (...args: A) => R;
type Methods = Record<string, Func<any, any>>;

type InitFunc<P extends PropsDef = PropsDef, M extends Methods = Methods> = (
  self: ComponentInstance<PropsType2<P>, M>
) => () => VNode;

type PropDefReq<T> = { required: true };
type PropDefOpt<T> = { required: false; defaultValue: never };
type PropDefVal<T> = { required: false; defaultValue: T };
type PropDef<T> = PropDefReq<T> | PropDefOpt<T> | PropDefVal<T>;
type PropsDef = Record<string, PropDef<unknown>>;

type PropsType<T extends PropsDef> = {
  [K in keyof T as T[K] extends PropDefReq<any>
    ? K
    : never]: T[K] extends PropDefReq<infer U> ? U : never;
} & {
  [K in keyof T as T[K] extends PropDefOpt<any>
    ? K
    : never]?: T[K] extends PropDefOpt<infer U> ? U : never;
} & {
  [K in keyof T as T[K] extends PropDefVal<any>
    ? K
    : never]?: T[K] extends PropDefVal<infer U> ? U : never;
};

type PropsType2<T extends PropsDef> = {
  [K in keyof T as T[K] extends PropDefReq<any>
    ? K
    : never]: T[K] extends PropDefReq<infer U> ? U : never;
} & {
  [K in keyof T as T[K] extends PropDefOpt<any>
    ? K
    : never]?: T[K] extends PropDefOpt<infer U> ? U : never;
} & {
  [K in keyof T as T[K] extends PropDefVal<any>
    ? K
    : never]: T[K] extends PropDefVal<infer U> ? U : never;
};

type MethodsDef<M extends Methods = Methods> = {
  readonly [symOpaqueType]: 'MethodsDef';
};

type PropsConfig<P extends PropsDef> = {
  type: 'propsConfig';
  propsDef: P;
};

type MethodsConfig<M extends Methods> = {
  type: 'methodsConfig';
  methodsDef: MethodsDef<M>;
};

// === local data ====================================================

const emptyObj = {};
const noop = () => {};
const optDef = Object.freeze({ required: false });
const reqDef = Object.freeze({ required: true });

let onCreateElement:
  | ((
      next: () => void, //
      type: string | Function,
      props: Props
    ) => void)
  | null = null;

let onInit: (
  next: () => void, //
  id: string,
  ctrl: ComponentCtrl
) => void = (next) => next();

let onRender: (
  next: () => void, //
  id: string,
  ctrl: ComponentCtrl | null
) => void = (next) => next();

// === exported functions ============================================

function intercept(params: {
  onCreateElement?(
    next: () => void,
    type: string | Component,
    props: Props
  ): void;

  onInit?(next: () => void, id: string, ctrl: ComponentCtrl): void;
  onRender?(next: () => void, id: string, ctrl: ComponentCtrl | null): void;
}) {
  if (params.onCreateElement) {
    // TODO
  }

  if (params.onInit) {
    const oldOnInit = onInit;
    const newOnInit = params.onInit;

    onInit = (next, id, ctrl) =>
      void newOnInit(() => oldOnInit(next, id, ctrl), id, ctrl);
  }

  if (params.onRender) {
    const oldOnRender = onRender;
    const newOnRender = params.onRender;

    onRender = (next, id, ctrl) =>
      void newOnRender(() => oldOnRender(next, id, ctrl), id, ctrl);
  }
}

function createElement(type: any, props: any, ...children: any[]) {
  if (type.tagName) {
    type = type.tagName;
  }

  if (children.length > 0) {
    children = children.flat();
  }

  for (let i = 0; i < children.length; ++i) {
    const child = children[i];

    if (child != null && typeof child !== 'object') {
      children[i] = text(String(child), null);
    }
  }

  if (props && 'children' in props) {
    delete props.children;
  }

  if (onCreateElement) {
    onCreateElement(noop, type, props || null);
  }

  const ret = h(type, props || emptyObj, children);
  return ret;
}

function elem(tagName: string, init: InitFunc<{}, {}>): Component;

function elem(tagName: string): {
  <P extends PropsDef>(propsConfig: PropsConfig<P>): (
    init: InitFunc<P, {}>
  ) => Component<PropsType<P>, {}>;

  <M extends Methods>(getMethodsConfig: () => MethodsConfig<M>): (
    init: InitFunc<{}, M>
  ) => Component<{}, M>;

  <P extends PropsDef, M extends Methods>(
    propsConfig: PropsConfig<P>,
    getMethodsConfig: () => MethodsConfig<M>
  ): (init: InitFunc<P, M>) => Component<PropsType<P>, M>;
};

function elem(tagName: string, arg?: any): any {
  if (typeof arg === 'function') {
    return defineComponent(tagName, emptyObj, arg);
  }

  return (arg1: any, arg2?: any) => {
    const propsDef = arg1.type === 'propsConfig' ? arg1.propsDef : null;

    return (init: InitFunc) => defineComponent(tagName, propsDef, init);
  };
}

function render(what: VNode, where: string | HTMLElement) {
  if (where == null) {
    return;
  }

  const target =
    typeof where === 'string' ? document.querySelector(where) : where;

  if (target === null) {
    throw Error(`Could not find target element '${where}'`);
  }

  if (!target.firstChild) {
    target.append(document.createElement('span'));
  }

  patch(target.firstChild, what);
}

function props<P extends PropsDef>(propsDef: P): PropsConfig<P> {
  return { type: 'propsConfig', propsDef: propsDef };
}

function methods<M extends Methods>(): MethodsConfig<M> {
  return { type: 'methodsConfig', methodsDef: {} as MethodsDef<M> };
}

function req<T>(): PropDefReq<T> {
  return reqDef;
}

function opt<T>(): PropDefOpt<T>;
function opt<T>(defaultValue?: T): PropDefVal<T>;

function opt(defaultValue?: any): any {
  return arguments.length > 0 ? { required: false, defaultValue } : optDef;
}

// === locals ========================================================

function defineComponent(
  tagName: string,
  propsDef: PropsDef | null,
  init: InitFunc
): Component {
  const componentClass = class Component extends BaseComponent {
    static tagName = tagName;

    constructor() {
      super(propsDef || emptyObj, init);
    }
  };

  registerComponent(componentClass, tagName);

  return componentClass;
}

// --- helpers -------------------------------------------------------

function registerComponent(componentClass: Component, tagName: string) {
  if (customElements.get(tagName)) {
    console.clear();
    console.log(`Custom element "${tagName}" already defined -> reloading...`);

    setTimeout(() => {
      console.clear();
      location.reload();
    }, 1000);
  }

  customElements.define(tagName, componentClass);
}

function hasOwn(subj: any, propName: string) {
  return subj != null && Object.prototype.hasOwnProperty.call(subj, propName);
}

function setProp(subj: any, name: string, value: any): void {
  const type = typeof subj;

  if (subj !== null && (type === 'object' || type === 'function')) {
    Object.defineProperty(subj, name, {
      value
    });
  }
}

function getDefaultProps(propsDef: PropsDef): Props {
  const ret: Props = {};

  for (const key of Object.keys(propsDef)) {
    if (hasOwn(propsDef[key], 'defaultValue')) {
      ret[key] = (propsDef[key] as any).defaultValue;
    }
  }

  return ret;
}

// --- BaseComponent ----------------------------------------------------

class BaseComponent extends HTMLElement {
  static #nextId = 0;

  #initialized = false;
  #mounted = false;
  #stylesElem: HTMLSpanElement;
  #contentElem: HTMLSpanElement;
  #ctrl: ComponentCtrl;
  #id = Date.now() + '-' + BaseComponent.#nextId++;
  #init: InitFunc;
  #render!: () => VNode;
  #props: Props = {};
  #defaultProps: Props;
  #updateRequested = false;

  #patch = () => {
    if (this.#mounted) {
      this.#lifecycle.beforeUpdate.forEach((it) => it());
    }

    let content: VNode = null;
    onRender(
      () => void (content = this.#render()),
      this.#id,
      !this.#initialized ? this.#ctrl : null
    );

    const target = this.#contentElem;

    if (target.innerHTML.length === 0) {
      target.appendChild(document.createElement('span'));
    }

    patch(target.firstChild, content);

    if (!this.#mounted) {
      this.#initialized = true;
      this.#mounted = true;
      this.#lifecycle.afterMount.forEach((it) => it());
    } else {
      this.#lifecycle.afterUpdate.forEach((it) => it());
    }
  };

  #lifecycle = {
    afterMount: [] as (() => void)[],
    beforeUpdate: [] as (() => void)[],
    afterUpdate: [] as (() => void)[],
    beforeUnmount: [] as (() => void)[]
  };

  #update = () => {
    if (!this.#updateRequested) {
      this.#updateRequested = true;

      requestAnimationFrame(() => {
        this.#updateRequested = false;
        this.#patch();
      });
    }
  };

  constructor(propsDef: PropsDef, init: InitFunc) {
    super();
    this.#init = init;

    this.#ctrl = {
      getElement: () => this,
      update: () => this.#update(),
      afterMount: (action) => this.#lifecycle.afterMount.push(action),
      beforeUpdate: (action) => this.#lifecycle.beforeUpdate.push(action),
      afterUpdate: (action) => this.#lifecycle.afterUpdate.push(action),
      beforeUnmount: (action) => this.#lifecycle.beforeUnmount.push(action)
    };

    BaseComponent.#nextId = BaseComponent.#nextId % 200000000;

    this.attachShadow({ mode: 'open' });
    this.#stylesElem = document.createElement('span');
    this.#stylesElem.setAttribute('role', 'styles');
    this.#contentElem = document.createElement('span');
    this.#contentElem.setAttribute('role', 'content');
    this.shadowRoot!.append(this.#stylesElem, this.#contentElem);
    this.#defaultProps = getDefaultProps(propsDef);
    this.#props = { ...this.#defaultProps };

    for (const key of Object.keys(propsDef)) {
      const propDef = propsDef[key];

      if (hasOwn(propDef, 'defaultValue')) {
        this.#props[key] = (propDef as any).defaultValue;
      }

      Object.defineProperty(this, key, {
        get() {
          return this.#props[key];
        },

        set(value: unknown) {
          this.#props[key] = value;
          this.#update();
        }
      });
    }
  }

  connectedCallback() {
    if (!this.#initialized) {
      onInit(
        () => void (this.#render = this.#init(this as any)),
        this.#id,
        this.#ctrl
      );
    }

    this.#patch();
  }

  disconnectedCallback() {
    try {
      this.#lifecycle.beforeUnmount.forEach((action) => action());
    } finally {
      this.#mounted = false;
    }
  }
}
