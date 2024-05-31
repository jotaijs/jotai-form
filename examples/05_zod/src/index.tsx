import { atomFromZodSchema } from 'jotai-form/zod';
import { useAtomValue } from 'jotai/react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ZodIssue, z } from 'zod';

const formAtom = atomFromZodSchema(
  z.object({
    email: z.string().email().default('demo@jotai.org'),
  }),
);

const App = () => {
  const formValue = useAtomValue(formAtom);
  const { fieldErrors, isDirty, isValid, values, handleOnChange } = formValue;

  return (
    <>
      <span>{isDirty && '*'}</span>
      <input
        value={values.email}
        onChange={(e) => handleOnChange('email')(e.target.value as any)}
      />
      <span>{isValid && 'Valid'}</span>
      {!isValid && (
        <span key="error">
          {[]
            .concat(fieldErrors.email?.issues)
            .filter((x) => x)
            .map((d: ZodIssue) => d.message)}
        </span>
      )}
    </>
  );
};

const elm = document.getElementById('app');
if (elm) {
  createRoot(elm).render(<App />);
}
