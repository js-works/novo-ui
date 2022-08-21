/** @jsx createElement */
import { createElement, methods, opt, props, widget } from 'novo-ui';
import { setMethods, setStyles, state, ticker } from 'novo-ui/ext';
import { css, createElemRef } from 'novo-ui/util';

export { CounterDemo };

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

const Counter = widget('x-counter')(
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

const CounterDemo = widget('x-counter-demo', () => {
  const counterRef = createElemRef<typeof Counter>();
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
