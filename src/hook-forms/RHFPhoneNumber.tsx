// PhoneInputField.js
import React, { useEffect, useState } from 'react'
// controller
import { useController } from 'react-hook-form'
import { Controller } from 'react-hook-form'
// react-phone-number-input
import PhoneInputWithCountry from 'react-phone-number-input/react-hook-form'
import { isValidPhoneNumber } from 'react-phone-number-input'
// style
import 'react-phone-number-input/style.css'
import { Box, InputLabel } from '@mui/material'
import axios from 'axios'
import { useSettings } from 'src/@core/hooks/useSettings'
import { validationNumber } from 'src/utils/validateNumber'

// ---------------------------------------------------------------------------------

interface RHFPhoneNumberProps {
  name: string
  control: any
  label: string
  mandatory: boolean
  disabled?: boolean
}

const RHFPhoneNumber: React.FC<RHFPhoneNumberProps> = ({ name, control, mandatory, label,disabled, ...rest }) => {
  const {
    field: { value, onChange },
    fieldState: { invalid, error }
  } = useController({
    name,
    control,
    defaultValue: ''
  })
  const {settings} = useSettings()
  const boxCss = { ...rest }
  const [defaultCountry, setDefaultCountry] = useState('IN')
  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const response = await axios.get('https://ipapi.co/json/')
        setDefaultCountry(response.data.country_code || 'IN')
      } catch (error) {
        console.error('Error fetching user country:', error)
      }
    }

    fetchCountry()
  }, [])
  useEffect(() => {
    const phoneInput = document.querySelector(".PhoneInputInput") as HTMLInputElement;
    if (phoneInput) {
      phoneInput.style.backgroundColor = settings.mode=='dark' ? "#2b2c40f2" : "#fff"; 
      phoneInput.style.color = settings.mode =='dark' ? "#dbdbeb99" : "#32475cde"; 
    }
  }, [settings.mode]);
  return (
    <>
      <Box {...boxCss}>
        <label style={{ marginTop: '12px' }}>
          {label} {mandatory && <span style={{ color: 'red' }}>*</span>}
        </label>
        <Controller
          name={name}
          control={control}
          rules={{
            validate: value => isValidPhoneNumber(value)
          }}
          render={({ field: { onChange, value } }) => (
            <PhoneInputWithCountry
              name={name}
              control={control}
              onChange={onChange}
              disabled={disabled}
              defaultCountry={defaultCountry}
              withCountryCallingCode={false}
              style={{ padding: 7, border: (invalid || (value && !isValidPhoneNumber(value)|| value && !validationNumber(value))) ? '1px solid red' : '1px solid #ccc', borderRadius: 8, backgroundColor: 'none',  }}
              international
            />
          )}
        />
        {(invalid || (value && !isValidPhoneNumber(value) || value && !validationNumber(value)))&& (
          <span
            style={{
              fontSize: '0.75rem',
              color: '#FF3E1D',
              marginRight: '14px',
              marginLeft: '14px',
              fontWeight: 400,
              marginTop: '2px'
            }}
          >
            {error?.message || 'Invalid Phone Number'}
          </span>
        )}
      </Box>
    </>
  )
}

export default RHFPhoneNumber
