export const composables = {
  useI18n: {
    translateFormError: {
      validations: {
        missing: 'This field is mandatory',
        string_too_short: 'Please enter at least {min_length} character(s)',
        string_too_long: 'Please enter no more than {max_length} character(s)',
        string_type: 'Please enter valid text',
        int_parsing: 'Please enter a valid integer',
        float_parsing: 'Please enter a valid number',
        bool_parsing: 'Please enter a valid boolean',
        enum: 'Please choose one of: {expected}',
        fields: {
          title: {
            unique: 'Title must be unique for the user',
          },
        },
      },
    },
  },
}
