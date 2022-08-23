# novo-ui

A R&D project to evaluate a special web widget API for developing browser-based UIs, using an alternative to hook functions, called "extensions".
<br />
The main advantages of the new API (= using "extensions" instead of "hooks") are:

- No rules of hooks
- No special linter necessary

Be aware that this project is just for research purposes and is not meant to be used in production.

### Installation

```
git clone https://github.com/js-works/novo-ui.git
cd novo-ui
yarn install
```

### Running demos

```
yarn storybook
```

## Examples

Remark: We are using the following naming convention to
reduce the amount of noise in the source code (for non-trivial
widgets, where you access the props and the state object
very often, that makes quite a difference):

- `c` is the variable for the custom element instance
- `s` is the variable for a state object

### Clock - showing the current time, updating every second

```tsx
import { render, widget } from 'novo-ui';
import { ticker } from 'novo-ui/ext';

const Clock = widget('demo-clock', () => {
  const getTime = ticker((date) => date.toLocaleTimeString());

  return () => (
    <div>
      <b>Current time: {getTime()}</b>
    </div>
  );
});

render(<Clock />, '#app');
```

### Simple counter

```tsx
import { opt, props, render, widget } from 'novo-ui';
import { state } from 'novo-ui/ext';

const Counter = widget('demo-counter')(
  props({
    initialCount: opt(0),
    label: opt('Counter')
  })
)((c) => {
  const [s, set] = state({ count: c.initialCount });
  const increment = () => set.count((it) => it + 1);

  return () => (
    <button onclick={increment}>
      {c.label}: {s.count}
    </button>
  );
});

render(<Counter />, '#app');
```

### Another counter using a bit more of the API

```tsx
import { methods, opt, props, req, widget } from 'novo-ui';
import { effect, setMethods, state } from 'novo-ui/ext';

export const Counter = widget('demo-counter')(
  props({
    name: req<string>,
    initialCount: opt(0)
  }),

  methods<{
    reset(): void;
    increment(): void;
    decrement(): void;
  }>
)((c) => {
  const [s, set] = state({ count: c.initialCount });
  const increment = () => set.count((it) => it + 1);

  setMethods(c, {
    reset: () => set.count(c.initialCount),
    increment: () => set.count((it) => it + 1),
    decrement: () => set.count((it) => it - 1)
  });

  effect(
    () => console.log(`Value of "${c.label}": ${s.count})`),
    () => [s.count]
  );

  return () => (
    <button onclick={increment}>
      {c.name}: {s.count}
    </button>
  );
});
```

## API

### Core functions

- createElement
- elem
- intercept
- methods
- opt
- props
- render
- req

### Extensions

tbd

### Utility functions

tbd

## Project state

This R&D project is in a very early development state
