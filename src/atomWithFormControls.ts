import { SetStateAction, WritableAtom, atom, useAtom } from 'jotai';
import { validateAtoms } from './validateAtoms';

const noopValidate = <T>(v: T): T => v;

type Options = {
  validator: (V: unknown) => typeof V | Promise<typeof V>
};

type UseFormOptions = {
  onSubmit: (v: Record<string, any>, ...args: any[]) => void;
};

export type CommonState<Values> = {
  isDirty: boolean;
  values: Values;
  touched: boolean;
};

export type AsyncState<Values> = CommonState<Values> &
  (
    | { isValidating: true }
    | { isValidating: false; isValid: true }
    | { isValidating: false; isValid: false; error: unknown }
  );

export type SyncState<Values> = CommonState<Values> &
  ({ isValid: true } | { isValid: false; error: unknown });

type ActionableNext = {
  action: 'SET_VALUE' | 'SET_FOCUSED' | 'SET_TOUCHED';
  key: string;
  value: any;
};



export function atomWithFormControls<VType, AtomGroup extends Record<string, WritableAtom<VType, [SetStateAction<VType>], void>>>(labeledAtoms: AtomGroup, options: Options) {
  const initBooleanState = Object.fromEntries(Object.entries(labeledAtoms).map(([k]) => [k, false]))
  const touchedState = atom(initBooleanState);
  const focusedState = atom(initBooleanState);
  const validating = validateAtoms(
    //@ts-expect-error atomgroup inference issue
    labeledAtoms,
    options.validator ?? noopValidate,
  );

  const errorsAtom = atom((get) => {
    return Object.fromEntries(
      Object.entries(labeledAtoms).map(([k, v]) => {
        const val = get(v);
        //@ts-expect-error atomgroup inference issue
        if (val.isValidating === false && val.isValid === false)
          //@ts-expect-error ^
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
            [next.key]: Boolean(next.value)
          });
        case 'SET_FOCUSED':
          return set(focusedState, {
            ...get(focusedState),
            [next.key]: Boolean(next.value)
          });
        case "SET_VALUE":
          {
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
      return {
        ...get(valueAtom),
        isValid: errLen === 0,
        error: errorVals,
        touched: get(touchedState),
        focused: get(focusedState),
      };
    },
    (_, set, next: ActionableNext) => set(valueAtom, next),
  );
}

// FIXME: [1] T will be a Async/Sync Validator Atom
export function useFormAtom<T>(atomDef: WritableAtom<T, [SetStateAction<ActionableNext>], void>, { onSubmit }: UseFormOptions) {
  const [form, setForm] = useAtom(atomDef);

  const createHandleOnSubmit = () => {
    //@ts-expect-error dependent on [1]
    return <T>(event: T) => onSubmit?.(form.values, event);
  };

  const createHandleOnFocus = () => {
    return (key: string) => {
      return () => setForm({
        action: "SET_FOCUSED",
        key: key,
        value: true
      })
    };
  };

  const createSetTouched = () => {
    return (key: string, value: boolean) => {
      setForm({
        action: "SET_TOUCHED",
        key,
        value
      })
    }
  }

  const createHandleOnBlur = () => {
    return (key: string) => {
      return () => {
        setForm({
          action: 'SET_TOUCHED',
          key,
          value: true,
        });
        setForm({
          action: "SET_FOCUSED",
          key,
          value: false
        })
      }
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
    setTouched: createSetTouched()
  };
}
