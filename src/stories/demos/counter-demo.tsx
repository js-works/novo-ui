import { methods, opt, props, req, widget } from 'novo-ui';
import { setMethods, setStyles, state } from 'novo-ui/ext';
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
    name: req<string>,
    initialCount: opt(0)
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
        {p.name}: {s.count}
      </button>
    </div>
  );
});

const CounterDemo = widget('x-counter-demo', (xxxxxxxxxxx) => {
  const counterRef = createElemRef<typeof Counter>();
  const increment = () => counterRef.value!.increment();
  const decrement = () => counterRef.value!.decrement();
  const reset = () => counterRef.value!.reset();

  setStyles(counterDemoStyles);

  return () => (
    <div>
      <Counter name="Items count" ref={counterRef} />
      <div>
        <button onclick={increment}>Increment</button>
        <button onclick={decrement}>Decrement</button>
        <button onclick={reset}>Reset</button>
      </div>
    </div>
  );
});
