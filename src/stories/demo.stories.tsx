/** @jsx createElement */
import { createElement, render } from 'novo-ui';
import type { VNode } from 'novo-ui';
import { CounterDemo } from './demos/counter-demo';
import { ClockDemo } from './demos/clock-demo';
import { DurationDemo } from './demos/duration-demo';

export default {
  title: 'Demos'
};

export const counter = demo(() => <CounterDemo />);
export const clock = demo(() => <ClockDemo />);
export const duration = demo(() => <DurationDemo />);

function demo(getContent: () => VNode) {
  return () => {
    const div = document.createElement('div');

    render(getContent(), div);
    return div;
  };
}
