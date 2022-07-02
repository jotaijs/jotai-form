import 'regenerator-runtime/runtime';

import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { useAtom } from 'jotai';
import { atomWithValidate, validateAtom } from '../src/index';

describe('validateForm', () => {
  it('basic form level validation', async () => {
    const firstNameAtom = atomWithValidate('dai', {
      validate: (v: unknown) => {
        if (String(v).length < 2) {
          throw new Error('First Name should be greater than 3 characters');
        }
        return v;
      },
    });
    const lastNameAtom = atomWithValidate('shi', {
      validate: (v: unknown) => {
        if (String(v).length < 2) {
          throw new Error('Last Name should be greater than 3 characters');
        }
        return v;
      },
    });

    const formStateAtom = validateAtom(async (getValues) => {
      const values = getValues({
        firstName: firstNameAtom,
        lastName: lastNameAtom,
      });

      if (
        String(values.firstName).length + String(values.lastName).length >
        12
      ) {
        throw new Error('The full name cannot be greater than 12 characters');
      }

      return true;
    });

    const Component = () => {
      const [firstName, setFirstNameValue] = useAtom(firstNameAtom);
      const [lastName, setLastNameValue] = useAtom(lastNameAtom);
      const [formState] = useAtom(formStateAtom);

      return (
        <>
          <div>{`firstName: ${firstName.value}`}</div>
          <div>{`firstNameValid: ${JSON.stringify(firstName.isValid)}`}</div>
          <div>{`lastName: ${lastName.value}`}</div>
          <div>{`lastNameValid: ${JSON.stringify(lastName.isValid)}`}</div>

          <div>{`formValid: ${JSON.stringify(formState.isValid)}`}</div>
          <div>{`formError: ${String(formState.error)}`}</div>

          <button
            type="button"
            onClick={() => {
              setFirstNameValue('dai');
              setLastNameValue('shi');
            }}
          >
            valid form
          </button>
          <button
            type="button"
            onClick={() => {
              setFirstNameValue('longstart');
              setLastNameValue('longend');
            }}
          >
            invalid form
          </button>
        </>
      );
    };

    const { getByText } = render(
      <div>
        <Component />
      </div>,
    );

    // initial form state
    await waitFor(() => {
      getByText('firstName: dai');
      getByText('firstNameValid: true');
      getByText('lastName: shi');
      getByText('lastNameValid: true');

      getByText('formValid: true');
      getByText('formError: null');
    });

    // force invalid data and check it
    fireEvent.click(getByText('invalid form'));
    await waitFor(() => {
      getByText('firstName: longstart');
      getByText('firstNameValid: true');
      getByText('lastName: longend');
      getByText('lastNameValid: true');
      getByText('formValid: false');
      getByText(
        'formError: Error: The full name cannot be greater than 12 characters',
      );
    });

    // force valid data and check it
    fireEvent.click(getByText('valid form'));
    await waitFor(() => {
      getByText('firstName: dai');
      getByText('firstNameValid: true');
      getByText('lastName: shi');
      getByText('lastNameValid: true');
      getByText('formValid: true');
      getByText('formError: null');
    });
  });
});
