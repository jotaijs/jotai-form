import { useAtomValue } from 'jotai';
import { atomWithFormControls, atomWithValidate } from 'jotai-form';
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
      if (!v.email.includes('@')) throw new Error('Valid email please');
    },
  },
);

const Field = () => {
  const {
    values,
    isValid,
    focused,
    touched,
    errors,
    error,
    handleOnChange,
    handleOnBlur,
    handleOnFocus,
  } = useAtomValue(fgroup);

  return (
    <div>
      {/* <span>{isDirty && '*'}</span> */}
      <input
        value={values.email}
        onChange={(e) => {
          handleOnChange('email')(e.target.value);
        }}
        onFocus={handleOnFocus('email')}
        onBlur={handleOnBlur('email')}
      />
      <input
        value={values.field}
        onChange={(e) => {
          handleOnChange('field')(e.target.value);
        }}
        onFocus={handleOnFocus('field')}
        onBlur={handleOnBlur('field')}
      />
      <p>{isValid ? 'Valid' : `${errors.field}`}</p>
      <p>{touched.field ? 'Touched' : 'Untouched'}</p>
      <p>{focused.field ? 'Focused Field' : 'Not in focus'}</p>
      <p>Form Error: {error?.toString()}</p>
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
