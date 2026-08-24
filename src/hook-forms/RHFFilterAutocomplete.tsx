import React from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';

interface RHFFilterAutocompleteProps<T = any> {
  options: T[];
  value: T | null;
  onChange: (value: T | null) => void;
  loading?: boolean;
  label?: string;
  placeholder?: string;
  labelKey?: keyof T | ((option: T) => string);
  size?: 'small' | 'medium';
  minWidth?: number | string;
  disabled?: boolean;
}

function RHFFilterAutocomplete<T = any>({
  options,
  value,
  onChange,
  loading = false,
  label = '',
  placeholder = 'Select...',
  labelKey = 'name' as keyof T,
  size = 'small',
  minWidth = 150,
  disabled = false,
}: RHFFilterAutocompleteProps<T>) {
  const getLabel = (option: T): string => {
    if (typeof labelKey === 'function') return labelKey(option);
    return (option as any)?.[labelKey] || '';
  };

  return (
    <Autocomplete
      size={size}
      options={options}
      getOptionLabel={getLabel}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      loading={loading}
      disabled={disabled}
      sx={{ minWidth }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}

export default RHFFilterAutocomplete;
