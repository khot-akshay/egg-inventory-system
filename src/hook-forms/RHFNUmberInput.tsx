import * as React from 'react'
import { TextField, InputAdornment } from '@mui/material'
import { useController } from 'react-hook-form'

interface RHFNumberInputProps {
  control: any // Replace 'any' with the actual type of 'control'
  name: string
  label: string
  placeholder?: string
  prefix?: string
  suffix?: string
  decimalScale?: number
  disabled?: boolean
  min?: number
  max?: number
  mandatory?:boolean
}

const RHFNumberInput: React.FC<RHFNumberInputProps> = ({
                                                         control,
                                                         name,
                                                         label,
                                                         placeholder,
                                                         prefix,
                                                         suffix,
                                                         disabled,
                                                         min,
                                                         max,
                                                         mandatory
                                                       }) => {
  const {
    field: { value, onChange },
    fieldState: { invalid, error }
  } = useController({
    name,
    control,
    defaultValue: ''
  })

  return (
    <div>
      <label>{label}{mandatory && <span style={{ color: 'red' }}>*</span>}</label>
    <TextField
  fullWidth
  size="small"
  type="number"
  value={value}
  onChange={onChange}
  error={invalid}
  placeholder={placeholder || label}
  disabled={disabled}
  helperText={error ? error.message : ''}
  inputProps={{
    min: min !== undefined ? min : undefined,
      max: max !== undefined ? max : undefined,
    // Allows decimal input
  }}
  InputProps={{
    startAdornment: prefix ? <InputAdornment position="start">{prefix}</InputAdornment> : null,
      endAdornment: suffix ? <InputAdornment position="end">{suffix}</InputAdornment> : null
  }}
  />
  </div>
)
}

export default RHFNumberInput
