/** @jsx createElement */
import { createElement, opt, req, widget, Widget } from 'novo-ui';
import type { Props } from 'novo-ui';
import { setStyles, state } from 'novo-ui/ext';
import { makeWidgetsReactive } from 'novo-ui/reactive';
import { makeAutoObservable } from 'mobx';

export default {
  title: 'Demo'
};

export const counter = () => demo(CounterDemo);
export const duration = () => demo(DurationDemo);

// Auto-updating mobx store
const store = makeAutoObservable({
  count: 0,

  increment() {
    this.count++;
  }
});

makeWidgetsReactive();
setInterval(() => store.increment(), 1000);

function demo(widget: Widget, props: Props = {}) {
  return Object.assign(document.createElement(widget.tagName), props);
}

const counterStyles = 'button { border: 1px solid #aaa; padding: 12px 30px; }';

const CounterDemo = widget('x-counter-demo', {
  props: {
    initialCount: opt(0),
    label: opt('Counter')
  }
}).from((p) => {
  const [s, set] = state({ count: p.initialCount });
  const increment = () => set.count((it) => it + 1);

  setStyles(counterStyles);

  return () => (
    <div>
      <button onclick={increment}>
        {p.label}: {s.count}
      </button>
    </div>
  );
});

const DurationDemo = widget('x-duration-demo', () => {
  return () => <div>Duration: {store.count}s</div>;
});
