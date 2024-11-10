// components/FormikTextField.jsx
import React from 'react';
import { useField } from 'formik';
import { OutlinedInput, InputLabel, FormHelperText, Stack } from '@mui/material';

const FormikTextField = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  return (
    <Stack spacing={1}>
      <InputLabel htmlFor={props.id || props.name}>{label}</InputLabel>
      <OutlinedInput
        {...field}
        {...props}
        error={Boolean(meta.touched && meta.error)}
      />
      {meta.touched && meta.error && (
        <FormHelperText error>{meta.error}</FormHelperText>
      )}
    </Stack>
  );
};

export default FormikTextField;
