import { widget } from 'novo-ui';
import { makeAutoObservable } from 'mobx';
import { makeWidgetsReactive } from 'novo-ui/reactive';

export { DurationDemo };

const store = makeAutoObservable({
  count: 0,

  increment() {
    this.count++;
  }
});

setInterval(() => {
  store.increment();
}, 1000);

makeWidgetsReactive();

const DurationDemo = widget('x-duration-demo', () => {
  return () => (
    <div>
      <div>Duration: {store.count}s</div>
    </div>
  );
});
