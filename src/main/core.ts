import { h, patch, text } from './vdom';

// === exports =======================================================

export {
  createElement,
  createRef,
  intercept,
  opt,
  props,
  render,
  req,
  use,
  widget
};
export type { Props, Ref, RefCallback, RefObject, VNode, Widget, WidgetCtrl };

// === exported types ================================================

type Props = Record<string, any>;
type VNode = any; // TODO!!!
type RefObject<T> = { value: T | null };
type RefCallback<T> = (value: T | null) => void;
type Ref<T> = RefObject<T> | RefCallback<T>;

type Widget<P extends Props = {}> = {
  new (): HTMLElement & P;
  tagName: string;
};

type WidgetCtrl = {
  getElement(): HTMLElement;
  update(): void;
  afterMount: (task: () => void) => void;
  beforeUpdate: (task: () => void) => void;
  afterUpdate: (task: () => void) => void;
  beforeUnmount: (task: () => void) => void;
};

// === local types ===================================================

type InitFunc<P extends Props = Props> = (props: P) => () => VNode;
type PropDefReq<T> = { required: true };
type PropDefOpt<T> = { required: false; defaultValue: never };
type PropDefVal<T> = { required: false; defaultValue: T };
type PropDef<T> = PropDefReq<T> | PropDefOpt<T> | PropDefVal<T>;
type PropsDef = Record<string, PropDef<unknown>>;
type Prettify<T extends {}> = { [K in keyof T]: T[K] };

type PropsType<T extends PropsDef> = Prettify<
  {
    [K in keyof T as T[K] extends PropDefReq<any>
      ? K
      : never]: T[K] extends PropDefReq<infer U> ? U : never;
  } &
    {
      [K in keyof T as T[K] extends PropDefOpt<any>
        ? K
        : never]?: T[K] extends PropDefOpt<infer U> ? U : never;
    } &
    {
      [K in keyof T as T[K] extends PropDefVal<any>
        ? K
        : never]?: T[K] extends PropDefVal<infer U> ? U : never;
    }
>;

type PropsType2<T extends PropsDef> = Prettify<
  {
    [K in keyof T as T[K] extends PropDefReq<any>
      ? K
      : never]: T[K] extends PropDefReq<infer U> ? U : never;
  } &
    {
      [K in keyof T as T[K] extends PropDefOpt<any>
        ? K
        : never]?: T[K] extends PropDefOpt<infer U> ? U : never;
    } &
    {
      [K in keyof T as T[K] extends PropDefVal<any>
        ? K
        : never]: T[K] extends PropDefVal<infer U> ? U : never;
    }
>;

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
  widgetId: string,
  widgetCtrl: WidgetCtrl
) => void = (next) => next();

let onRender: (
  next: () => void, //
  widgetId: string
) => void = (next) => next();

// === exported functions ============================================

