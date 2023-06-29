import 'regenerator-runtime/runtime';

import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react';
import * as Yup from 'yup';
import React from 'react';
import { atomWithFormControls, atomWithValidate } from '../src/index';
import {
  FormControlErrors,
  FormControlFieldStates,
  FormControlValues,
} from './components/FormControl';

afterEach(() => {
  cleanup();
});

describe('atomWithFormControls', () => {
  it('will handle form value changes', async () => {
    const emailAtom = atomWithValidate('jotai@example.com', {
      validate: (v) => v,
    });

    const formAtom = atomWithFormControls({
      email: emailAtom,
    });

    const { getByText, getByLabelText } = render(
      <div>
        <FormControlValues atomDef={formAtom} />
      </div>,
    );

    await act(async () => {
      await waitFor(() => {
        const input = getByLabelText('email-input');
        getByText('email: jotai@example.com');
        fireEvent.change(input, { target: { value: 'reaper@example.com' } });
        getByText('email: reaper@example.com');
      });
    });
  });

  it('will handle internal atom validation | sync', async () => {
    const emailAtom = atomWithValidate('jotai@example.com', {
      validate: (v) =>
        Yup.string().email().required('Email is required').validateSync(v),
    });

    const formAtom = atomWithFormControls({
      email: emailAtom,
    });

    const { getByText, getByLabelText } = render(
      <div>
        <FormControlErrors atomDef={formAtom} />
      </div>,
    );

    await act(async () => {
      await waitFor(() => {
        const input = getByLabelText('email-input');
        getByText('email: jotai@example.com');
        fireEvent.change(input, { target: { value: '' } });
        getByText('error: ValidationError: Email is required');
      });
    });
  });

  it('will handle form validation | sync', async () => {
    const emailAtom = atomWithValidate('jotai@example.com', {
      validate: (v) => v,
    });

    const formAtom = atomWithFormControls(
      {
        email: emailAtom,
      },
      {
        validate: (v) => {
          if (v.email.endsWith('.com')) {
            throw new Error("Nah, we don't like simple domain names");
          }
        },
      },
    );

    const { getByText, getByLabelText } = render(
      <div>
        <FormControlErrors atomDef={formAtom} />
      </div>,
    );

    await act(async () => {
      await waitFor(async () => {
        const input = getByLabelText('email-input');
        getByText('email: jotai@example.com');
        fireEvent.change(input, { target: { value: 'reaper@example.com' } });
      });
    });

    await waitFor(() =>
      getByText("form error: Error: Nah, we don't like simple domain names"),
    );
  });

  it('will handle form states | sync', async () => {
    const emailAtom = atomWithValidate('jotai@example.com', {
      validate: (v) => v,
    });

    const formAtom = atomWithFormControls(
      {
        email: emailAtom,
      },
      {
        validate: (v) => {
          if (v.email.endsWith('.com')) {
            throw new Error("Nah, we don't like simple domain names");
          }
        },
      },
    );

    const { getByText, getByLabelText } = render(
      <div>
        <FormControlFieldStates atomDef={formAtom} />
      </div>,
    );

    const input = getByLabelText('email-input');

    await act(async () => {
      await waitFor(async () => {
        getByText('focused: false');
        getByText('touched: false');
        fireEvent.focus(input);
      });
    });

    await waitFor(() => {
      getByText('focused: true');
      fireEvent.blur(input);
    });

    await waitFor(() => {
      getByText('focused: false');
      getByText('touched: true');
    });
  });
});
