import React from 'react';
import { useAtom } from 'jotai/react';
import { atomWithValidate } from 'jotai-form';
import { number } from 'yup';

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const schema = number().required().min(0).max(100);

const fieldAtom = atomWithValidate(0, {
  validate: async (v) => {
    await sleep(500);
    return schema.validate(v);
  },
});

const Field = () => {
  const [state, setValue] = useAtom(fieldAtom);
  return (
    <div>
      <span>{state.isDirty && '*'}</span>
      <input
        value={state.value}
        onChange={(e) => setValue(e.target.value as any)}
      />
      <span>{state.isValidating && 'Validating...'}</span>
      <span>{!state.isValidating && state.isValid && 'Valid'}</span>
      <span>{!state.isValidating && !state.isValid && `${state.error}`}</span>
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

export default App;
