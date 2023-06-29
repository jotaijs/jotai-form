import { atom } from 'jotai';
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

  const valueAtom = atom(
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

  const formControlAtom = atom(
    (get, options) => {
      const errorVals = get(errorsAtom);
      const errLen = Object.keys(errorVals).filter((x) => errorVals[x]).length;
      const validateAtomResult = get(valueAtom);
      const isValid = validateAtomResult.isValid && errLen === 0;

      // INTERNAL USECASE, AVOID USING IN YOUR OWN LIBS
      const setter = options.setSelf;

      return {
        ...validateAtomResult,
        isValid,
        errors: errorVals,
        touched: get(touchedState),
        focused: get(focusedState),
        setTouched(key: string, val: boolean) {
          setter({
            action: 'SET_TOUCHED',
            key,
            value: val,
          });
        },
        setFocused(key: string, val: boolean) {
          setter({
            action: 'SET_FOCUSED',
            key,
            value: val,
          });
        },
        handleOnChange(key: string) {
          return (val: any) => {
            setter({
              action: 'SET_VALUE',
              key: key,
              value: val,
            });
          };
        },
        handleOnFocus(key: string) {
          return () =>
            setter({
              action: 'SET_FOCUSED',
              key,
              value: true,
            });
        },
        handleOnBlur(key: string) {
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
    (_, set, next: ActionableNext) => set(valueAtom, next),
  );

  return atom((g) => g(formControlAtom));
}
