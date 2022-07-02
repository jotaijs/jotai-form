import { atom, SetStateAction, WritableAtom } from 'jotai';
import { loadable } from 'jotai/utils';

import type { AsyncState, SyncState } from './atomWithValidate';

export type GetValues = <Value>(labeledAtoms: LabeledAtoms<Value>) => {
  [k: string]: Value;
};
export type Validator = (getValues: GetValues) => Promise<any>;

export type ValidatorState = {
  isValid: undefined | boolean;
  error: undefined | Error | unknown;
  isValidating: undefined | boolean;
};

// Wrapper type on top of the 2 outputs from `atomWithValidate`
type AtomWithValidation<Value> =
  | WritableAtom<AsyncState<Value>, SetStateAction<Value>>
  | WritableAtom<SyncState<Value>, SetStateAction<Value>>;

type LabeledAtoms<Value> = {
  [k: string]: AtomWithValidation<Value>;
};

export const validateAtomLoadable = (validator: Validator) => {
  const baseAtom = atom(async (get) => {
    // helper to convert an object of {string:atom} => {string: value}
    // currently expected `atom` to be one of the output types of `atomWithValidate`
    const getValues = <Value>(labeledAtoms: LabeledAtoms<Value>) => {
      const values = Object.fromEntries(
        Object.entries(labeledAtoms).map(([k, v]) => {
          // @ts-expect-error intersecting types of `AtomWithValidate<Value>` doesn't
          // satisfy the `get` type requirements
          const atomValue = get(v);

          return [k, atomValue.value];
        }),
      );
      return values;
    };

    return validator(getValues);
  });

  const derv = atom((get) => {
    const validatorState = get(loadable(baseAtom));

    const next: ValidatorState = {
      isValid: true,
      isValidating: undefined,
      error: null,
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
