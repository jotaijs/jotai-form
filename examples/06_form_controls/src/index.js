import React from 'react';
import { createRoot } from 'react-dom/client';
import { useAtom } from 'jotai/react';
import {
  atomWithFormControls,
  atomWithValidate,
  useFormAtom,
} from 'jotai-form';
import { atom } from 'jotai';

const fieldAtom = atomWithValidate(0, {
  validate: (v) => {
    const n = Number(v);
    if (Number.isNaN(n)) {
      throw new Error('not a number');
    }
    return n;
  },
});

const emailAtom = atom('');

const fgroup = atomWithFormControls(
  {
    field: fieldAtom,
    email: emailAtom,
  },
  {
    validate: (v) => v,
  },
);

const Field = () => {
  const { form, handleOnChange } = useFormAtom(fgroup, {
    onSubmit: (v) => {
      console.log({ v });
    },
  });

  return (
    <div>
      <span>{form.isDirty && '*'}</span>
      <input
        value={form.values.field}
        onChange={(e) => handleOnChange('field')(e.target.value)}
      />
      <span>{form.isValid ? 'Valid' : `${form.error.field}`}</span>
    </div>
  );
};

const App = () => {
  return (
    <div>
      <Field />
    </div>
  );
};

createRoot(document.getElementById('app')).render(<App />);
