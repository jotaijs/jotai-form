import { atom } from 'jotai/vanilla';
import type { WritableAtom, SetStateAction } from 'jotai/vanilla';

export type CommonState<Value> = {
  value: Value;
  isDirty: boolean;
};

export type AsyncState<Value> = CommonState<Value> &
  (
    | { isValidating: true }
    | { isValidating: false; isValid: true }
    | { isValidating: false; isValid: false; error: unknown }
  );

export type SyncState<Value> = CommonState<Value> &
  ({ isValid: true } | { isValid: false; error: unknown });

type CommonOptions<Value> = {
  areEqual?: (a: Value, b: Value) => boolean;
};

type AsyncOptions<Value> = CommonOptions<Value> & {
  validate: (value: Value) => Promise<Value>;
};

type SyncOptions<Value> = CommonOptions<Value> & {
  validate: (value: Value) => Value;
};

export function atomWithValidate<Value>(
  initialValue: Value,
  options: AsyncOptions<Value>,
): WritableAtom<AsyncState<Value>, [SetStateAction<Value>], void>;

export function atomWithValidate<Value>(
  initialValue: Value,
  options: SyncOptions<Value>,
): WritableAtom<SyncState<Value>, [SetStateAction<Value>], void>;

export function atomWithValidate<Value>(
  initialValue: Value,
  options: AsyncOptions<Value> | SyncOptions<Value>,
) {
  const { areEqual = Object.is, validate } = options;
  let initialState: AsyncState<Value> | SyncState<Value>;
  let initialPromise: Promise<Value> | undefined;
  try {
    const initialValidatedValue = validate(initialValue);
    if (initialValidatedValue instanceof Promise) {
      initialPromise = initialValidatedValue;
      initialState = {
        value: initialValue,
        isDirty: false,
        isValidating: true,
      };
    } else {
      initialState = {
        value: initialValue,
        isDirty: false,
        isValid: true,
      };
    }
  } catch (error) {
    initialState = {
      value: initialValue,
      isDirty: false,
      isValid: false,
      error,
    };
  }
  const baseAtom = atom(initialState);
  baseAtom.onMount = (setValue) => {
    if (initialPromise) {
      initialPromise
        .then((resolvedValue) => {
          const nextState: AsyncState<Value> = {
            value: resolvedValue,
            isDirty: !areEqual(initialValue, resolvedValue),
            isValidating: false,
            isValid: true,
          };
          setValue(nextState);
        })
        .catch((error) => {
          const nextState: AsyncState<Value> = {
            value: initialValue,
            isDirty: false,
            isValidating: false,
            isValid: false,
            error,
          };
          setValue(nextState);
        });
    }
  };
  const derivedAtom = atom(
    (get) => get(baseAtom),
    (get, set, action: SetStateAction<Value>) => {
      const prevState = get(baseAtom);
      const nextValue =
        typeof action === 'function'
          ? (action as any)(prevState.value)
          : action;
      try {
        const validatedValue = validate(nextValue);
        if (validatedValue instanceof Promise) {
          const pendingState: AsyncState<Value> = {
            value: nextValue,
            isDirty: !areEqual(initialValue, nextValue),
            isValidating: true,
          };
          set(baseAtom, pendingState);
          validatedValue
            .then((resolvedValue) => {
              const nextState: AsyncState<Value> = {
                value: resolvedValue,
                isDirty: !areEqual(initialValue, resolvedValue),
                isValidating: false,
                isValid: true,
              };
              set(baseAtom, (prev) =>
                prev === pendingState ? nextState : prev,
              );
            })
            .catch((error) => {
              const nextState: AsyncState<Value> = {
                value: nextValue,
                isDirty: !areEqual(initialValue, nextValue),
                isValidating: false,
                isValid: false,
                error,
              };
              set(baseAtom, (prev) =>
                prev === pendingState ? nextState : prev,
              );
            });
        } else {
          const nextState: SyncState<Value> = {
            value: validatedValue,
            isDirty: !areEqual(initialValue, validatedValue),
            isValid: true,
          };
          set(baseAtom, nextState);
        }
      } catch (error) {
        const nextState: SyncState<Value> = {
          value: nextValue,
          isDirty: !areEqual(initialValue, nextValue),
          isValid: false,
          error,
        };
        set(baseAtom, nextState);
      }
    },
  );
  return derivedAtom;
}
