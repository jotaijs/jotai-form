import { WritableAtom } from 'jotai';
import * as React from 'react';
import { useFormAtom } from '../../src/index';

type Props = {
  atomDef: WritableAtom<any, any, void>;
};

export const FormControlValues = ({ atomDef }: Props) => {
  const { form, handleOnChange } = useFormAtom(atomDef, {});

  return (
    <>
      <input
        aria-label="email-input"
        value={form.values.email}
        onChange={(e) => handleOnChange('email')(e.target.value)}
      />
      <p>email: {form.values.email}</p>
    </>
  );
};

export const FormControlErrors = ({ atomDef }: Props) => {
  const { form, handleOnChange } = useFormAtom(atomDef, {});

  return (
    <>
      <input
        aria-label="email-input"
        value={form.values.email}
        onChange={(e) => handleOnChange('email')(e.target.value)}
      />
      <p>email: {form.values.email}</p>
      <p>error: {!form.isValid && form.errors.email?.toString()}</p>
      <p>
        form error:{' '}
        {!form.isValidating && !form.isValid && form.error?.toString()}
      </p>
    </>
  );
};

export const FormControlFieldStates = ({ atomDef }: Props) => {
  const { form, handleOnChange, handleOnBlur, handleOnFocus } = useFormAtom(
    atomDef,
    {},
  );

  return (
    <>
      <input
        aria-label="email-input"
        value={form.values.email}
        onChange={(e) => handleOnChange('email')(e.target.value)}
        onBlur={handleOnBlur('email')}
        onFocus={handleOnFocus('email')}
      />
      <p>focused: {form.focused.email ? 'true' : 'false'}</p>
      <p>touched: {form.touched.email ? 'true' : 'false'}</p>
    </>
  );
};
