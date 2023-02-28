/* eslint-disable */
// @ts-nocheck WIP IGNORE TYPE ISSUES FOR NOW

import { atom } from 'jotai';
import type { SetStateAction, WritableAtom } from 'jotai';
import { atomWithValidate } from './atomWithValidate';

/**
 * TODO
 * - Handle touched, pristine conditions based
 * on handlers exposed by the atom
 * - combine with atomWithValidate or recreate atomWithValidate if needed
 * - not sure of the API of this atom yet, since [read,write] tuple would make no
 * sense here, something like formik could be exposed but doesn't follow the jotai API
 * conventions
 */
export function atomWithInput<Value>(
  value: Value,
  options: { validate: (v) => v },
): WritableAtom<SyncState<Value>, [SetStateAction<Value>], void> {
  // const baseAtom = atom({
  //   touched: false,
  //   handleOnFocus() {},
  //   handleOnChange() {},
  //   handleOnBlur() {},
  // });
  // const validatedAtom = atomWithValidate(value, {
  //   validate: options.validate ? options.validate : (v) => v,
  // });
  // const derivedAtom = atom(
  //   (get) => {},
  //   (get, set, action: SetStateAction<Value>) => {},
  // );
  // return derivedAtom;
}
