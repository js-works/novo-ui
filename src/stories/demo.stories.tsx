/** @jsx createElement */
import { createElement, opt, props, req, use, widget, Widget } from 'novo-ui';
import type { Props } from 'novo-ui';
import { state } from 'novo-ui/ext';

export default {
  title: 'Demo'
};

function demo(widget: Widget, props: Props = {}) {
  return Object.assign(document.createElement(widget.tagName), props);
}

export const counter = () => demo(CounterDemo);

const counterStyles = 'button { border: 1px solid #aaa; padding: 12px 30px; }';

const CounterDemo = widget('x-counter-demo')(
  props({
    initialCount: opt(0),
    label: opt('Counter')
  }),

  use({
    styles: counterStyles
  })
)((p) => {
  const [s, set] = state({ count: p.initialCount });
  const increment = () => set.count((it) => it + 1);

  return () => (
    <div>
      <button onclick={increment}>
        {p.label}: {s.count}
      </button>
    </div>
  );
});
