// ReusableRadio.jsx

import * as React from 'react'
import { FormControl, FormControlLabel, Radio, RadioGroup, FormHelperText, Button, Box, InputLabel } from '@mui/material'
import { useController } from 'react-hook-form'
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import { Label } from '@mui/icons-material';

interface Option {
  label: string
  value: string
}

interface RHFRadioProps {
  control: any // You can replace `any` with a more specific type if available
  name: string
  label: string
  radio_label: string
  options: Option[]
  onChange?: (value: string) => void
  rows?: boolean
  button_label?: string
  addbtn?: boolean
  disabled?: boolean
  mandatory?: boolean
  radiolable?: boolean
}

const RHFRadio: React.FC<RHFRadioProps> = ({
  control,
  name,
  label,
  radio_label,
  options,
  addbtn = false,
  button_label,
  onChange,
  rows = false,
  disabled,
  radiolable,
  mandatory = false,
  ...rest
}) => {
  const {
    field: { value, onChange: onFieldChange },
    fieldState: { invalid, error }
  } = useController({
    name,
    control,
    defaultValue: ''
  })

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFieldChange(event)
    if (onChange) {
      onChange(event.target.value)
    }
  }
  const headerCss = { ...rest }

  return (
    <>
      <Box {...headerCss}>
     
        <label style={{ marginTop: '12px' }}>
          {radio_label}
          {mandatory && <span style={{ color: 'red' }}>*</span>}
        </label>
        <FormControl component='fieldset' error={invalid} style={{ display: 'flex', color: '#919EAB' }}>
          <RadioGroup aria-label={label} name={name} value={value} onChange={handleChange} row={rows}>
            {options.map(option => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
                disabled={disabled}
              />
            ))}
          </RadioGroup>
          <FormHelperText>{error ? error.message : ''}</FormHelperText>
        </FormControl>

        {addbtn && (<Button sx={{ textTransform: 'none !important', pl: 0 }}><ControlPointIcon style={{ marginRight: '3px' }} />{button_label}</Button>)}
      </Box>
    </>
  )
}

export default RHFRadio
