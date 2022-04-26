import React from 'react';
import { useAtom } from 'jotai';
import { atomWithValidate } from 'jotai-form';
import Joi from 'joi';

const schema = Joi.number().required().min(0).max(100);

const fieldAtom = atomWithValidate(0, {
  validate: (v) => {
    const result: Joi.ValidationResult<number> = schema.validate(v);
    if (result.error) {
      throw result.error;
    }
    return result.value;
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
      <span>{state.isValid && 'Valid'}</span>
      <span>{!state.isValid && `${state.error}`}</span>
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
