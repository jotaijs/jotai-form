import { atom } from 'jotai/vanilla';
import type { Validator } from './validateAtoms';
import { AtomWithValidation, validateAtoms } from './validateAtoms';

type Options<Vkeys extends symbol | string | number, Vvals> = {
  validate: Validator<Vkeys, Vvals>;
};

export type ActionableNext = {
  action: 'SET_VALUE' | 'SET_FOCUSED' | 'SET_TOUCHED';
  key: string;
  value: any;
};

const getDefaultOptions = <K extends symbol | string | number, V>() =>
  <Options<K, V>>{
    validate: (v) => v,
  };

export function atomWithFormControls<
  AtomGroup extends Record<string, AtomWithValidation<any>>,
  Keys extends keyof AtomGroup,
  Vals extends AtomGroup[Keys],
>(labeledAtoms: AtomGroup, options?: Options<Keys, Vals>) {
  const { validate } = Object.assign(
    {},
    getDefaultOptions<Keys, Vals>(),
    options,
  );
  const initBooleanState = Object.fromEntries(
    Object.entries(labeledAtoms).map(([k]) => [k, false]),
  );

  const touchedState = atom(initBooleanState);
  const focusedState = atom(initBooleanState);
  const validating = validateAtoms(labeledAtoms, validate);

  const errorsAtom = atom((get) => {
    return Object.fromEntries(
      Object.entries(labeledAtoms).map(([k, v]) => {
        const val = get(v);
        // @ts-expect-error atomgroup inference issue
        if (val.isValid === false) {
          // @ts-expect-error result of the line above
          return [k, val.error];
        }
        return [k, null];
      }),
    );
  });

  // contains extracted values from the validated form group
  const formGroupAtomValues = atom(
    (get) => {
      return get(validating);
    },
    (get, set, next: ActionableNext) => {
      switch (next.action) {
        case 'SET_TOUCHED':
          return set(touchedState, {
            ...get(touchedState),
            [next.key]: Boolean(next.value),
          });
        case 'SET_FOCUSED':
          return set(focusedState, {
            ...get(focusedState),
            [next.key]: Boolean(next.value),
          });
        case 'SET_VALUE':
        default: {
          const actOn = labeledAtoms[next.key];
          if (!actOn) {
            return get(validating);
          }
          return set(actOn, next.value);
        }
      }
    },
  );

  // Curated atom with combination of all the form level errors
  // form group errors, validation at form level, and field level
  // and controls to edit the form state if needed
  const formControlAtom = atom(
    (get, atomOptions) => {
      const errorVals = get(errorsAtom);
      const errLen = Object.keys(errorVals).filter((x) => errorVals[x]).length;
      const validateAtomResult = get(formGroupAtomValues);
      const isValid = validateAtomResult.isValid && errLen === 0;

      // INTERNAL USECASE, AVOID USING IN YOUR OWN LIBS
      const setter = atomOptions.setSelf;

      return {
        ...validateAtomResult,
        isValid,
        fieldErrors: <Record<Keys, any>>errorVals,
        touched: <Record<Keys, boolean>>get(touchedState),
        focused: <Record<Keys, boolean>>get(focusedState),
        setValue(key: Keys, value: Vals) {
          setter({
            action: 'SET_VALUE',
            key,
            value,
          });
        },
        setTouched(key: Keys, val: boolean) {
          setter({
            action: 'SET_TOUCHED',
            key,
            value: val,
          });
        },
        setFocused(key: Keys, val: boolean) {
          setter({
            action: 'SET_FOCUSED',
            key,
            value: val,
          });
        },
        handleOnChange(key: Keys) {
          return (val: any) => {
            setter({
              action: 'SET_VALUE',
              key,
              value: val,
            });
          };
        },
        handleOnFocus(key: Keys) {
          return () =>
            setter({
              action: 'SET_FOCUSED',
              key,
              value: true,
            });
        },
        handleOnBlur(key: Keys) {
          return () => {
            setter({
              action: 'SET_TOUCHED',
              key,
              value: true,
            });
            setter({
              action: 'SET_FOCUSED',
              key,
              value: false,
            });
          };
        },
      };
    },
    (_, set, next: ActionableNext) => set(formGroupAtomValues, next),
  );

  // Return read only atom to avoid direct modifications to the atom
  return atom((get) => get(formControlAtom));
}
