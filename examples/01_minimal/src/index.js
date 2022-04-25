import React from 'react';
import { createRoot } from 'react-dom/client';
import { useAtom } from 'jotai';
import { atomWithValidate } from 'jotai-form';

const fieldAtom = atomWithValidate(0, {
  validate: (v) => {
    const n = Number(v);
    if (Number.isNaN(n)) {
      throw new Error('not a number');
    }
    return n;
  },
});

const Field = () => {
  const [state, setValue] = useAtom(fieldAtom);
  return (
    <div>
      <span>{state.isDirty && '*'}</span>
      <input value={state.value} onChange={(e) => setValue(e.target.value)} />
      <span>{state.isValid ? 'Valid' : `${state.error}`}</span>
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
