import 'normalize.css/normalize.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { useAtom } from 'jotai';
import { atomWithValidate } from 'jotai-form';
import { z } from 'zod';

const emailSchema = z.string().email();

const emailAtom = atomWithValidate('demo@jotai.org', {
  validate: (email) => {
    try {
      emailSchema.parse(email);
      return email;
    } catch (err: any) {
      // We catch the original and pull out the array of issues
      // to render
      // you can also just pick the first one and throw that again
      throw err.issues;
    }
  },
});

const App = () => {
  const [state, setValue] = useAtom(emailAtom);

  return (
    <>
      <span>{state.isDirty && '*'}</span>
      <input
        value={state.value}
        onChange={(e) => setValue(e.target.value as any)}
      />
      <span>{state.isValid && 'Valid'}</span>
      {!state.isValid &&
        // Since there's no way for error to inherit itself, this becomes necessary
        ((state.error as any[]) || []).map((issue: any, errIndex: number) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={`error-${errIndex}`}>{`${issue.message}`}</span>
        ))}
    </>
  );
};

const elm = document.getElementById('app');
if (elm) {
  createRoot(elm).render(<App />);
}
