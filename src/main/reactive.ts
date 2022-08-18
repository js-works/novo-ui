import { Reaction } from 'mobx';
import { intercept } from 'novo-ui';

// === exports =======================================================

export { makeWidgetsReactive };

// === local data ====================================================

let componentsAreReactive = false;

// === exported functions ============================================

function makeWidgetsReactive() {
  if (componentsAreReactive) {
    return;
  }

  componentsAreReactive = true;
  const reactionsById: Record<string, Reaction> = {};

  intercept({
    onRender(next, componentId, ctrl) {
      if (ctrl) {
        const update = () => ctrl.update();
        const reaction = new Reaction('novo-ui::reaction', () => update());
        reactionsById[componentId] = reaction;

        ctrl.beforeUnmount(() => {
          reaction.dispose();
          delete reactionsById[componentId];
        });

        reaction.track(next);
      } else {
        reactionsById[componentId].track(next);
      }
    }
  });
}
