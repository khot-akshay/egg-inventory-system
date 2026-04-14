import { InputAdornment, TextField, IconButton } from '@mui/material'
import React, { useRef, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'

interface Props {
  handleSearch: (query: string) => void
  placeHolder?: string
}

function SearchInput({ handleSearch, placeHolder }: Props) {
  const debouncedFetchData = useRef<NodeJS.Timeout | null>(null)
  const [value, setValue] = useState('')

  const handleSearchData = (query: string) => {
    setValue(query)

    if (debouncedFetchData.current) {
      clearTimeout(debouncedFetchData.current)
    }

    debouncedFetchData.current = setTimeout(() => {
      handleSearch(query)
    }, 500)
  }

  const handleClear = () => {
    setValue('')
    handleSearch('')

    if (debouncedFetchData.current) {
      clearTimeout(debouncedFetchData.current)
    }
  }

  return (
    <TextField
      variant="outlined"
      size="small"
      value={value}
      onChange={(e) => handleSearchData(e.target.value)}
      placeholder={placeHolder ?? 'Search'}
      fullWidth
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: value && (
          <InputAdornment position="end">
            <IconButton size="small" onClick={handleClear}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        )
      }}
    />
  )
}

export default SearchInput
