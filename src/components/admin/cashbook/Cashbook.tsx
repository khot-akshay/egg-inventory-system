import { Box, Button, Card, Grid, Typography, Stack } from '@mui/material'
import { GridCellParams, GridColDef } from '@mui/x-data-grid'
import React, { useEffect, useState } from 'react'
import CommonDatagrid from 'src/components/common/DatagridData.tsx/CommonDatagrid'

import GoBack from 'src/components/common/goBack/GoBackButton';
import axiosInstance from 'src/services/axios'
import DateFormateComponent from 'src/components/common/dateFormat/DateFromatModule';
import SearchInput from 'src/components/common/SearchInput';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import AddManulyEntry from './AddManulyEntry';




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

  const fetchGame = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        pageNo: String(page),
        limit: String(pageSize)
      })

      if (searchQuery) params.append('global_search', searchQuery)

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
      const response = await axiosInstance.get('/api/v1/admin/getCashbookTotalAmount')
      setTotalAmounts(response.data.data.totalAmount)
    } catch (e) {
      console.error('Failed to fetch total amounts', e)
    }
  }

  // Reset page when search changes
  useEffect(() => {
    setPage(0)
  }, [searchQuery])

  // Fetch data
  useEffect(() => {
    fetchGame()
  }, [page, pageSize, searchQuery])

  // Fetch total amounts on mount
  useEffect(() => {
    fetchTotalAmounts()
  }, [])







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
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" sx={{ mb: 3 }}>

          {/* Left Side: Back Button and Title */}
          <Box display="flex" alignItems="center" gap={2}>
            <GoBack label="Cashbook" isBack={false} />
          </Box>

          {/* Right Side: Search */}
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <Grid item xs={12} sm="auto">
              <SearchInput handleSearch={handleSearch} placeHolder="Search..." />
            </Grid>
            <Grid item xs={12} sm="auto">
              <Button onClick={() => setOpenAdd(true)} variant='contained'>
                Add Entry <AddCircleOutlineIcon sx={{ ml: 1 }} />
              </Button>
            </Grid>
          </Box>

        </Box>
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