function intercept(params: {
  onCreateElement?(next: () => void, type: string | Widget, props: Props): void;
  onInit?(next: () => void, widgetId: string, widgetCtrl: WidgetCtrl): void;
  onRender?(next: () => void, widgetId: string): void;
}) {
  if (params.onCreateElement) {
    // TODO
  }

  if (params.onInit) {
    const oldOnInit = onInit;
    const newOnInit = params.onInit;

    onInit = (next, widgetId, widgetCtrl) =>
      void newOnInit(
        () => oldOnInit(next, widgetId, widgetCtrl),
        widgetId,
        widgetCtrl
      );
  }

  if (params.onRender) {
    const oldOnRender = onRender;
    const newOnRender = params.onRender;

    onRender = (next, widgetId) =>
      void newOnRender(() => oldOnRender(next, widgetId), widgetId);
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

function widget(tagName: string, init: InitFunc<{}>): Widget;

function widget<T extends PropsDef>(
  tagName: string,
  propsConfig: T
): (init: InitFunc<PropsType2<T>>) => Widget<PropsType<T>>;

function widget<T extends PropsDef>(
  tagName: string
): <T extends PropsDef>(
  propsConfig: T,
  ...modifiers: ((ctrl: WidgetCtrl) => void)[]
) => (init: InitFunc<PropsType2<T>>) => Widget<PropsType<T>>;

function widget(
  tagName: string
): (
  ...modifiers: ((ctrl: WidgetCtrl) => void)[]
) => (init: InitFunc<{}>) => Widget<{}>;

function widget(tagName: string, arg?: any): any {
  if (arg === undefined) {
    return (...args: any[]) =>
      (init: InitFunc) => {
        let propsDef: PropsDef | null = null;
        let modifiers: ((ctrl: WidgetCtrl) => void)[] | null = null;

        if (typeof args[0] === 'object') {
          propsDef = args[0];

          if (args.length > 1) {
            modifiers = args.slice(1);
          }
        } else if (args.length > 0) {
          modifiers = args;
        }

        return defineWidget(tagName, propsDef, init, modifiers);
      };
  }

  if (typeof arg === 'function') {
    return defineWidget(tagName, emptyObj, arg);
  }

  const propsDef: PropsDef = arg && typeof arg === 'object' ? arg : emptyObj;

  return (init: InitFunc) => {
    return defineWidget(tagName, propsDef, init);
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

  target.append(document.createElement('div'));
  patch(what, target);
}

function props<T extends PropsDef>(propsDef: T): T {
  return propsDef;
}

function req<T>(): PropDefReq<T> {
  return reqDef;
}

function opt<T>(): PropDefOpt<T>;
function opt<T>(defaultValue?: T): PropDefVal<T>;

function opt(defaultValue?: any): any {
  return arguments.length > 0 ? { required: false, defaultValue } : optDef;
}

function use(params: {
  styles?: null | string | string[];
  deps?: any[];
  slots?: string[];
}) {
  let styles: string | null = null;

  if (params.styles) {
    styles = (Array.isArray(params.styles) ? params.styles : [params.styles])
      .map((it) => it.trim())
      .join('\n\n// -----------\n\n');
  }

  return (ctrl: WidgetCtrl) => {
    if (!styles) {
      return;
    }

    const elem = ctrl.getElement();
    const stylesElem = elem.shadowRoot!.firstChild!;
    const styleElem = document.createElement('style');
    styleElem.append(document.createTextNode(styles));
    stylesElem.appendChild(styleElem);
  };
}

function createRef<T>(value: T | null = null): RefObject<T> {
  return { value };
}

// === locals ========================================================

function defineWidget(
  tagName: string,
  propsDef: PropsDef | null,
  init: InitFunc,
  modifiers: ((ctrl: WidgetCtrl) => void)[] | null = null
): Widget {
  const widgetClass = class Widget extends BaseWidget {
    static tagName = tagName;

    constructor() {
      super(propsDef || emptyObj, init, modifiers);
    }
  };

  registerWidget(widgetClass, tagName);

  return widgetClass;
}

// --- helpers -------------------------------------------------------

function registerWidget(widgetClass: Widget, tagName: string) {
  if (customElements.get(tagName)) {
    console.clear();
    console.log(`Custom element "${tagName}" already defined -> reloading...`);

    setTimeout(() => {
      console.clear();
      location.reload();
    }, 1000);
  }

  customElements.define(tagName, widgetClass);
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

// --- BaseWidget ----------------------------------------------------

class BaseWidget extends HTMLElement {
  static #nextId = 0;

  #initialized = false;
  #mounted = false;
  #stylesElem: HTMLSpanElement;
  #contentElem: HTMLSpanElement;
  #ctrl: WidgetCtrl;
  #id = Date.now() + '-' + BaseWidget.#nextId++;
  #init: InitFunc;
  #modifiers: ((ctrl: WidgetCtrl) => void)[] | null;
  #render!: () => VNode;
  #props: Props = {};
  #propsObj: Props = {};
  #defaultProps: Props;
  #updateRequested = false;

  #updatePropsObj = () => {
    for (const key in this.#propsObj) {
      delete this.#propsObj[key];
    }

    Object.assign(this.#propsObj, this.#props);

    for (const key of Object.keys(this.#defaultProps)) {
      if (this.#propsObj[key] === undefined) {
        this.#propsObj[key] = this.#defaultProps[key];
      }
    }
  };

  #patch = () => {
    if (this.#mounted) {
      this.#lifecycle.beforeUpdate.forEach((it) => it());
    }

    let content: VNode = null;
    onRender(() => void (content = this.#render()), this.#id);
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
        this.#updatePropsObj();
        this.#patch();
      });
    }
  };

  constructor(
    propsDef: PropsDef,
    init: InitFunc<Props>,
    modifiers: ((ctrl: WidgetCtrl) => void)[] | null
  ) {
    super();
    this.#init = init;
    this.#modifiers = modifiers;

    this.#ctrl = {
      getElement: () => this,
      update: () => this.#update(),
      afterMount: (action) => this.#lifecycle.afterMount.push(action),
      beforeUpdate: (action) => this.#lifecycle.beforeUpdate.push(action),
      afterUpdate: (action) => this.#lifecycle.afterUpdate.push(action),
      beforeUnmount: (action) => this.#lifecycle.beforeUnmount.push(action)
    };

    BaseWidget.#nextId = BaseWidget.#nextId % 200000000;

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
      this.#updatePropsObj();

      onInit(
        () => void (this.#render = this.#init(this.#propsObj)),
        this.#id,
        this.#ctrl
      );

      if (this.#modifiers) {
        this.#modifiers.forEach((it) => it(this.#ctrl));
      }
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
