import {
  AtomWithValidation,
  Options,
  atomWithFormControls,
  atomWithValidate,
} from 'jotai-form';
import { ZodDefault, ZodObject, ZodType } from 'zod';

const INSTANCE_DEFAULT_MAP = {
  string: 'defaultemail',
  number: 0,
  boolean: false,
};

const INTERNAL_INSTANCE_PRIMITIVE_MAP = {
  ZodString: 'string',
  ZodNumber: 'number',
  ZodBoolean: 'boolean',
};

type INTERNAL_PRIMITIVE_MAP_KEY = keyof typeof INTERNAL_INSTANCE_PRIMITIVE_MAP;
type INTERNAL_DEFAULT_MAP_KEY = keyof typeof INSTANCE_DEFAULT_MAP;

export function atomFromZodSchema<
  T,
  AtomGroup extends Record<string, AtomWithValidation<any>>,
  Keys extends Extract<keyof AtomGroup, string>,
  Vals extends AtomGroup[Keys],
>(schema: ZodType<T>, options?: Options<Keys, Vals>) {
  const result = {} as Record<string, AtomWithValidation<any>>;

  // eslint-disable-next-line no-underscore-dangle
  if (schema instanceof ZodObject) {
    // eslint-disable-next-line no-underscore-dangle
    Object.entries(schema._def.shape()).forEach(([key, value]) => {
      if (value instanceof ZodDefault) {
        // eslint-disable-next-line no-underscore-dangle
        const validationAtom = atomWithValidate(value._def.defaultValue(), {
          validate: (d) => value.parse(d),
        });
        result[key] = validationAtom;
      } else if (value instanceof ZodType) {
        const typeName = value.constructor.name;
        const toPrimitiveKey = Object.keys(
          INTERNAL_INSTANCE_PRIMITIVE_MAP,
        ).find((d) => {
          return typeName === d;
        }) as INTERNAL_PRIMITIVE_MAP_KEY | undefined;
        if (toPrimitiveKey) {
          const primitiveValue = INTERNAL_INSTANCE_PRIMITIVE_MAP[
            toPrimitiveKey
          ] as INTERNAL_DEFAULT_MAP_KEY;
          const defaultValue = INSTANCE_DEFAULT_MAP[primitiveValue];
          // eslint-disable-next-line no-underscore-dangle
          const validationAtom = atomWithValidate(defaultValue, {
            validate: (d) => value.parse(d),
          });
          result[key] = validationAtom;
        }
      }
    });
  }
  return atomWithFormControls<AtomGroup, Keys, Vals>(result as AtomGroup, {
    validate: (values) => {
      schema.parse(values);
    },
    ...options,
  });
}
