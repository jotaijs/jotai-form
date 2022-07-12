import { atom } from 'jotai';
import { atomWithDefault } from 'jotai/utils';

const ACTIONS: string[] = ['TOUCHED', 'UNTOUCHED'];

export const atomWithValidateExtended = (baseAtom: any) => {
  const extended = atomWithDefault((get) => ({
    touched: false,
    ...get(baseAtom),
  }));

  const derv = atom(
    (get) => get(extended),
    (get, set, update) => {
      if (typeof update === 'string' && ACTIONS.indexOf(update) > -1) {
        const prev = get(extended);
        set(extended, {
          ...prev,
          touched: update === 'TOUCHED',
        });
        return;
      }
      const prev = get(extended);
      set(extended, {
        ...prev,
        value: update,
      });
    },
  );

  return derv;
};
