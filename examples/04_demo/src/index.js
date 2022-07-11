import 'normalize.css/normalize.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { useAtom } from 'jotai';
import { atomWithValidate } from 'jotai-form';
import styled from 'styled-components';
import * as Yup from 'yup';
import CodePreview from './components/code-preview';
import { defaultCode } from './resources/code';

const BaseLayout = styled.div`
  font-family: 'Hack', monospace;
  height: 100vh;
  width: 100vw;
  font-size: 13px !important;
  overflow: auto;
  box-sizing: border-box;
  padding: 10px;
`;

const PageLayout = styled.div`
  max-width: 80ch;
  margin: 0 auto;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const CodeLayout = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`;

const ContentLayout = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
`;

const CodePreviewStyled = styled(CodePreview)`
  font-family: 'Hack', monospace !important;
  max-width: 100%;

  @media screen and (max-width: 768px) {
    max-width: 60ch;
  }
`;

const Input = styled.input`
  background: #121318;
  border: 0px;
  padding: 12px 16px;
  font-size: 16px;
  color: white;
  border-radius: 6px;
  outline: black;

  &.valid {
    border: 2px solid #69db7c;
  }

  &.invalid {
    border: 2px solid #ff6b6b;
  }
`;

const Text = styled.p`
  padding: 0px;
  min-height: 1em;
  color: ${(props) =>
    (props.secondary && 'var(--muted)') || (props.error && 'var(--error)')};
`;

const emailAtom = atomWithValidate('demo@jotai.org', {
  validate: (email) =>
    Yup.string('Yo, this is supposed to be a string!')
      .email("That doesn't look like an email to me")
      .required('This is required you know. ')
      .validate(email),
});

const App = () => {
  const [email, setEmail] = useAtom(emailAtom);

  const inputClass = [
    email.isDirty && email.isValid ? 'valid' : '',
    email.isDirty && !email.isValid ? 'invalid' : '',
  ].join(' ');

  return (
    <BaseLayout>
      <PageLayout>
        <ContentLayout>
          <Text secondary>Change the email to see the different states</Text>
          <Input
            autoFocus
            className={inputClass}
            placeholder="example@example.com"
            value={email.value}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Text error>
            {(email.isDirty && !email.isValid && `${email.error?.message}`) ||
              ''}
          </Text>
        </ContentLayout>
        <CodeLayout>
          <CodePreviewStyled code={defaultCode} />
        </CodeLayout>
      </PageLayout>
    </BaseLayout>
  );
};

createRoot(document.getElementById('app')).render(<App />);
