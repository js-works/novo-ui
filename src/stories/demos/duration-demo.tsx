import { widget } from 'novo-ui';
import { makeAutoObservable, runInAction } from 'mobx';
import { makeWidgetsReactive } from 'novo-ui/reactive';

export { DurationDemo };

const store = makeAutoObservable({
  count: 0
});

setInterval(() => {
  runInAction(() => ++store.count);
}, 1000);

makeWidgetsReactive();

const DurationDemo = widget('x-duration-demo', () => {
  return () => (
    <div>
      <div>Duration: {store.count}s</div>
    </div>
  );
});
