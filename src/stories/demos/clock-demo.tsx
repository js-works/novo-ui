import { widget } from 'novo-ui';
import { ticker } from 'novo-ui/ext';

export { ClockDemo };

const ClockDemo = widget('x-clock-demo', () => {
  const getTime = ticker((date) => date.toLocaleTimeString());

  return () => (
    <div>
      <b>Current time: {getTime()}</b>
    </div>
  );
});
