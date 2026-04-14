import * as React from 'react';
import { TextField } from '@mui/material';
import { Controller, useController } from 'react-hook-form';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDateTimePicker } from '@mui/x-date-pickers/DesktopDateTimePicker';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'; // Import the UTC plugin
import 'dayjs/locale/en-gb'; // Import locale if needed

dayjs.extend(utc); // Extend dayjs with UTC plugin

const RHFTimeAndDate = ({ control, name, label, mandatory, ...rest }) => {
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
          const date = dayjs.utc(value); // Use UTC
          const isValidMonth = date.month() <= 11; // Months are 0-indexed in dayjs
          const isValidDate = date.date() <= 31;
          const isValidYear = date.year() <= currentYear;
          if (!isValidMonth) {
            return 'Month must be 12 or less';
          }
          if (!isValidDate) {
            return 'Date must be 31 or less';
          }
          if (!isValidYear) {
            return `Year must be ${currentYear} or less`;
          }
        }
        return true;
      },
    },
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
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DesktopDateTimePicker
              {...rest}
              value={value ? dayjs.utc(value) : null} // Use UTC
              onChange={(date) => onChange(date ? date.toDate() : null)} // Convert to UTC
              renderInput={(props) => (
                <TextField
                  {...props}
                  fullWidth
                  size="small"
                  error={invalid}
                  helperText={error?.message}
                  InputProps={{
                    ...props.InputProps,
                    readOnly: true, // Prevent direct typing
                    endAdornment: (
                      <React.Fragment>
                        {props.InputProps.endAdornment}
                      </React.Fragment>
                    ),
                  }}
                />
              )}
              ampm={false} // Use 24-hour format
              minutesStep={1} // Sets the minute interval to every minute
              secondsStep={1} // Sets the second interval to every second
              format="YYYY-MM-DD HH:mm:ss" // Date and time format
            />
          </LocalizationProvider>
        )}
      />
    </>
  );
};

export default RHFTimeAndDate;
