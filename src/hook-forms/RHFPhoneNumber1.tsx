import React from 'react'
import { useController } from 'react-hook-form'
import { Box, TextField } from '@mui/material'

interface RHFPhoneNumberProps {
  name: string
  control: any
  label: string
  mandatory: boolean
  disabled?: boolean
}

const RHFPhoneNumber1: React.FC<RHFPhoneNumberProps> = ({ name, control, mandatory, label, disabled }) => {
  const {
    field: { value, onChange },
    fieldState: { invalid, error }
  } = useController({
    name,
    control,
    defaultValue: ''
  })

  const validateMobile = (value: string) => /^[6-9]\d{9}$/.test(value)

  return (
    <Box mt={1}>
      <label>
        {label} {mandatory && <span style={{ color: 'red' }}>*</span>}
      </label>
      <TextField
        fullWidth
        size="small"
        placeholder="Enter 10-digit mobile number"
        value={value}
        onChange={(e) => {
          const newValue = e.target.value.replace(/\D/g, '').slice(0, 10)
          onChange(newValue)
        }}
        error={invalid || (value && !validateMobile(value))}
        helperText={
          (invalid || (value && !validateMobile(value))) ? 'Enter a valid 10-digit mobile number' : ''
        }
        inputProps={{ maxLength: 10 }}
        disabled={disabled}
      />
    </Box>
  )
}

export default RHFPhoneNumber1