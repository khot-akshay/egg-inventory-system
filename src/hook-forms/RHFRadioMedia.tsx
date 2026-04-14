import * as React from 'react'
import { FormControl, FormControlLabel, Radio, RadioGroup, FormHelperText, Button, Box, InputLabel, Input } from '@mui/material'
import { useController } from 'react-hook-form'
import ControlPointIcon from '@mui/icons-material/ControlPoint';

interface Option {
  label: string
  value: string
  imgSrc?: string
  videoSrc?: string
}

interface RHFRadioMediaProps {
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
}

const RHFRadioMedia: React.FC<RHFRadioMediaProps> = ({
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Handle image upload logic here
  }

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Handle video upload logic here
  }

  const headerCss = { ...rest }

  return (
    <>
      <Box {...headerCss}>
        {radio_label && (
          <InputLabel style={{ marginTop: '12px' }}>
            {radio_label} {mandatory && <span style={{ color: 'red' }}>*</span>}
          </InputLabel>
        )}
        <FormControl component='fieldset' error={invalid} style={{ display: 'flex', color: '#919EAB' }}>
          <RadioGroup aria-label={label} name={name} value={value} onChange={handleChange} row={rows}>
            {options?.map(option => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={
                  <>
                    {option.imgSrc && <img src={option.imgSrc} alt={option.label} style={{ marginRight: '8px', width: '50px', height: '50px' }} />}
                    {option.videoSrc && <video src={option.videoSrc} controls style={{ marginRight: '8px', width: '50px', height: '50px' }} />}
                    {option.label}
                  </>
                }
                disabled={disabled}
              />
            ))}
          </RadioGroup>
          <FormHelperText>{error ? error.message : ''}</FormHelperText>
        </FormControl>
        {addbtn && (
          <Button sx={{ textTransform: 'none !important', pl: 0 }}>
            <ControlPointIcon style={{ marginRight: '3px' }} />
            {button_label}
          </Button>
        )}
        <input type="file" accept="image/*" onChange={handleImageUpload} /> // Add this for image upload
        <input type="file" accept="video/*" onChange={handleVideoUpload} /> // Add this for video upload
      </Box>
    </>
  )
}

export default RHFRadioMedia
