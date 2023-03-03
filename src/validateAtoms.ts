import { atom } from 'jotai/vanilla';
import type { Getter, SetStateAction, WritableAtom } from 'jotai/vanilla';
import { loadable } from 'jotai/vanilla/utils';

import type { CommonState } from './atomWithValidate';

type inferGeneric<Type> = Type extends AtomWithValidation<infer X> ? X : never;

export type Validator<Keys extends symbol | string | number, Vals> = (
  values: Record<Keys, Vals>,
) => void | Promise<void>;

export type ValidatorState = {
  isValid: undefined | boolean;
  error: null | Error | unknown;
  isValidating: undefined | boolean;
};

type AtomWithValidation<Value> = WritableAtom<
  CommonState<Value>,
  [SetStateAction<Value>],
  void
>;

type State<Values extends Record<string, unknown>> = {
  values: Values;
} & ValidatorState;

export const validateAtoms = <
  AtomGroup extends Record<string, AtomWithValidation<any>>,
  Keys extends keyof AtomGroup,
  Vals extends AtomGroup[Keys],
>(
  labeledAtoms: AtomGroup,
  validator: Validator<Keys, inferGeneric<Vals>>,
) => {
  const valsAtom = atom((get: Getter) => {
    const values = Object.fromEntries(
      Object.entries(labeledAtoms).map(([k, v]) => {
        return [k, get(v).value];
      }),
    );
    return values as Record<Keys, inferGeneric<Vals>>;
  });

  if (process.env.NODE_ENV !== 'production') {
    valsAtom.debugPrivate = true;
  }

  const baseAtom = atom(async (get) => {
    // extract value from each atom and assign to the given key as label
    return validator(get(valsAtom));
  });

  if (process.env.NODE_ENV !== 'production') {
    baseAtom.debugPrivate = true;
  }

  const derv = atom((get) => {
    const values = get(valsAtom);
    const loadableAtom = loadable(baseAtom);
    if (process.env.NODE_ENV !== 'production') {
      loadableAtom.debugPrivate = true;
    }
    const loadableState = get(loadableAtom);

    const next: State<typeof values> = {
      isValid: true,
      isValidating: undefined,
      error: null,
      values,
    };

    switch (loadableState.state) {
      case 'loading': {
        next.isValid = undefined;
        next.isValidating = true;
        break;
      }
      case 'hasData': {
        next.isValid = true;
        next.error = null;
        break;
      }
      case 'hasError': {
        next.isValid = false;
        next.error = loadableState.error;
        break;
      }
      default: {
        next.isValid = true;
        next.isValidating = undefined;
        next.error = null;
        break;
      }
    }

    return next;
  });

  return derv;
};
