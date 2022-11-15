export const defaultCode = `
import { useAtom } from 'jotai/react';
import { atomWithValidate } from 'jotai-form';
import * as Yup from 'yup';

const emailAtom = atomWithValidate('', {
  validate: (email) =>
    Yup.string()
      .email("Doesn't look like an email to me...")
      .required("Ah... That's a required field")
      .validate(email),
});

const Component = () => {
  const [email, setEmail] = useAtom(emailAtom);
  
  return (
    <>
      <input 
        value={email.value}
        onChange={(e) => setEmail(e.target.value)} 
      />
      <p>
        {(email.isDirty && !email.isValid && \`\${email.error?.message}\`) || ''}
      </p>
    </>
  );
};
`;
