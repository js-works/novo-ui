/** @jsx createElement */
import { compo, createElement, methods, opt, props, req } from 'novo-ui';
import type { Props, Component } from 'novo-ui';
import { setMethods, setStyles, state, ticker } from 'novo-ui/ext';
import { css } from 'novo-ui/util';
import { makeComponentsReactive } from 'novo-ui/reactive';
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

makeComponentsReactive();
setInterval(() => store.increment(), 1000);

function demo(component: Component, props: Props = {}) {
  return Object.assign(document.createElement(component.tagName), props);
}

const counterStyles = css`
  button {
    border: 1px solid #aaa;
    padding: 12px 30px;
  }
`;

const ClockDemo = compo('x-clock-demo', () => {
  const getTime = ticker((date) => date.toLocaleTimeString());

  return () => (
    <div>
      <b>Current time: {getTime()}</b>
    </div>
  );
});

const CounterDemo = compo('x-counter-demo')(
  props({
    initialCount: opt(0),
    label: opt('Counter')
  }),

  methods<{
    reset(): void;
    increment(): void;
    decrement(): void;
  }>
)((c) => {
  const [s, set] = state({ count: c.initialCount });
  const increment = () => set.count((it) => it + 1);

  setStyles(counterStyles);

  setMethods(c, {
    reset: () => set.count(c.initialCount),
    increment: () => set.count((it) => it + 1),
    decrement: () => set.count((it) => it - 1)
  });

  return () => (
    <div>
      <button onclick={increment}>
        {c.label}: {s.count}
      </button>
    </div>
  );
});

const DurationDemo = compo('x-duration-demo', () => {
  return () => <div>Duration: {store.count}s</div>;
});
