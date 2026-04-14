import * as React from 'react';
import { TextField } from '@mui/material';
import { Controller, useController } from 'react-hook-form';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import dayjs from "dayjs";

const RHFDatePicker = ({ control, name, label, mandatory, disablePast, ...rest }) => {
  const currentYear = dayjs().year();

  const {
    field: { value, onChange },
    fieldState: { invalid, error },
  } = useController({
    name,
    control,
    defaultValue: '',
    rules: {
      validate: (value) => {
        if (value) {
          const date = dayjs(value);
          const isValidMonth = date.month() <= 11; // Months are 0-indexed in dayjs
          const isValidDate = date.date() <= 31;
          const isValidYear = date.year() <= currentYear;
          if (!isValidMonth) {
            return "Month must be 12 or less";
          }
          if (!isValidDate) {
            return "Date must be 31 or less";
          }
          if (!isValidYear) {
            return `Year must be ${currentYear} or less`;
          }
        }
        return true;
      }
    }
  });

  return (
    <>
      <label style={{ marginTop: '12px' }}>
        {label}
        {mandatory && <span style={{ color: 'red' }}>*</span>}
      </label>
      <br />
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker
                {...rest}
                inputFormat='DD/MM/YYYY'
                disablePast={disablePast}
                value={value ? dayjs(value, 'YYYY/MM/DD') : null}
                onChange={(date) => onChange(date ? dayjs(date).format('YYYY/MM/DD') : null)}
                renderInput={(props) => <TextField {...props} fullWidth size='small' error={invalid} helperText={error?.message} />}
              />
            </LocalizationProvider>
          </>
        )}
      />
    </>
  );
};

export default RHFDatePicker;
