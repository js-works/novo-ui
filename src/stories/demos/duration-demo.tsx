import { widget } from 'novo-ui';
import { action, makeAutoObservable } from 'mobx';
import { makeWidgetsReactive } from 'novo-ui/reactive';

export { DurationDemo };

const store = makeAutoObservable({
  count: 0
});

setInterval(() => {
  action(() => ++store.count);
}, 1000);

makeWidgetsReactive();

const DurationDemo = widget('x-duration-demo', () => {
  return () => (
    <div>
      <div>Duration: {store.count}s</div>
    </div>
  );
});
