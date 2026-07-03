// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { StringSchema } from 'yup';

declare module 'yup' {
  interface StringSchema {
    password(): StringSchema;
    slug(): StringSchema;
  }
}
