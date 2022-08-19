/** @jsx createElement */
import { createElement, methods, opt, props, req, widget } from 'novo-ui';
import type { Props, Widget } from 'novo-ui';
import { setMethods, setStyles, state, ticker } from 'novo-ui/ext';
import { makeWidgetsReactive } from 'novo-ui/reactive';
import { makeAutoObservable } from 'mobx';

export default {
  title: 'Demo'
};

export const counter = () => demo(CounterDemo);
export const clock = () => demo(ClockDemo);
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

const ClockDemo = widget('x-clock-demo', () => {
  const getTime = ticker((date) => date.toLocaleTimeString(), 1000);

  return () => (
    <div>
      <b>Current time: {getTime()}</b>
    </div>
  );
});

const CounterDemo = widget('x-counter-demo')(
  props({
    initialCount: opt(0),
    label: opt('Counter')
  }),

  methods<{
    reset(): void;
    increment(): void;
    decrement(): void;
  }>
)((p, self) => {
  const [s, set] = state({ count: p.initialCount });
  const increment = () => set.count((it) => it + 1);

  setStyles(counterStyles);

  setMethods(self, {
    reset: () => set.count(p.initialCount),
    increment: () => set.count((it) => it + 1),
    decrement: () => set.count((it) => it - 1)
  });

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
