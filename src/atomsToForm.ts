import { atom } from 'jotai';

// Temporary type def
type CollectionOfAtomValidate = {
  [k: string]: any;
};

type FormArg = {
  key: string;
  value: unknown;
};

type Options = {
  validate: (values: any) => any;
};

// TODO: add aync handling
// TODO: add proper generics for infering the collection
export const atomsToForm = (
  atoms: CollectionOfAtomValidate,
  { validate }: Options,
) => {
  return atom(
    (get) => {
      let valid = true;
      let dirty = false;

      const values = Object.fromEntries(
        Object.entries(atoms).map(([k, v]) => {
          const val = get(v);

          // @ts-expect-error no types from the root atoms
          if (val.isDirty) {
            dirty = true;
          }

          // @ts-expect-error no types from the root atoms
          if (val.error) {
            valid = false;
          }

          return [k, val];
        }),
      );

      // separated for dev reasons
      const result: any = {
        errors: [],
        values,
        isValid: valid,
        isDirty: dirty,
      };

      try {
        validate(values);
      } catch (err) {
        result.isValidating = false;
        result.isValid = false;
        result.errors.push(err);
      }

      return result;
    },
    (_, set, arg: FormArg) => {
      if (atoms[arg.key]) {
        set(atoms[arg.key], arg.value);
      }
    },
  );
};
