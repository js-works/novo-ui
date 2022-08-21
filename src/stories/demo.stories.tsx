/** @jsx createElement */
import { createElement, elem, methods, opt, props, render, req } from 'novo-ui';
import type { ElementOf, VNode } from 'novo-ui';
import { setMethods, setStyles, state, ticker } from 'novo-ui/ext';
import { css, createRef } from 'novo-ui/util';
import { makeComponentsReactive } from 'novo-ui/reactive';
import { makeAutoObservable } from 'mobx';

export default {
  title: 'Demo'
};

export const counter = () => demo(<CounterDemo />);
export const clock = () => demo(<ClockDemo />);
export const duration = () => demo(<DurationDemo />);

// Auto-updating mobx store
const store = makeAutoObservable({
  count: 0,

  increment() {
    this.count++;
  }
});

makeComponentsReactive();
setInterval(() => store.increment(), 1000);

function demo(content: VNode) {
  const div = document.createElement('div');

  render(content, div);
  return div;
}

const counterStyles = css`
  button {
    border: 1px solid #aaa;
    padding: 12px 30px;
  }
`;

const counterDemoStyles = css`
  button {
    border: 1px solid #aaa;
    padding: 5px 9px;
  }
`;

const ClockDemo = elem('x-clock-demo', () => {
  const getTime = ticker((date) => date.toLocaleTimeString());

  return () => (
    <div>
      <b>Current time: {getTime()}</b>
    </div>
  );
});

const Counter = elem('x-counter')(
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

const CounterDemo = elem('x-counter-demo', () => {
  const counterRef = createRef<ElementOf<typeof Counter>>();
  const increment = () => counterRef.value!.increment();
  const decrement = () => counterRef.value!.decrement();
  const reset = () => counterRef.value!.reset();

  setStyles(counterDemoStyles);

  return () => (
    <div>
      <Counter ref={counterRef} />
      <div>
        <button onclick={increment}>Increment</button>
        <button onclick={decrement}>Decrement</button>
        <button onclick={reset}>Reset</button>
      </div>
    </div>
  );
});

const DurationDemo = elem('x-duration-demo', () => {
  return () => <div>Duration: {store.count}s</div>;
});
