import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Autocomplete, TextField, CircularProgress, Typography, Button, Box, Paper } from '@mui/material';
import { useController } from 'react-hook-form';
import { useDebounce } from 'use-debounce';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import axiosInstance from 'src/services/axios';

// In‑memory cache shared across all RHFAutoComplete instances.
// cacheKey => searchText => { options, fetchedPages: Set<number>, hasMore }
const apiCache = new Map();

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
  extraParams = {},
  multiple = false,
  options: staticOptions = [],
  dataKey = '',
  returnObject = false,
  filterFunction,
  ...rest
}: {
  control: any;
  name: any;
  apiUrl?: any;
  labelKey?: any;
  valueKey?: any;
  placeholder: any;
  labelinput: any;
  required: any;
  pageParamName?: any;
  limitParamName?: any;
  queryParamName?: any;
  pageSize?: any;
  addbtn?: any;
  button_label?: any;
  handlebtnclick?: any;
  extraParams?: any;
  multiple?: any;
  options?: any[];
  dataKey?: any;
  returnObject?: any;
  filterFunction?: (item: any) => boolean;
  [key: string]: any;
}) => {
  // Helper to get nested values like "category.name"
  const getNestedValue = (obj: any, path: any) => {
    if (!obj || !path) return obj;
    return path.split('.').reduce((acc: any, part: any) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
  };

  const { field, fieldState } = useController({
    name,
    control,
    defaultValue: multiple ? [] : null,
  });

  // ---------- Cache handling ----------
  const cacheKey = useMemo(() => `${apiUrl}|${JSON.stringify(extraParams)}`, [apiUrl, extraParams]);
  // Ensure a nested map exists for this cacheKey.
  if (!apiCache.has(cacheKey)) {
    apiCache.set(cacheKey, new Map());
  }
  const searchCache = apiCache.get(cacheKey);

  const [options, setOptions] = useState(() => {
    if (filterFunction && staticOptions.length > 0) {
      return staticOptions.filter(filterFunction);
    }
    return staticOptions;
  });
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const listboxRef = useRef<any>(null);
  const abortControllerRef = useRef<any>(null);
  const fetchedRef = useRef(false); // ensures initial fetch runs only once per component open.

  // ---------- Fetch logic with cache ----------
  const fetchOptions = useCallback(
    async (searchText = '', pageNo = 0) => {
      if (!apiUrl) return;

      // Check cache first.
      const cachedEntry = searchCache.get(searchText);
      if (cachedEntry && cachedEntry.fetchedPages.has(pageNo)) {
        // Use cached data and apply filter if provided.
        const cachedOptions = filterFunction ? cachedEntry.options.filter(filterFunction) : cachedEntry.options;
        setOptions(cachedOptions);
        setHasMore(cachedEntry.hasMore);
        return;
      }

      // Abort previous request if still pending.
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller as any;

      setLoading(true);
      try {
        const params = {
          [queryParamName]: searchText,
          [pageParamName]: pageNo,
          [limitParamName]: pageSize,
          ...extraParams,
        };
        const url = `${apiUrl}?${new URLSearchParams(params)}`;
        const res = await axiosInstance.get(url, { signal: controller.signal });
        let data = [];
        const responseData = res?.data;
        if (dataKey) {
          data = getNestedValue(responseData, dataKey) || [];
        } else {
          data = res?.data?.data?.data;
          if (!Array.isArray(data)) {
            const nested = res?.data?.data;
            if (Array.isArray(nested)) {
              data = nested;
            } else if (nested && typeof nested === 'object') {
              const possibleArray = Object.values(nested).find(Array.isArray);
              data = possibleArray || [];
            } else {
              data = [];
            }
          }
        }

        // Apply filter function if provided before caching
        const filteredData = filterFunction ? data.filter(filterFunction) : data;

        // Update cache with filtered data.
        const entry = cachedEntry || { options: [], fetchedPages: new Set(), hasMore: true };
        if (pageNo === 0) {
          entry.options = filteredData;
        } else {
          entry.options = [...entry.options, ...filteredData];
        }
        entry.fetchedPages.add(pageNo);
        entry.hasMore = filteredData.length === pageSize;
        searchCache.set(searchText, entry);

        // Update component state.
        setOptions(entry.options);
        setHasMore(entry.hasMore);
      } catch (err: any) {
        if (err?.code !== 'ERR_CANCELED') {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    },
    // Dependencies are stable thanks to useMemo for cacheKey and JSON.stringify for extraParams.
    [apiUrl, pageSize, queryParamName, pageParamName, limitParamName, dataKey, searchCache, filterFunction]
  );

  // ---------- Effects ----------
  // Effect to load data when dropdown opens for the first time.
  useEffect(() => {
    if (open && !fetchedRef.current) {
      fetchedRef.current = true;
      setPage(0);
      fetchOptions(debouncedSearch, 0);
    }
  }, [open, debouncedSearch, fetchOptions, filterFunction]);

  // Effect for pagination when page number changes.
  useEffect(() => {
    if (!open || page === 0) return;
    fetchOptions(debouncedSearch, page);
  }, [page, open, debouncedSearch, fetchOptions]);

  // Effect for search debounce – reset pagination.
  useEffect(() => {
    if (!open) return;
    setPage(0);
    fetchOptions(debouncedSearch, 0);
  }, [debouncedSearch, open, fetchOptions]);

  // Cleanup: abort any pending request on unmount.
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  // Compute selected value for RHF.
  const selectedValue = useMemo(() => {
    if (multiple) {
      return (Array.isArray(field.value) ? field.value : [])
        .map(v => (typeof v === 'object' ? v : options.find(opt => getNestedValue(opt, valueKey) === v)))
        .filter(Boolean);
    }
    const simpleValue =
      typeof field.value === 'object' && field.value !== null
        ? getNestedValue(field.value, valueKey)
        : field.value;
    return (
      options.find(opt => getNestedValue(opt, valueKey) === simpleValue) ||
      (typeof field.value === 'object' ? field.value : null)
    );
  }, [field.value, options, multiple, valueKey]);

  // Scroll handler for infinite scroll.
  const handleScroll = (event: any) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    if (scrollTop + clientHeight >= scrollHeight - 10 && hasMore && !loading) {
      setPage(p => p + 1);
    }
  };

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
        filterOptions={(x: any) => x}
        isOptionEqualToValue={(o: any, v: any) => getNestedValue(o, valueKey) === getNestedValue(v, valueKey)}
        getOptionLabel={(o: any) => (typeof labelKey === 'function' ? labelKey(o) : getNestedValue(o, labelKey) || '')}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        onChange={(_, val: any) => {
          if (multiple) {
            field.onChange(val ? val.map((v: any) => (returnObject ? v : getNestedValue(v, valueKey))) : []);
          } else {
            field.onChange(val ? (returnObject ? val : getNestedValue(val, valueKey)) : null);
          }
        }}
        onInputChange={(_, val, reason) => {
          if (reason === 'input') setSearch(val);
          if (reason === 'clear') setSearch('');
        }}
        ListboxProps={{
          ref: listboxRef as any,
          onScroll: handleScroll,
          style: { maxHeight: 250, overflowY: 'auto' },
        } as any}
        PaperComponent={(props: any) => (
          <Paper {...props}>
            {props.children}
            {addbtn && (
              <Box sx={{ borderTop: '1px solid #E5E7EB', p: 1 }}>
                <Button onMouseDown={(e: any) => e.preventDefault()} onClick={handlebtnclick} sx={{ textTransform: 'none' }}>
                  <ControlPointIcon sx={{ mr: 1 }} />
                  {button_label || 'Add New'}
                </Button>
              </Box>
            )}
          </Paper>
        )}
        renderInput={(params: any) => (
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
              ),
            }}
          />
        )}
      />
    </>
  );
};

export default RHFAutoComplete;
