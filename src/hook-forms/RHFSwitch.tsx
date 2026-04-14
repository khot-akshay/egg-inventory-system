  import React from 'react';
  // react-hook-form
  import { useForm, SubmitHandler, Controller, useController } from 'react-hook-form';
  // @mui
  import { Switch, FormControlLabel, Box } from '@mui/material';

interface RHFSwitch {
    name: string;
    control: any;
}

  const RHFSwitch:  React.FC<RHFSwitch> = ({ name, control, ...rest }) => {
    const {
      field: { value, onChange },
      fieldState: { invalid, error },
  } = useController({
      name,
      control,
      defaultValue: '',
  });

    return (
      <>
        <Controller
          name={name}
          control={control}
          defaultValue={false}
          render={({ field }) => (
            <FormControlLabel
              control={<Switch checked={value} onChange={onChange} />}
              label=''
            />
          )}
        />
        {invalid && <span style={{ fontSize: '0.75rem', color: '#d32f2f', marginRight: '14px', marginLeft: '14px',  fontWeight: 400, marginTop: '3px' }}>{error?.message}</span>}
      </>
    );
  };

  export default RHFSwitch;
