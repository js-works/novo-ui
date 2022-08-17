import { opt, props, req, widget, Widget } from "novo-ui";
import type { Props } from "novo-ui";

export default {
  title: "Demo",
};

function demo(widget: Widget, props: Props = {}) {
  return Object.assign(document.createElement(widget.tagName), props);
}

export const counter = () => demo(CounterDemo);

const CounterDemo = widget("cc-counter-demo", {
  initialCount: opt(0),
  label: opt("Counter"),
})((p) => {
  return () => `${p.label}: ${p.initialCount}`;
});

const CounterDemo2 = widget("cc-counter-demo2")(
  props({
    initialCount: opt(0),
    label: opt("Counter"),
  })
)((p) => {
  return () => `${p.label}: ${p.initialCount}`;
});
