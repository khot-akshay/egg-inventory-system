import React, { useState, useEffect, useCallback } from 'react';
import {
  Autocomplete,
  TextField,
} from '@mui/material';
import { get } from 'src/services/apiCall';

interface Organization {
  id: string;
  name: string;
}

interface OrganizationSelectProps {
  value: string | null;
  onChange: (value: string | null, org?: Organization | null) => void;
  label?: string;
  placeholder?: string;
}

const OrganizationSelect: React.FC<OrganizationSelectProps> = ({
  value,
  onChange,
  label = 'Organization',
  placeholder = 'Search organizations...',
}) => {
  const [options, setOptions] = useState<Organization[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;

  const fetchOrganizations = async (pageNo = 0, searchText = '') => {
    setLoading(true);
    try {
      let url = `/api/v1/admin/getAllOrganizations?pageNo=${pageNo}&limit=${pageSize}`;
      if (searchText) url += `&name=${searchText}`;
      const res = await get(url);
      if (res.success) {
        const newData = res.data.organizations || [];
        setOptions((prev) =>
          pageNo === 0 ? newData : [...prev, ...newData]
        );
        setHasMore(newData.length === pageSize);
      }
    } catch (err) {
      } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchOrganizations(0, search);
  }, [search]);

  const handleScroll = useCallback(
    (event: React.SyntheticEvent) => {
      const listboxNode = event.currentTarget;
      const isBottom =
        listboxNode.scrollHeight - listboxNode.scrollTop <=
        listboxNode.clientHeight + 1;

      if (isBottom && hasMore && !loading) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchOrganizations(nextPage, search);
      }
    },
    [hasMore, loading, page, search]
  );

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.name}
      onInputChange={(event, newValue) => {
        setSearch(newValue);
      }}
      value={options.find((opt) => opt.id === value) || null}
      onChange={(event, newValue) => {
        onChange(newValue ? newValue.id : null, newValue || null);
      }}
      loading={loading}
      renderInput={(params) => (
        <TextField {...params} label={label} placeholder={placeholder} />
      )}
      ListboxProps={{
        onScroll: handleScroll,
        style: { maxHeight: 250, overflow: 'auto' },
      }}
    />
  );
};

export default OrganizationSelect;
