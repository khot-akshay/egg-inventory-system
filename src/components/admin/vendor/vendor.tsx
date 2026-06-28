import { Box, Button, Card, Grid, IconButton, Stack, Switch, Tooltip, Typography } from '@mui/material'
import { GridCellParams, GridColDef } from '@mui/x-data-grid'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import CommonDatagrid from 'src/components/common/DatagridData.tsx/CommonDatagrid'
import GoBack from 'src/components/common/goBack/GoBackButton';
import axiosInstance from 'src/services/axios'
import Icon from 'src/@core/components/icon'
import DeleteDialogPopup from 'src/components/common/DeletePopup/DeleteModalPopup'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DateFormateComponent from 'src/components/common/dateFormat/DateFromatModule';
import SearchInput from 'src/components/common/SearchInput';
import toast from 'react-hot-toast';
import AddVendor from './AddVendor';
import { useRouter } from 'next/router';
import RHFAutoComplete from 'src/hook-forms/RHFAutoComplete';
import checkPermission from 'src/configs/CheckPermisstion'

interface VendorRow {
  id: number
  name: string
  phone: string
  email: string
  gstin: string
  address: string
  shop_id: number
  shop?: { name: string }
  is_active: boolean | number
  created_at: string
}

const Vendor = () => {
  const [rows, setRows] = useState<VendorRow[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(0)
  const [openAdd, setOpenAdd] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [selectedItem, setSelectedItem] = useState<VendorRow | null>(null)
  const [openEdit, setOpenEdit] = useState(false)
  const [searchQuery, setQuery] = useState("");
  const router = useRouter()
  
  const { control, watch } = useForm({
    defaultValues: {
      shop_id: null
    }
  })
  
  const selectedShopId = watch('shop_id') as number | null

  const fetchVendors = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        pageNo: String(page),
        limit: String(pageSize)
      })

      if (searchQuery) params.append('global_search', searchQuery)
      if (selectedShopId) params.append('shop_id', String(selectedShopId))

      const response = await axiosInstance.get(
        `/api/v1/admin/getAllVendors?${params.toString()}`
      )

      setRows(response.data.data?.vendors ?? [])
      setTotalRows(response.data.data?.count ?? 0)
    } catch (e) {
      } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(0)
  }, [selectedShopId, searchQuery])

  useEffect(() => {
    fetchVendors()
  }, [page, pageSize, selectedShopId, searchQuery])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
  }

  const handleEditClick = (params: GridCellParams) => {
    setSelectedItem(params.row as VendorRow)
    setOpenEdit(true)
  }

  const handleDeleteOpen = (params: GridCellParams) => {
    setSelectedItem(params.row as VendorRow)
    setOpenDelete(true)
  }

  const handleSwitchChange = async (event: React.ChangeEvent<HTMLInputElement>, params: any) => {
    const { checked } = event.target;
    try {
      await axiosInstance.post(`/api/v1/admin/updateVendor?id=${params.id}`, { is_active: checked ? 1 : 0 })
      fetchVendors()
      toast.success('Status updated successfully.')
    } catch (e) {
      toast.error('Failed to update status')
    }
  }

  const handleViewVendor = (id: number) => {
    router.push(`vendor/viewVendor/${id}`)
  }

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Sr. No.',
      flex: 0.5,
      minWidth: 70,
      sortable: false,
      renderCell: index => {
        const rowIndex = index.api.getRowIndex(index.row.id)
        return page * pageSize + (rowIndex % pageSize) + 1
      },
    },
    {
      field: 'name',
      headerName: 'Vendor Name',
      flex: 1.5,
      minWidth: 200,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <Typography 
          color="primary.main" 
          sx={{ cursor: 'pointer', fontWeight: 500 }}
          onClick={() => handleViewVendor(params.row.id)}
        >
          {params.row?.name || 'NA'}
        </Typography>
      )
    },
    {
      field: 'phone',
      headerName: 'Mobile Number',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params: GridCellParams) => params.row?.phone || 'NA'
    },
    {
      field: 'email',
      headerName: 'Email ID',
      flex: 1.5,
      minWidth: 200,
      sortable: false,
      renderCell: (params: GridCellParams) => params.row?.email || 'NA'
    },
    {
      field: 'gstin',
      headerName: 'GST Number',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => params.row?.gstin || 'NA'
    },
    {
      field: 'payable_balance',
      headerName: 'Payable Amount',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => params.row?.payable_balance || 'NA'
    },
  
    // {
    //   field: 'status',
    //   headerName: 'Status',
    //   minWidth: 130,
    //   sortable: false,
    //   renderCell: (params: GridCellParams) => {
    //     const isActive = params.row.is_active === true || params.row.is_active === 1;
    //     return (
    //       <Stack direction='row' alignItems='center' spacing={2}>
    //         <Typography variant="body2">{isActive ? 'Active' : 'Inactive'}</Typography>
    //         <Switch size="small" checked={isActive} onChange={(event) => handleSwitchChange(event, params.row)} />
    //       </Stack>
    //     );
    //   },
    //   flex: 1,
    // },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 150,
      sortable: false,
      flex: 1,
      renderCell: (params: GridCellParams) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title='View Vendor'>
            <IconButton size="small" onClick={() => handleViewVendor(params.row.id)}>
              <Icon icon={'ph:eye'} />
            </IconButton>
          </Tooltip>
          <Tooltip title='Update Vendor'>
            <IconButton size="small" onClick={() => handleEditClick(params)}>
              <Icon icon={'circum:edit'} />
            </IconButton>
          </Tooltip>
          <Tooltip title='Delete Vendor'>
            <IconButton size="small" onClick={() => handleDeleteOpen(params)}>
              <Icon icon={'ic:outline-delete'} color='#FC4E4E' />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ]

  const handleSearch = (query: string) => {
    setPage(0)
    setQuery(query);
  };

  return (
    <>
      <Card sx={{ p: 5 }}>
        <Grid container spacing={3} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <GoBack label="Vendors" isBack={false} />
          </Grid>
              <Grid item xs={12} md={4}>
                <SearchInput handleSearch={handleSearch} placeHolder="Search Vendors..." />
              </Grid>
              {/* <Grid item xs={12} sm={4}>
                <RHFAutoComplete
                  control={control}
                  name="shop_id"
                  apiUrl="/api/v1/admin/getAllShops"
                  placeholder="Filter by Shop"
                  labelinput="Filter by Shop"
                  labelKey="name"
                  valueKey="id"
                  required={false}
                />
              </Grid> */}
              <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                {checkPermission('vendor.add') && (
                  <Button onClick={() => setOpenAdd(true)} variant='contained' startIcon={<AddCircleOutlineIcon />} fullWidth>
                    Add Vendor
                  </Button>
                )}
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

      {openAdd && <AddVendor open={openAdd} handleClose={() => setOpenAdd(false)} fetchData={fetchVendors} />}
      
      {openDelete && (
        <DeleteDialogPopup 
          show={openDelete} 
          handleclose={() => setOpenDelete(false)} 
          selectedItems={selectedItem?.id}
          fetchData={fetchVendors}
          label={'Are you sure you want to delete this vendor?'} 
          apiUrl={'/api/v1/admin/deleteVendor/'} 
        />
      )}

      {openEdit && (
        <AddVendor 
          open={openEdit} 
          handleClose={() => setOpenEdit(false)}
          fetchData={fetchVendors}
          selectedItem={selectedItem ?? undefined} 
        />
      )}
    </>
  )
}

export default Vendor
