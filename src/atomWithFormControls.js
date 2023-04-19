import { atom, useAtom } from 'jotai';

import { validateAtoms } from 'jotai-form';

const noopValidate = (v) => v;

export function atomWithFormControls(
  labeledAtoms,
  options = { validate: noopValidate },
) {
  const touchedState = atom(false);

  const validating = validateAtoms(labeledAtoms, options.validate);

  const errorsAtom = atom((get) => {
    return Object.fromEntries(
      Object.entries(labeledAtoms).map(([k, v]) => {
        return [k, get(v).error ?? null];
      }),
    );
  });

  const valueAtom = atom(
    (get) => {
      return get(validating);
    },
    (get, set, next) => {
      if (next.action === 'SET_TOUCHED') {
        return set(touchedState, next.value);
      }
      return set(labeledAtoms[next.key], next.value);
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
      };
    },
    (get, set, next) => set(valueAtom, next),
  );
}

export function useFormAtom(atomDef, options = {}) {
  const [form, setForm] = useAtom(atomDef);

  const createHandleOnSubmit = () => {
    return (event) => options?.onSubmit?.(form.values, event);
  };

  const createHandleOnFocus = () => {
    return () => {
      setForm({
        action: 'SET_TOUCHED',
        value: true,
      });
    };
  };

  const createHandleOnBlur = () => {
    return () => {
      setForm({
        action: 'SET_TOUCHED',
        value: true,
      });
    };
  };

  const createHandleOnChange = () => {
    return (key) => {
      return (next) => {
        setForm({
          action: 'VALUE',
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
  };
}
