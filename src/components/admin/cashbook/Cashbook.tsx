import { Box, Button, Card, Grid, Typography, Stack, TextField, Autocomplete, CircularProgress } from '@mui/material'
import { GridCellParams, GridColDef } from '@mui/x-data-grid'
import React, { useEffect, useState } from 'react'
import CommonDatagrid from 'src/components/common/DatagridData.tsx/CommonDatagrid'
import dayjs from 'dayjs'

import GoBack from 'src/components/common/goBack/GoBackButton';
import axiosInstance from 'src/services/axios'
import DateFormateComponent from 'src/components/common/dateFormat/DateFromatModule';
import SearchInput from 'src/components/common/SearchInput';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import AddManulyEntry from './AddManulyEntry';
import CashBookReportAdapter from './CashBookReportAdapter';

interface Shop {
  id: number
  uuid: string
  code: string
  name: string
  address_line1: string | null
  city: string | null
  phone: string | null
  timezone: string
  settings: any
  egg_price_min: number | null
  egg_price_max: number | null
  egg_price_unit: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface User {
  id: number
  uuid: string
  name: string
  email: string
  phone: string
  shop_id: number | null
  supplier_id: number | null
  is_active: boolean
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

interface CashbookEntry {
  id: number
  uuid: string
  shop_id: number
  user_id: number
  vendor_id: number | null
  entry_date: string
  direction: 'in' | 'out'
  method: string
  amount: string
  party_type: string
  source_type: string
  source_id: number
  description: string
  created_by: number
  meta: any
  created_at: string
  updated_at: string
  shop: Shop
  user: User
  vendor: any
  creator: User
  [key: string]: any
}

const Cashbook = () => {
  const [rows, setRows] = useState<CashbookEntry[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(0)
  const [searchQuery, setQuery] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [totalAmounts, setTotalAmounts] = useState<any>(null);
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedShop, setSelectedShop] = useState<any>(null)
  const [shops, setShops] = useState<any[]>([])
  const [shopsLoading, setShopsLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [selectedDirection, setSelectedDirection] = useState<string>('')
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [selectedPartyType, setSelectedPartyType] = useState<string>('')

  // Fetch shops for filter
  const fetchShops = async () => {
    setShopsLoading(true)
    try {
      const response = await axiosInstance.get('/api/v1/admin/getAllShops')
      let shopsData = response.data.data?.shops || []
      // Ensure shopsData is always an array
      if (!Array.isArray(shopsData)) {
        shopsData = []
      }
      setShops(shopsData)
    } catch (e) {
      console.error('Failed to fetch shops', e)
      setShops([]) // Set empty array on error
    } finally {
      setShopsLoading(false)
    }
  }

  // Fetch users for filter
  const fetchUsers = async () => {
    setUsersLoading(true)
    try {
      const response = await axiosInstance.get('/api/v1/admin/getAllUsers')
      let usersData = response.data.data?.users || response.data.data || []
      // Ensure usersData is always an array
      if (!Array.isArray(usersData)) {
        usersData = []
      }
      setUsers(usersData)
    } catch (e) {
      console.error('Failed to fetch users', e)
      setUsers([]) // Set empty array on error
    } finally {
      setUsersLoading(false)
    }
  }

  // Fetch shops and users on mount
  useEffect(() => {
    fetchShops()
    fetchUsers()
  }, [])

  const fetchGame = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        pageNo: String(page),
        limit: String(pageSize)
      })

      if (searchQuery) params.append('global_search', searchQuery)
      if (startDate) params.append('from', startDate)
      if (endDate) params.append('to', endDate)
      if (selectedShop && selectedShop.id) params.append('shop_id', String(selectedShop.id))
      if (selectedUser && selectedUser.id) params.append('user_id', String(selectedUser.id))
      if (selectedDirection) params.append('direction', selectedDirection)
      if (selectedMethod) params.append('method', selectedMethod)
      if (selectedPartyType) params.append('party_type', selectedPartyType)

      const response = await axiosInstance.get(
        `/api/v1/admin/getCashbookEntries?${params.toString()}`
      )

      setRows(response.data.data?.entries ?? [])
      setTotalRows(response.data.data?.count ?? 0)
    } catch (e) {
      } finally {
      setLoading(false)
    }
  }

  const fetchTotalAmounts = async () => {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('from', startDate)
      if (endDate) params.append('to', endDate)
      if (selectedShop && selectedShop.id) params.append('shop_id', String(selectedShop.id))
      if (selectedUser && selectedUser.id) params.append('user_id', String(selectedUser.id))
      if (selectedDirection) params.append('direction', selectedDirection)
      if (selectedMethod) params.append('method', selectedMethod)
      if (selectedPartyType) params.append('party_type', selectedPartyType)
      
      const response = await axiosInstance.get(`/api/v1/admin/getCashbookTotalAmount?${params.toString()}`)
      setTotalAmounts(response.data.data.totalAmount)
    } catch (e) {
      console.error('Failed to fetch total amounts', e)
    }
  }

  // Reset page when search, date, shop, user, or direction changes
  useEffect(() => {
    setPage(0)
  }, [searchQuery, startDate, endDate, selectedShop, selectedUser, selectedDirection, selectedMethod, selectedPartyType])

  // Fetch data
  useEffect(() => {
    fetchGame()
  }, [page, pageSize, searchQuery, startDate, endDate, selectedShop, selectedUser, selectedDirection, selectedMethod, selectedPartyType])

  // Fetch total amounts on mount and when dates, shop, user, or direction change
  useEffect(() => {
    fetchTotalAmounts()
  }, [startDate, endDate, selectedShop, selectedUser, selectedDirection, selectedMethod, selectedPartyType])







  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
  }
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Sr. No.',
      flex: 1,
      minWidth: 100,
      sortable: false,
      renderCell: index => {
        const rowIndex = index.api.getRowIndex(index.row.id)
        return page * pageSize + (rowIndex % pageSize) + 1
      },
      hideable: false
    },
    {
      field: 'shop.name',
      headerName: 'Shop Name',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
        {params.row?.shop?.name || 'NA'}
      </div>
    },
    {
      field: 'user.name',
      headerName: 'User Name',
      flex: 1,
      minWidth: 180,
      sortable: false,
      renderCell: (params: GridCellParams) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
        {params.row?.user?.name || 'NA'}
      </div>
    },
    {
      field: 'direction',
      headerName: 'Direction',
      flex: 1,
      minWidth: 100,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div style={{ 
          whiteSpace: 'normal', 
          wordBreak: 'break-word', 
          lineHeight: 1.5,
          color: params.row?.direction === 'in' ? 'success.main' : 'error.main',
          fontWeight: 'bold'
        }}>
          {params.row?.direction?.toUpperCase() || 'NA'}
        </div>
      )
    },
    {
      field: 'method',
      headerName: 'Method',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params: GridCellParams) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
        {params.row?.method || 'NA'}
      </div>
    },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params: GridCellParams) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
        ₹ {Math.floor(Number(params.row?.amount || 0))}
      </div>
    },
    {
      field: 'party_type',
      headerName: 'Party Type',
      flex: 1,
      minWidth: 130,
      sortable: false,
      renderCell: (params: GridCellParams) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
        {params.row?.party_type || 'NA'}
      </div>
    },
    // {
    //   field: 'description',
    //   headerName: 'Description',
    //   flex: 1,
    //   minWidth: 200,
    //   sortable: false,
    //   renderCell: (params: GridCellParams) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
    //     {params.row?.description || 'NA'}
    //   </div>
    // },
    {
      field: 'entry_date',
      headerName: 'Entry Date',
      flex: 1,
      minWidth: 180,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <DateFormateComponent date={params.row?.entry_date ?? ''} />
      )
    },
    {
      field: 'created_at',
      headerName: 'Created Date',
      flex: 1,
      minWidth: 180,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <DateFormateComponent date={params.row?.created_at ?? ''} />
      )
    },
  ]
  const handleSearch = (query: string) => {
    setPage(0)
    setQuery(query);
  };

  return (
    <>
      {/* Total Amounts Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold">Total Amount</Typography>
            <Typography variant="h4" fontWeight="bold">₹ {Math.floor(Number(totalAmounts?.total || 0))}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold">Total Cash</Typography>
            <Typography variant="h4" fontWeight="bold">₹ {Math.floor(Number(totalAmounts?.cash || 0))}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold">Total Online</Typography>
            <Typography variant="h4" fontWeight="bold">₹ {Math.floor(Number(totalAmounts?.online || 0))}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold">Total Card</Typography>
            <Typography variant="h4" fontWeight="bold">₹ {Math.floor(Number(totalAmounts?.card || 0))}</Typography>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 5 }}>
        <Grid container spacing={3} >
          <Grid item xs={12} md={9}>
            <GoBack label="Cashbook" isBack={false} />

          </Grid>
          <Grid item xs={12} md={3} align="right">
          <CashBookReportAdapter searchQuery={searchQuery} rowsPerPage={pageSize} startDate={startDate} endDate={endDate} selectedShop={selectedShop} selectedUser={selectedUser} selectedDirection={selectedDirection} selectedMethod={selectedMethod} selectedPartyType={selectedPartyType} />
              <Button onClick={() => setOpenAdd(true)} variant='contained'>
                Add Entry <AddCircleOutlineIcon sx={{ ml: 1 }} />
              </Button>
          </Grid>
  <Grid item xs={12} sm="auto">
              <Autocomplete
                size="small"
                options={shops}
                getOptionLabel={(option) => option?.name || ''}
                value={selectedShop}
                onChange={(_, newValue) => setSelectedShop(newValue)}
                loading={shopsLoading}
                sx={{ minWidth: 200 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Shop Name"
                    placeholder="Select Shop"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {shopsLoading ? <CircularProgress size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm="auto">
              <Autocomplete
                size="small"
                options={users}
                getOptionLabel={(option) => option?.name || ''}
                value={selectedUser}
                onChange={(_, newValue) => setSelectedUser(newValue)}
                loading={usersLoading}
                sx={{ minWidth: 200 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="User Name"
                    placeholder="Select User"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {usersLoading ? <CircularProgress size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm="auto">
              <Autocomplete
                size="small"
                options={[{ label: 'All', value: '' }, { label: 'In', value: 'in' }, { label: 'Out', value: 'out' }]}
                getOptionLabel={(option) => option.label}
                value={selectedDirection ? { label: selectedDirection === 'in' ? 'In' : 'Out', value: selectedDirection } : { label: 'All', value: '' }}
                onChange={(_, newValue) => setSelectedDirection(newValue?.value || '')}
                sx={{ minWidth: 150 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Direction"
                    placeholder="Select Direction"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm="auto">
              <Autocomplete
                size="small"
                options={[{ label: 'All', value: '' }, { label: 'Cash', value: 'cash' }, { label: 'Online', value: 'online' }, { label: 'Card', value: 'card' }]}
                getOptionLabel={(option) => option.label}
                value={selectedMethod ? { label: selectedMethod, value: selectedMethod } : { label: 'All', value: '' }}
                onChange={(_, newValue) => setSelectedMethod(newValue?.value || '')}
                sx={{ minWidth: 150 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Method"
                    placeholder="Select Method"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm="auto">
              <Autocomplete
                size="small"
                options={[{ label: 'All', value: '' }, { label: 'Shop', value: 'shop' }, { label: 'Distributor', value: 'distributor' }, { label: 'Vendor', value: 'vendor' }, { label: 'Manual', value: 'manual' }]}
                getOptionLabel={(option) => option.label}
                value={selectedPartyType ? { label: selectedPartyType.charAt(0).toUpperCase() + selectedPartyType.slice(1), value: selectedPartyType } : { label: 'All', value: '' }}
                onChange={(_, newValue) => setSelectedPartyType(newValue?.value || '')}
                sx={{ minWidth: 150 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Party Type"
                    placeholder="Select Party Type"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm="auto">
              <Grid container spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }} alignItems="center">
                <Grid item>
                  <TextField
                    label="Start Date"
                    type="date"
                    size="small"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 160 }}
                  />
                </Grid>
                <Grid item>
                  <TextField
                    label="End Date"
                    type="date"
                    size="small"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: startDate }}
                    sx={{ minWidth: 160 }}
                  />
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    // size="small"
                onClick={() => {
                      setStartDate('')
                      setEndDate('')
                      // setSelectedShop(null)
                      // setSelectedUser(null)
                      // setSelectedDirection('')
                      // setSelectedMethod('')
                      // setSelectedPartyType('')
                    }}
                  >
                    Reset
                  </Button>
                </Grid>
              </Grid>
            </Grid>
        </Grid>
       
        <CommonDatagrid
          totalRows={totalRows}
          pageSize={pageSize}
          currentPage={page}
          handleChangePage={handlePageChange}
          handleChangeRowsPerPage={handlePageSizeChange}
          columns={columns}
          rows={rows}
          checkboxSelection={false}
          loading={loading}
        />
      </Card>
      {openAdd && <AddManulyEntry open={openAdd} handleClose={() => setOpenAdd(false)} fetchData={fetchGame} />}
    </>
  )
}

export default Cashbook
