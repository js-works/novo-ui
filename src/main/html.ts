import htm from 'htm';
import { createElement } from 'novo-ui';

export const html = (htm as any).bind(createElement);
