import { atom, Getter, SetStateAction, WritableAtom } from 'jotai';
import { loadable } from 'jotai/utils';

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
  SetStateAction<Value>
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
        const atomValue = get(v);
        return [k, atomValue.value];
      }),
    );
    return values as Record<Keys, inferGeneric<Vals>>;
  });

  const baseAtom = atom(async (get) => {
    // extract value from each atom and assign to the given key as label
    return validator(get(valsAtom));
  });

  const normalizerAtom = atom((get) => {
    const values = get(valsAtom);
    const state = get(loadable(baseAtom));
    return {
      ...state,
      values,
    };
  });

  const derv = atom((get) => {
    const validatorState = get(normalizerAtom);

    const next: State<typeof validatorState.values> = {
      isValid: true,
      isValidating: undefined,
      error: null,
      values: validatorState.values,
    };

    if (validatorState.state === 'loading') {
      next.isValid = undefined;
      next.isValidating = true;
    }

    if (validatorState.state === 'hasError') {
      next.isValid = false;
      next.error = validatorState.error;
    }

    if (validatorState.state === 'hasData') {
      next.isValid = true;
      next.error = null;
    }

    return next;
  });

  return derv;
};
