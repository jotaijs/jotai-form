import {
  atomWithFormControls,
  atomWithValidate,
  useFormAtom,
} from 'jotai-form';
import React from 'react';
import { createRoot } from 'react-dom/client';

const fieldAtom = atomWithValidate(0, {
  validate: (v) => {
    const n = Number(v);
    if (Number.isNaN(n)) {
      throw new Error('not a number');
    }
    return n;
  },
});

const emailAtom = atomWithValidate('', {
  validate: (v) => {
    return v;
  },
});

const fgroup = atomWithFormControls(
  {
    field: fieldAtom,
    email: emailAtom,
  },
  {
    validate: (v) => {
      if (v.field > 3) throw new Error("Can't be greated than 3");
    },
  },
);

const Field = () => {
  const { form, handleOnChange, handleOnBlur, handleOnFocus } = useFormAtom(
    fgroup,
    {
      onSubmit: (v) => {
        // Disabled for example
        // eslint-disable-next-line no-console
        console.log({ v });
      },
    },
  );

  return (
    <div>
      <span>{form.isDirty && '*'}</span>
      <input
        value={form.values.field}
        onChange={(e) => handleOnChange('field')(e.target.value)}
        onFocus={handleOnFocus('field')}
        onBlur={handleOnBlur('field')}
      />
      <p>{form.isValid ? 'Valid' : `${form.errors.field}`}</p>
      <p>{form.touched.field ? 'Touched' : 'Untouched'}</p>
      <p>{form.focused.field ? 'Focused Field' : 'Not in focus'}</p>
      <p>Form Error: {form.error?.toString()}</p>
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
