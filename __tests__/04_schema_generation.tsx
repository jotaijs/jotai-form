import 'regenerator-runtime/runtime';

import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import { z } from 'zod';
import { atomFromZodSchema } from '../src/utils/zod';
import { FormControlPrimitiveValues } from './components/FormControl';

afterEach(() => {
  cleanup();
});

describe('atomFromZodSchema', () => {
  it('will create a form atom', async () => {
    const schema = z.object({
      email: z.string().email().default('jotai@example.com'),
      age: z.number(),
      agreed: z.boolean(),
    });

    const formAtom = atomFromZodSchema(schema);

    const { getByText, getByLabelText } = render(
      <div>
        <FormControlPrimitiveValues atomDef={formAtom} />
      </div>,
    );

    await act(async () => {
      await waitFor(() => {
        const emailInput = getByLabelText('email-input');
        getByText('email: jotai@example.com');

        const ageInput = getByLabelText('age-input');
        getByText('age: 0');

        const agreedInput = getByLabelText('agree-input');
        getByText('agreed: No');

        fireEvent.change(emailInput, {
          target: { value: 'reaper@example.com' },
        });
        getByText('email: reaper@example.com');

        fireEvent.change(ageInput, {
          target: { value: '2' },
        });
        getByText('age: 2');

        fireEvent.click(agreedInput);
        getByText('agreed: Yes');
      });
    });
  });
});
