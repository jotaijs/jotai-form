import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { useAtom } from 'jotai/react';
import { atomWithValidate } from '../src/index';
import { Constants } from '../src/atomWithValidate';

describe('atomWithValidate spec', () => {
  it('only number', async () => {
    const dataAtom = atomWithValidate(0, {
      validate: (v: unknown) => {
        const n = Number(v);
        if (Number.isNaN(n)) {
          throw new Error('not a number');
        }
        return n;
      },
    });
    const Component = () => {
      const [{ value, isValid }, setValue] = useAtom(dataAtom);
      return (
        <>
          <div>value: {value}</div>
          <div>isValid: {JSON.stringify(isValid)}</div>
          <button type="button" onClick={() => setValue(1)}>
            set 1
          </button>
          <button type="button" onClick={() => setValue('a' as any)}>
            set a
          </button>
        </>
      );
    };

    const { getByText } = render(
      <div>
        <Component />
      </div>,
    );

    await waitFor(() => {
      getByText('value: 0');
      getByText('isValid: true');
    });

    fireEvent.click(getByText('set 1'));
    await waitFor(() => {
      getByText('value: 1');
      getByText('isValid: true');
    });

    fireEvent.click(getByText('set a'));
    await waitFor(() => {
      getByText('value: a');
      getByText('isValid: false');
    });
  });

  it('reset value', async () => {
    const dataAtom = atomWithValidate(0, {
      validate: (v) => v,
    });
    const Component = () => {
      const [{ value, isDirty }, setValue] = useAtom(dataAtom);
      return (
        <>
          <div>value: {value}</div>
          <div>isDirty: {JSON.stringify(isDirty)}</div>
          <button
            type="button"
            onClick={() =>
              // @ts-expect-error TODO TYPES
              setValue({
                [Constants.ACTION]: Constants.ACTION_RESET,
                [Constants.VALUE]: 1,
              })
            }
          >
            reset
          </button>
        </>
      );
    };

    const { getByText } = render(
      <div>
        <Component />
      </div>,
    );

    await waitFor(() => {
      getByText('value: 0');
      getByText('isDirty: false');
    });

    fireEvent.click(getByText('reset'));
    await waitFor(() => {
      getByText('value: 1');
      getByText('isDirty: false');
    });
  });
});
