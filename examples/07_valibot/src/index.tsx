import React from 'react';
import { createRoot } from 'react-dom/client';
import { useAtom } from 'jotai/react';
import { atomWithValidate } from 'jotai-form';
import { email, safeParse, string } from 'valibot';

const emailSchema = string([email()]);

const emailAtom = atomWithValidate('demo@jotai.org', {
  validate: (emailValue) => {
    const result = safeParse(emailSchema, emailValue);

    // We handle the outcome of the validation
    // when an error is detected, we pull out the array of issues to render
    // you can also set "abortEarly" to true and just pick the first one
    if (result.success) {
      return emailValue;
    }

    throw result.issues;
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
