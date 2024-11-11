// AuthRegister.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { 
  Grid, 
  Button, 
  InputAdornment, 
  IconButton, 
  Typography, 
  Box, 
  Stack, 
  InputLabel, OutlinedInput
} from '@mui/material';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

import AnimateButton from 'components/@extended/AnimateButton';
import FormikTextField from 'components/FormikTextField';
import useRegister from 'hooks/useRegister';
import { strengthColor, strengthIndicator } from 'utils/password-strength';

const AuthRegister = () => {
  const navigate = useNavigate();
  const {
    level,
    showPassword,
    handleClickShowPassword,
    handleMouseDownPassword,
    changePassword,
    registerUser
  } = useRegister(navigate);

  const initialValues = {
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    submit: null
  };

  const validationSchema = Yup.object().shape({
    firstname: Yup.string().max(255).required('Имя обязательно'),
    lastname: Yup.string().max(255).required('Фамилия обязательна'),
    email: Yup.string().email('Должен быть действительный email').max(255).required('Email обязателен'),
    password: Yup.string().max(255).required('Пароль обязателен')
  });

  const handleSubmit = (values, { setSubmitting, setErrors }) => {
    const displayName = `${values.firstname} ${values.lastname}`;
    registerUser(values.email, values.password, displayName, setSubmitting, setErrors);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, handleChange, handleBlur, isSubmitting, touched, values }) => (
        <Form noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormikTextField
                label="Имя*"
                id="firstname-signup"
                name="firstname"
                type="text"
                placeholder="Имя"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormikTextField
                label="Фамилия*"
                id="lastname-signup"
                name="lastname"
                type="text"
                placeholder="Фамилия"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <FormikTextField
                label="Email*"
                id="email-signup"
                name="email"
                type="email"
                placeholder="demo@company.com"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="password-signup">Пароль</InputLabel>
                <OutlinedInput
                  id="password-signup"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={values.password}
                  onChange={(e) => {
                    handleChange(e);
                    changePassword(e.target.value, strengthIndicator, strengthColor);
                  }}
                  onBlur={handleBlur}
                  placeholder="******"
                  fullWidth
                  error={Boolean(touched.password && errors.password)}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        color="secondary"
                      >
                        {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                {touched.password && errors.password && (
                  <FormHelperText error>{errors.password}</FormHelperText>
                )}
              </Stack>
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Box 
                      sx={{ 
                        bgcolor: level?.color, 
                        width: 85, 
                        height: 8, 
                        borderRadius: '7px' 
                      }} 
                    />
                  </Grid>
                  <Grid item>
                    <Typography variant="subtitle1" fontSize="0.75rem">
                      {level?.label}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <AnimateButton>
                <Button
                  disableElevation
                  disabled={isSubmitting}
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Зарегистрироваться
                </Button>
              </AnimateButton>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export default AuthRegister;
