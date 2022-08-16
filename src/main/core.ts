import { patch } from "./lib/superfine-patched";

// === exports =======================================================

export { widget };
export type { VNode, Widget };

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

// === exported functions ============================================

function widget(tagName: string, main: () => () => VNode): Widget;

function widget(tagName: string, a1?: any): Widget<Props> {
  const widgetClass = class Widget extends BaseWidget {
    static tagName = tagName;

    constructor() {
      let ctrl!: WidgetCtrl;

      super(a1, (c) => (ctrl = c));
    }
  };

  registerWidget(widgetClass, tagName);

  return widgetClass;
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

// === locals ========================================================

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

// --- BaseWidget ----------------------------------------------------

class BaseWidget extends HTMLElement {
  #initialized = false;
  #mounted = false;
  #stylesElem: HTMLSpanElement;
  #contentElem: HTMLSpanElement;
  #ctrl: WidgetCtrl;
  #main: (props: Props) => () => VNode;
  #render: (() => VNode) | null = null;

  #lifecycle = {
    afterMount: [] as (() => void)[],
    beforeUpdate: [] as (() => void)[],
    afterUpdate: [] as (() => void)[],
    beforeUnmount: [] as (() => void)[],
  };

  #update = () => {};

  constructor(
    main: (props: Props) => () => VNode,
    passCtrl: (ctrl: WidgetCtrl) => void
  ) {
    super();

    this.#main = main;

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
