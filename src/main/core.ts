import { patch } from "./lib/superfine-patched";

// === exports =======================================================

export { opt, props, render, req, widget };
export type { Props, VNode, Widget };

// === exported types ================================================

type Props = Record<string, any>;
type VNode = any; // TODO!!!

type Widget<P extends Props = {}> = {
  new (): HTMLElement & P;
  tagName: string;
};

type WidgetCtrl = {
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
        : never]: T[K] extends PropDefOpt<infer U> ? U : never;
    } &
    {
      [K in keyof T as T[K] extends PropDefVal<any>
        ? K
        : never]?: T[K] extends PropDefVal<infer U> ? U : never;
    }
>;

type DefaultsType<T extends PropsDef> = {
  [K in keyof T as T[K] extends PropDefVal<any>
    ? K
    : never]: T[K] extends PropDefVal<infer U> ? U : never;
};

// === local data ====================================================

const emptyObj = {};
const optDef = Object.freeze({ required: false });
const reqDef = Object.freeze({ required: true });

// === exported functions ============================================

function widget(tagName: string, init: InitFunc<{}>): Widget;

function widget<T extends PropsDef>(
  tagName: string,
  propsConfig: T
): (init: InitFunc<PropsType2<T>>) => Widget<PropsType<T>>;

function widget<T extends PropsDef>(
  tagName: string
): <T extends PropsDef>(
  propsConfig: T,
  ...modifiers: ((elem: HTMLElement) => void)[] // TODO!!!
) => (init: InitFunc<PropsType2<T>>) => Widget<PropsType<T>>;

function widget(tagName: string, arg?: any): any {
  if (arg === undefined) {
    return (propsDef: PropsDef) => (init: InitFunc) =>
      defineWidget(tagName, propsDef, init);
  }

  if (typeof arg === "function") {
    return defineWidget(tagName, emptyObj, arg);
  }

  const propsDef: PropsDef = arg && typeof arg === "object" ? arg : emptyObj;

  return (init: InitFunc) => {
    return defineWidget(tagName, propsDef, init);
  };
}

function render(what: VNode, where: string | HTMLElement) {
  if (where == null) {
    return;
  }

  const target =
    typeof where === "string" ? document.querySelector(where) : where;

  if (target === null) {
    throw Error(`Could not find target element '${where}'`);
  }

  target.append(document.createElement("div"));
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

// === locals ========================================================

function defineWidget(
  tagName: string,
  propsDef: PropsDef | null,
  init: InitFunc
): Widget {
  const widgetClass = class Widget extends BaseWidget {
    static tagName = tagName;

    constructor() {
      let ctrl!: WidgetCtrl;

      super(propsDef || emptyObj, init, (c) => (ctrl = c));
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

  if (subj !== null && (type === "object" || type === "function")) {
    Object.defineProperty(subj, name, {
      value,
    });
  }
}

function setName(subj: any, name: string) {
  setProp(subj, "name", name);
}

function getDefaultProps(propsDef: PropsDef): Props {
  const ret: Props = {};

  for (const key of Object.keys(propsDef)) {
    if (hasOwn(propsDef[key], "defaultValue")) {
      ret[key] = (propsDef[key] as any).defaultValue;
    }
  }

  return ret;
}

// --- BaseWidget ----------------------------------------------------

class BaseWidget extends HTMLElement {
  #initialized = false;
  #mounted = false;
  #stylesElem: HTMLSpanElement;
  #contentElem: HTMLSpanElement;
  #ctrl: WidgetCtrl;
  #init: (props: Props) => () => VNode;
  #render: (() => VNode) | null = null;

  #lifecycle = {
    afterMount: [] as (() => void)[],
    beforeUpdate: [] as (() => void)[],
    afterUpdate: [] as (() => void)[],
    beforeUnmount: [] as (() => void)[],
  };

  #update = () => {};

  constructor(
    propsDef: PropsDef,
    init: InitFunc<Props>,
    passCtrl: (ctrl: WidgetCtrl) => void
  ) {
    super();

    this.#init = init;

    this.#ctrl = {
      update: () => {
        this.#update();
      },

      afterMount: (action) => {
        this.#lifecycle.afterMount.push(action);
      },

      beforeUpdate: (action) => {
        this.#lifecycle.beforeUpdate.push(action);
      },

      afterUpdate: (action) => {
        this.#lifecycle.afterUpdate.push(action);
      },

      beforeUnmount: (action) => {
        this.#lifecycle.beforeUnmount.push(action);
      },
    };

    passCtrl(this.#ctrl);
    this.attachShadow({ mode: "open" });
    this.#stylesElem = document.createElement("span");
    this.#stylesElem.setAttribute("role", "styles");
    this.#contentElem = document.createElement("span");
    this.#contentElem.setAttribute("role", "content");
    this.shadowRoot!.append(this.#stylesElem, this.#contentElem);
  }

  connectedCallback() {
    this.#contentElem.innerHTML = "Juhu";
    this.#initialized = true;
    this.#mounted = true;
    this.#lifecycle.afterMount.forEach((action) => action());
  }

  disconnectedCallback() {
    try {
      this.#lifecycle.beforeUnmount.forEach((action) => action());
    } finally {
      this.#mounted = false;
    }
  }
}
