import 'regenerator-runtime/runtime';

import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { useAtom } from 'jotai';
import * as Yup from 'yup';
import { atomWithValidate, validateAtoms } from '../src/index';

afterEach(() => {
  cleanup();
});

describe('validateForm', () => {
  it('basic form level validation | sync', async () => {
    const firstNameAtom = atomWithValidate('dai', {
      validate: (v) => {
        if (String(v).length < 2) {
          throw new Error('First Name should be greater than 3 characters');
        }
        return v;
      },
    });
    const lastNameAtom = atomWithValidate('shi', {
      validate: (v) => {
        if (String(v).length < 2) {
          throw new Error('Last Name should be greater than 3 characters');
        }
        return v;
      },
    });

    const formStateAtom = validateAtoms(
      {
        firstName: firstNameAtom,
        lastName: lastNameAtom,
      },
      (values) => {
        if (
          ((values.firstName as string) + (values.lastName as string)).length >
          12
        ) {
          throw new Error('The full name cannot be greater than 12 characters');
        }
      },
    );

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
          <div>{`formValues: ${JSON.stringify(formState.values)}`}</div>

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
      getByText('formValues: {"firstName":"dai","lastName":"shi"}');
    });

    // force invalid data and check it
    fireEvent.click(getByText('invalid form'));
    await waitFor(() => {
      getByText('firstName: longstart');
      getByText('firstNameValid: true');
      getByText('lastName: longend');
      getByText('lastNameValid: true');
      getByText('formValid: false');
      getByText('formValues: {"firstName":"longstart","lastName":"longend"}');
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
      getByText('formValues: {"firstName":"dai","lastName":"shi"}');
    });
  });

  it('basic form level validation | async', async () => {
    const nameAtom = atomWithValidate('foo', {
      validate: (v) => v,
    });

    const ageAtom = atomWithValidate(18, {
      validate: (v) => v,
    });

    // FIXME: there's an issue with the types
    // not being able to inherit dynamic atom types
    // remove the below once those are fixed.
    const formStateAtom = validateAtoms(
      {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        name: nameAtom,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        age: ageAtom,
      },
      async (values) => {
        await Yup.object()
          .shape({
            name: Yup.string().min(3).required(),
            age: Yup.number().min(18).required(),
          })
          .validate(values);
      },
    );

    const Component = () => {
      const [name, setName] = useAtom(nameAtom);
      const [age, setAge] = useAtom(ageAtom);
      const [formState] = useAtom(formStateAtom);

      return (
        <>
          <div>{`name: ${name.value}`}</div>
          <div>{`age: ${age.value}`}</div>

          <div>{`formValid: ${JSON.stringify(formState.isValid)}`}</div>
          <div>{`formError: ${String(formState.error)}`}</div>
          <div>{`formValues: ${JSON.stringify(formState.values)}`}</div>

          <button
            type="button"
            onClick={() => {
              setName('foo');
              setAge(18);
            }}
          >
            valid form
          </button>
          <button
            type="button"
            onClick={() => {
              setName('sa');
              setAge(14);
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
      getByText('name: foo');
      getByText('age: 18');

      getByText('formValid: true');
      getByText('formError: null');
      getByText('formValues: {"name":"foo","age":18}');
    });

    // force invalid data and check it
    fireEvent.click(getByText('invalid form'));
    await waitFor(() => {
      getByText('name: sa');
      getByText('age: 14');

      getByText('formValid: false');
      getByText('formValues: {"name":"sa","age":14}');
      getByText(
        'formError: ValidationError: age must be greater than or equal to 18',
      );
    });

    // force valid data and check it
    fireEvent.click(getByText('valid form'));
    await waitFor(() => {
      getByText('name: foo');
      getByText('age: 18');

      getByText('formValid: true');
      getByText('formError: null');
      getByText('formValues: {"name":"foo","age":18}');
    });
  });
});
