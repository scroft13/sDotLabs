import * as yup from 'yup';

yup.setLocale({
  mixed: {
    required: 'Please fill out this field',
    oneOf: 'Please pick one of the allowed options',
    notType: 'Please fill out this field',
  },
  string: {
    email: 'Please enter a valid email address',
  },
});

yup.addMethod(yup.string, 'password', function () {
  return this.test(`password`, function (value) {
    const { path, createError } = this;
    return (
      !value ||
      value?.length >= 5 ||
      createError({ path, message: 'Password must be greater than 5 characters' })
    );
  });
});

yup.addMethod(yup.string, 'slug', function () {
  return this.test(`slug`, function (value) {
    const { path, createError } = this;
    return (
      (value && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value)) ||
      createError({ path, message: 'Use lowercase letters, numbers, and hyphens only' })
    );
  });
});

export default yup;
