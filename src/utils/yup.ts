import {
  AtomWithValidation,
  atomWithFormControls,
  atomWithValidate,
} from 'jotai-form';
import * as Yup from 'yup';

type Maybe<T> = T | null | undefined;
type AnyObject = {
  [k: string]: any;
};

export function atomFromYupSchema<T extends Maybe<AnyObject>>(
  schema: Yup.ObjectSchema<T>,
) {
  if (schema.type !== 'object') {
    throw new Error("[atomFromYupSchema] only accepts ObjectSchema's");
  }

  const result = {} as Record<string, AtomWithValidation<any>>;

  Object.keys(schema.fields).forEach((key) => {
    let initialValue: any;
    const subSchema = schema.fields[key] as Yup.Schema;
    if (!Yup.isSchema(subSchema)) return;

    const hasDefaultValue = subSchema.getDefault();

    if (hasDefaultValue) {
      initialValue = hasDefaultValue;
    } else {
      switch (subSchema.type) {
        case 'string': {
          initialValue = '';
          break;
        }
        case 'number': {
          initialValue = 0;
          break;
        }
        case 'boolean': {
          initialValue = false;
          break;
        }
        default: {
          initialValue = undefined;
          break;
        }
      }
    }
    result[key] = atomWithValidate(initialValue, {
      validate: (v) => v,
    });
  });

  return atomWithFormControls(result, {
    validate: (values) => {
      schema.validate(values);
    },
  });
}
