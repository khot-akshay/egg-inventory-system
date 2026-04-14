import * as React from 'react';
import { Autocomplete, TextField, Button, Box, InputLabel, Typography } from '@mui/material';
import { useController } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import ControlPointIcon from '@mui/icons-material/ControlPoint';

interface RHFAutoCompleteProps {
  control: any;
  name: string;
  options: any[];
  placeholder?: string;
  resetApiFunction?: () => void;
  label?: string
  button_label?: string
  addbtn?: boolean
  mandatory?: boolean
  label_header?: string
  onClick?: () => void
  defaultValue?: any
  loading?: boolean
  onScrollToEnd?: () => void
  onChange?: (value: any) => void
  multiple?: boolean
  labelKey?: string
  valueKey?: string
}

const RHFAutoComplete2: React.FC<RHFAutoCompleteProps> = ({
  control,
  name,
  options,
  placeholder,
  resetApiFunction,
  label,
  button_label,
  mandatory,
  label_header,
  addbtn,
  onClick,
  defaultValue,
  multiple = false,
  labelKey = 'label',
  valueKey = 'value',
  ...rest
}) => {
  const {
    field: { value, onChange: fieldOnChange },
    fieldState: { invalid, error },
  } = useController({
    name,
    control,
    defaultValue: defaultValue || (multiple ? [] : ''),
  });

  const getSelectedValue = () => {
    if (multiple) {
      const values = Array.isArray(value) ? value : [];
      return options.filter(opt => values.includes(opt[valueKey]));
    }
    return options.find(opt => opt[valueKey] === value) || null;
  };

  return (
    <>
      <Box >
        <Typography className="input-label">
          {label}{mandatory && <span style={{ color: 'red' }}>*</span>}
        </Typography>

        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Autocomplete
              {...rest}
              multiple={multiple}
              options={options}
              getOptionLabel={(option: any) => option?.[labelKey] ?? ''}
              isOptionEqualToValue={(option, val) => option?.[valueKey] === val?.[valueKey]}
              value={getSelectedValue()}
              onChange={(event, selectedValue) => {
                const newValue = multiple
                  ? (selectedValue as any[]).map(v => v[valueKey])
                  : (selectedValue ? (selectedValue as any)[valueKey] : '');
                fieldOnChange(newValue);
                if (rest.onChange) {
                  rest.onChange(newValue);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  placeholder={placeholder}
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
          )}
        />
        {addbtn && (<Button onClick={onClick} sx={{ textTransform: 'none !important', pl: 0 }}><ControlPointIcon style={{ marginRight: '3px' }} />{button_label}</Button>)}
      </Box>
    </>
  );
};

export default RHFAutoComplete2;
