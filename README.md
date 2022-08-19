# novo-ui

A R&D project to evaluate a special web component API for developing browser-based UIs, using an alternative to hook functions, called "extensions".
<br />
The main advantages of the new API (= using "extensions" instead of "hooks") are:

- No rules of hooks
- No special linter necessary

Be aware that this project is just for research purposes and is not meant to be used in production.

### Installation

```
git clone https://github.com/xdev1/novo-ui.git
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
components, where you access the props and the state object
very often, that makes quite a difference):

- `p` is the variable for the props object
- `s` is the variable for a state object

### Simple counter

```tsx
import { opt, render, widget } from 'novo-ui';
import { state } from 'novo-ui/ext';

const Counter = widget('x-counter', {
  props: {
    initialCount: opt(0),
    label: opt('Counter')
  }
}).from((p) => {
  const [s, set] = state({ count: p.initialCount });
  const increment = () => set.count((it) => it + 1);

  return () => (
    <button onclick={increment}>
      {p.label}: {s.count}
    </button>
  );
});

render(<Counter />, '#app');
```

## API

### Core functions

- createElement
- intercept
- opt
- render
- req
- widget

### Extensions

tbd

### Utility functions

tbd

## Project state

This R&D project is in a very early development state