import { Atom, useAtomValue } from 'jotai';
import * as React from 'react';

type Props = {
  atomDef: Atom<any>;
};

export const FormControlValues = ({ atomDef }: Props) => {
  const { values, handleOnChange } = useAtomValue(atomDef);

  return (
    <>
      <input
        aria-label="email-input"
        value={values.email}
        onChange={(e) => handleOnChange('email')(e.target.value)}
      />
      <p>email: {values.email}</p>
    </>
  );
};

export const FormControlErrors = ({ atomDef }: Props) => {
  const { values, isValid, fieldErrors, isValidating, error, handleOnChange } =
    useAtomValue(atomDef);

  return (
    <>
      <input
        aria-label="email-input"
        value={values.email}
        onChange={(e) => handleOnChange('email')(e.target.value)}
      />
      <p>email: {values.email}</p>
      <p>error: {!isValid && fieldErrors.email?.toString()}</p>
      <p>form error: {!isValidating && !isValid && error?.toString()}</p>
    </>
  );
};

export const FormControlFieldStates = ({ atomDef }: Props) => {
  const {
    values,
    focused,
    touched,
    handleOnChange,
    handleOnBlur,
    handleOnFocus,
  } = useAtomValue(atomDef);

  return (
    <>
      <input
        aria-label="email-input"
        value={values.email}
        onChange={(e) => handleOnChange('email')(e.target.value)}
        onBlur={handleOnBlur('email')}
        onFocus={handleOnFocus('email')}
      />
      <p>focused: {focused.email ? 'true' : 'false'}</p>
      <p>touched: {touched.email ? 'true' : 'false'}</p>
    </>
  );
};
