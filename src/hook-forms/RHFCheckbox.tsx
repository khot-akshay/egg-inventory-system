import * as React from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import { useController } from 'react-hook-form';

const RHFCheckbox = ({ control, name, label,defaultValue, ...rest }) => {
  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { invalid, error },
  } = useController({
    name,
    control,
    defaultValue,
  });

  return (
    <>
      <FormControlLabel sx={{fontSize:{xs:'14px',lg:'16px'}}}
        control={<Checkbox {...rest}  checked={value} onChange={onChange} onBlur={onBlur} inputRef={ref}  />} label={label}
      />
      {invalid && <FormHelperText error>{error?.message}</FormHelperText>}
    </>
  );
};

export default RHFCheckbox;
