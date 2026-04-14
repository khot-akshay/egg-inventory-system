import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Typography,
  Button,
  Box,
  Paper
} from '@mui/material'
import { useController } from 'react-hook-form'
import { useDebounce } from 'use-debounce'
import ControlPointIcon from '@mui/icons-material/ControlPoint'
import axiosInstance from 'src/services/axios'

const RHFAutoComplete = ({
  control,
  name,
  apiUrl,
  labelKey = 'name',
  valueKey = 'id',
  placeholder,
  labelinput,
  required,
  pageParamName = 'pageNo',
  limitParamName = 'limit',
  queryParamName = 'global_search',
  pageSize = 10,
  addbtn = false,
  button_label = '',
  handlebtnclick,
  extraParams = {},   // ✅ add this

  multiple = false,
  options: staticOptions = [],
  ...rest
}) => {
  const { field, fieldState } = useController({
    name,
    control,
    defaultValue: multiple ? [] : null
  })

  const [options, setOptions] = useState(staticOptions)

  // Sync static options if no apiUrl
  useEffect(() => {
    if (!apiUrl) {
      setOptions(staticOptions)
    }
  }, [staticOptions, apiUrl])
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search, 500)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const listboxRef = useRef(null)

  const fetchOptions = useCallback(
    async (searchText = '', pageNo = 0) => {
      if (!apiUrl) return

      setLoading(true)
      try {
        const params = {
          [queryParamName]: searchText,
          [pageParamName]: pageNo,
          [limitParamName]: pageSize,
          ...extraParams
        }

        const url = `${apiUrl}?${new URLSearchParams(params)}`
        const res = await axiosInstance.get(url)
        const data = res?.data?.data?.data || []

        setOptions(prev => (pageNo === 0 ? data : [...prev, ...data]))
        setHasMore(data.length === pageSize)
      } catch (err) {
        console.error('Autocomplete fetch error:', err)
      } finally {
        setLoading(false)
      }
    },
    [apiUrl, pageSize]
  )

  /* 🔍 Search debounce */
  useEffect(() => {
    if (!open) return
    setPage(0)
    fetchOptions(debouncedSearch, 0)
  }, [debouncedSearch, open, fetchOptions])

  /* 📜 Pagination */
  useEffect(() => {
    if (!open || page === 0) return
    fetchOptions(debouncedSearch, page)
  }, [page, open, debouncedSearch, fetchOptions])

  const handleScroll = event => {
    const { scrollTop, scrollHeight, clientHeight } = event.target
    if (scrollTop + clientHeight >= scrollHeight - 10 && hasMore && !loading) {
      setPage(p => p + 1)
    }
  }

  /* ✅ RHF stores ID → Autocomplete needs OBJECT */
  const selectedValue = multiple
    ? (Array.isArray(field.value) ? field.value : [])
      .map(v => (typeof v === 'object' ? v : options.find(opt => opt[valueKey] === v)))
      .filter(Boolean)
    : options.find(opt => opt[valueKey] === field.value) ||
    (typeof field.value === 'object' ? field.value : null)

  return (
    <>
      <Typography className="input-label">
        {labelinput}
        {required && <span style={{ color: 'red' }}>*</span>}
      </Typography>

      <Autocomplete
        {...rest}
        fullWidth
        size="small"
        multiple={multiple}
        open={open}
        value={selectedValue}
        options={options}
        loading={loading}
        filterOptions={x => x}
        isOptionEqualToValue={(o, v) => o?.[valueKey] === v?.[valueKey]}
        getOptionLabel={o => o?.[labelKey] ?? ''}
        onOpen={() => {
          setOpen(true)
          setPage(0)
          fetchOptions('', 0)
        }}
        onClose={() => setOpen(false)}
        onChange={(_, val) => {
          if (multiple) {
            field.onChange(val ? val.map(v => v[valueKey]) : [])
          } else {
            field.onChange(val ? val[valueKey] : null)
          }
        }}
        onInputChange={(_, val, reason) => {
          if (reason === 'input') setSearch(val)
          if (reason === 'clear') setSearch('')
        }}
        ListboxProps={{
          ref: listboxRef,
          onScroll: handleScroll,
          style: { maxHeight: 250, overflowY: 'auto' }
        }}
        PaperComponent={props => (
          <Paper {...props}>
            {props.children}
            {addbtn && (
              <Box sx={{ borderTop: '1px solid #E5E7EB', p: 1 }}>
                <Button
                  onMouseDown={e => e.preventDefault()}
                  onClick={handlebtnclick}
                  sx={{ textTransform: 'none' }}
                >
                  <ControlPointIcon sx={{ mr: 1 }} />
                  {button_label || 'Add New'}
                </Button>
              </Box>
            )}
          </Paper>
        )}
        renderInput={params => (
          <TextField
            {...params}
            placeholder={placeholder}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading && <CircularProgress size={18} />}
                  {params.InputProps.endAdornment}
                </>
              )
            }}
          />
        )}
      />
    </>
  )
}

export default RHFAutoComplete
