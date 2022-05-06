import { atom } from 'jotai';
import { SyncState } from './atomWithValidate';

// Temporary type def
type CollectionOfAtomValidate = {
  [k: string]: any;
};

type FormArg = {
  key: string;
  value: unknown;
};

// TODO: add aync handling
// TODO: add proper generics for infering the collection
export const atomsToForm = (atoms: CollectionOfAtomValidate) => {
  return atom(
    (get) => {
      let isValid = true;
      let errors: null | Array<unknown> = null;
      let isDirty = false;

      const values = Object.fromEntries(
        Object.entries(atoms).map(([k, v]) => {
          const val: SyncState<any> = get(v);

          if (val.isDirty) {
            isDirty = true;
          }

          if (!val.isValid && val.error) {
            isValid = false;
            if (!errors) {
              errors = [];
            }
            errors.push(val.error);
          }

          return [k, val];
        }),
      );

      return {
        values,
        errors,
        isValid,
        isDirty,
      };
    },
    (_, set, arg: FormArg) => {
      if (atoms[arg.key]) set(atoms[arg.key], arg.value);
    },
  );
};
