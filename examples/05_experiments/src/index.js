import React from 'react';
import { createRoot } from 'react-dom/client';
import { useAtom } from 'jotai';
import { atomWithValidate, atomWithValidateExtended } from 'jotai-form';

const fieldAtom = atomWithValidate(0, {
  validate: (v) => {
    const n = Number(v);
    if (Number.isNaN(n)) {
      throw new Error('not a number');
    }
    return n;
  },
});

const fieldExtended = atomWithValidateExtended(fieldAtom);

const Field = () => {
  const [state, setValue] = useAtom(fieldAtom);
  const [formState, setFormState] = useAtom(fieldExtended);

  return (
    <div>
      <span>{formState.isDirty && '*'}</span>
      <input
        value={formState.value}
        onChange={(e) => setFormState(e.target.value)}
        onBlur={() => setFormState('TOUCHED')}
      />
      <span>{formState.isValid ? 'Valid' : `${state.error}`}</span>{' '}
      <span>{formState.touched ? 'Touched' : 'Untouched'}</span>
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
