import { atom, Getter, SetStateAction, WritableAtom } from 'jotai';
import { loadable } from 'jotai/utils';

import type { CommonState } from './atomWithValidate';

export type Validator = <Values extends Record<string, unknown>>(
  values: Values,
) => Promise<unknown>;

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

type LabeledAtoms<Value> = {
  [k: string]: AtomWithValidation<Value>;
};

export const validateAtoms = <Value>(
  labeledAtoms: LabeledAtoms<Value>,
  validator: Validator,
) => {
  const $getSourceAtomVals = (get: Getter) => {
    const values = Object.fromEntries(
      Object.entries(labeledAtoms).map(([k, v]) => {
        const atomValue = get(v);

        return [k, atomValue.value];
      }),
    );
    return values;
  };

  const baseAtom = atom(async (get) => {
    // extract value from each atom and assign to the given key as label
    const values = $getSourceAtomVals(get);
    return validator(values);
  });

  const normalizerAtom = atom((get) => {
    const values = $getSourceAtomVals(get);
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
