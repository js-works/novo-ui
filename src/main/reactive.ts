import { Reaction } from 'mobx';
import { intercept } from 'novo-ui';

// === exports =======================================================

export { makeWidgetsReactive };

// === local data ====================================================

let widgetsAreReactive = false;

// === exported functions ============================================

function makeWidgetsReactive() {
  if (widgetsAreReactive) {
    return;
  }

  widgetsAreReactive = true;
  const reactionsById: Record<string, Reaction> = {};

  intercept({
    onRender(next, id, ctrl) {
      if (ctrl) {
        const update = () => ctrl.update();
        const reaction = new Reaction('novo-ui::reaction', () => update());
        reactionsById[id] = reaction;

        ctrl.beforeUnmount(() => {
          reaction.dispose();
          delete reactionsById[id];
        });

        reaction.track(next);
      } else {
        reactionsById[id].track(next);
      }
    }
  });
}
