# jotai-form

👻📃

## Tweets

- [Initial announcement](https://twitter.com/dai_shi/status/1518562466627821570)
- [Example with Joi](https://twitter.com/dai_shi/status/1518823782127124480)

## Install

```sh
npm i jotai-form
# or
yarn add jotai-form
# or
pnpm add jotai-form
```

## Getting Started

The library stays true to [jotai's](https://jotai.org) concept of being atomic
and is to be used with `jotai`, so please make sure you have it installed. If
not please do so

```sh
npm i jotai
# or
yarn add jotai
# or
pnpm add jotai
```

## Usage

- [Basic Usage](#basic-usage)
- [Form Level Validation](#form-level-validation)

#### Basic Usage

```js
import { useAtom } from 'jotai';
import { atomWithValidate } from 'jotai-form';
import * as Yup from 'yup';

const emailSchema = Yup.string().email().required();

const emailAtom = atomWithValidate('', {
  validate: async (v) => {
    await emailSchema.validate(v);
    return v;
  },
});

const Form = () => {
  const [email, setEmail] = useAtom(emailAtom);

  return (
    <div>
      <input value={email.value} onChange={(e) => setEmail(e.target.value)} />
      <span>{email.isValid && 'Valid'}</span>
      <span>{!email.isValid && `${email.error}`}</span>
    </div>
  );
};
```

#### Form Level Validation

```js
import { useAtom } from 'jotai';
import { atomWithValidate } from 'jotai-form';
import * as Yup from 'yup';

const emailSchema = Yup.string().email();
const ageSchema = Yup.number().min(18);

const formSchema = Yup.object().shape({
  email: Yup.string().required(),
  age: Yup.number().required(),
});

const emailAtom = atomWithValidate('', {
  validate: async (v) => {
    await emailSchema.validate(v);
    return v;
  },
});

const age = atomWithValidate(6, {
  validate: async (v) => {
    await ageSchema.validate(v);
    return v;
  },
});

const formGroup = validateAtoms(
  {
    email: emailAtom,
    age: ageAtom,
  },
  async (values) => {
    await formSchema.validate(values);
  },
);

const Form = () => {
  const [email, setEmail] = useAtom(emailAtom);
  const [age, setAge] = useAtom(ageAtom);
  const [formState] = useAtom(formGroup);

  return (
    <div>
      <label>
        email
        <input value={email.value} onChange={(e) => setEmail(e.target.value)} />
        <span>{email.isValid && 'Valid'}</span>
        <span>{!email.isValid && `${email.error}`}</span>
      </label>

      <label>
        age
        <input
          type="number"
          value={age.value}
          onChange={(e) => setAge(e.target.value)}
        />
        <span>{age.isValid && 'Valid'}</span>
        <span>{!age.isValid && `${age.error}`}</span>
      </label>

      <button disabled={!formState.isValid}>Submit</button>
      <span>{!formState.isValid && `${formState.error}`}</span>
    </div>
  );
};
```
