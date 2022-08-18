import { createElement } from "novo-ui";

// === exports =======================================================

export { jsx, jsx as jsxs, jsx as jsxDEV };

// === exported functions ============================================

function jsx(type: any, props: any, key: any) {
  let children: any = null;

  if (props && "children" in props) {
    children = props.children;
    delete props.children;
  }

  if (key != null) {
    if (props) {
      props.key = key;
    } else {
      props = { key };
    }
  } else if (props && "key" in props) {
    delete props.key;
  }

  return children
    ? createElement(type, props, children)
    : createElement(type, props);
}
