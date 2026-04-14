import React from 'react';
import { TextField } from '@mui/material';
import { Controller, useController } from 'react-hook-form';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';

const RHFTimePicker = ({ control, name,  placeholder,label, mandatory, ...rest }) => {
  const {
    field: { value, onChange },
    fieldState: { invalid, error },
  } = useController({
    name,
    control,
    defaultValue: null, // Use null as defaultValue for times
  });

  const handleChange = (newValue) => {
    const formattedTime = newValue ? dayjs(newValue).format('HH:mm') : '';
    onChange(formattedTime);
  };

  return (
    <>
     <label style={{ marginTop: '12px' }}>
        {label}
        {mandatory && <span style={{ color: 'red' }}>*</span>}
      </label>
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <TimePicker
            {...rest}
            // label={placeholder}
            inputFormat="HH:mm"
            value={value ? dayjs(value, 'HH:mm') : null}
            onChange={(newValue) => handleChange(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                error={invalid} helperText={error?.message}
                size="small"
                // helperText={errors?.[name]?.message}
                // error={!!errors?.[name]}
                InputProps={{
                  ...params.InputProps,
                  inputProps: {
                    ...params.inputProps,
                    readOnly: true, // Disable keyboard typing
                  },
                }}
              />
            )}
          />
        </LocalizationProvider>
      )}
    />
    </>
  );
};

export default RHFTimePicker;
