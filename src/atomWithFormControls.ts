import { atom, useAtom, WritableAtom } from 'jotai';
import type { Validator, ValidatorState, inferGeneric } from './validateAtoms';
import { AtomWithValidation, validateAtoms } from './validateAtoms';

type Options<Vkeys extends symbol | string | number, Vvals> = {
  validate: Validator<Vkeys, Vvals>;
};

type UseFormOptions = {
  onSubmit?: (v: Record<string, any>, ...args: any[]) => void;
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
        if (val.isValid === false)
          // @ts-expect-error result of the line above
          return [k, val.error];
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

  return atom(
    (get) => {
      const errorVals = get(errorsAtom);
      const errLen = Object.keys(errorVals).filter((x) => errorVals[x]).length;
      const validateAtomResult = get(valueAtom);
      const isValid = validateAtomResult.isValid && errLen === 0;
      return {
        ...validateAtomResult,
        isValid,
        errors: errorVals,
        touched: get(touchedState),
        focused: get(focusedState),
      };
    },
    (_, set, next: ActionableNext) => set(valueAtom, next),
  );
}

type FormFieldValues<Keys extends string, Vals> = WritableAtom<
  {
    isValid: boolean | undefined;
    errors: Record<Keys, any>;
    touched: Record<Keys, boolean>;
    focused: Record<Keys, boolean>;
    values: Record<Keys, inferGeneric<Vals>>;
    error: unknown;
    isValidating: boolean | undefined;
  },
  [next: ActionableNext],
  | void
  | ({
      values: Record<Keys, inferGeneric<Vals>>;
    } & ValidatorState)
>;

export function useFormAtom<Keys extends string, Vals>(
  atomDef: FormFieldValues<Keys, Vals>,
  options: UseFormOptions = {},
) {
  const [form, setForm] = useAtom(atomDef);

  const createHandleOnSubmit = () => {
    return <EventType>(event: EventType) =>
      options.onSubmit?.(form.values, event);
  };

  const createHandleOnFocus = () => {
    return (key: string) => {
      return () =>
        setForm({
          action: 'SET_FOCUSED',
          key,
          value: true,
        });
    };
  };

  const createSetTouched = () => {
    return (key: string, value: boolean) => {
      setForm({
        action: 'SET_TOUCHED',
        key,
        value,
      });
    };
  };

  const createHandleOnBlur = () => {
    return (key: string) => {
      return () => {
        setForm({
          action: 'SET_TOUCHED',
          key,
          value: true,
        });
        setForm({
          action: 'SET_FOCUSED',
          key,
          value: false,
        });
      };
    };
  };

  const createHandleOnChange = () => {
    return (key: string) => {
      return (next: unknown) => {
        setForm({
          action: 'SET_VALUE',
          key,
          value: next,
        });
      };
    };
  };

  return {
    form,
    handleOnSubmit: createHandleOnSubmit(),
    handleOnChange: createHandleOnChange(),
    handleOnBlur: createHandleOnBlur(),
    handleOnFocus: createHandleOnFocus(),
    setTouched: createSetTouched(),
  };
}
