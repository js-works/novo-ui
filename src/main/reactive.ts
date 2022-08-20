import { Reaction } from 'mobx';
import { intercept } from 'novo-ui';

// === exports =======================================================

export { makeComponentsReactive };

// === local data ====================================================

let componentsAreReactive = false;

// === exported functions ============================================

function makeComponentsReactive() {
  if (componentsAreReactive) {
    return;
  }

  componentsAreReactive = true;
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
