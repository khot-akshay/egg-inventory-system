import { Box, Button, Card, Grid, InputAdornment, Stack, Switch, TextField, Tooltip, Typography } from '@mui/material'
import { GridCellParams, GridColDef, GridSearchIcon } from '@mui/x-data-grid'
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import CommonDatagrid from 'src/components/common/DatagridData.tsx/CommonDatagrid'

import GoBack from 'src/components/common/goBack/GoBackButton';
import axiosInstance from 'src/services/axios'
import Icon from 'src/@core/components/icon'
import DeleteDialogPopup from 'src/components/common/DeletePopup/DeleteModalPopup'
import checkPermission from 'src/configs/CheckPermisstion';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import DateFormateComponent from 'src/components/common/dateFormat/DateFromatModule';
import SearchInput from 'src/components/common/SearchInput';
import toast from 'react-hot-toast';

import { useRouter } from 'next/router';
import RHFAutoComplete from 'src/hook-forms/RHFAutoComplete';
import AddVehicles from './AddVehicles'
import TooltipOnly from 'src/components/common/TooltipOnly/TooltipOnly';




interface CategoryRow {
  id: number
  name: string
  slug?: string
  description?: string | null
  image_url?: string | null
  is_active?: boolean
  created_at?: string | null
  [key: string]: any
}

type SelectOption = {
  label: string
  value: number | string
}

const Vehicles = () => {
  const [rows, setRows] = useState<CategoryRow[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(0)
  const [openAdd, setOpenAdd] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [selectedItem, setSelectedItem] = useState<CategoryRow | null>(null)
  const [openEdit, setOpenEdit] = useState(false)
  const [searchQuery, setQuery] = useState("");
  const router = useRouter()
  const { control, watch } = useForm({
    defaultValues: {
      shop_id: null
    }
  })
  const selectedShopId = watch('shop_id') as number | null



  // const fetchGame = async () => {
  //   setLoading(true)
  //   try {
  //     const response = await axiosInstance.get(`/api/v1/admin/getAllBrands?pageNo=${page}&limit=${pageSize}`)

  //     setRows(response.data.data.brands ?? [])
  //     setTotalRows(response.data.data?.count ?? 0)
  //   } catch (e) {
  //     //   } finally {
  //     setLoading(false)
  //   }
  // }
  // const fetchGame = async () => {
  //   setLoading(true);
  //   try {




  //     const response = await axiosInstance.get(`/api/v1/admin/getAllBrands?pageNo=${page}&limit=${pageSize}`);

  //     setRows(response.data.data.brands ?? []);
  //     setTotalRows(response.data.data?.count ?? 0);
  //   } catch (e) {
  //     //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchGame = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        pageNo: String(page),
        limit: String(pageSize)
      })

      if (searchQuery) params.append('global_search', searchQuery)
      if (selectedShopId) params.append('shop_id', String(selectedShopId))

      const response = await axiosInstance.get(
        `/api/v1/admin/getAllVehicles?${params.toString()}`
      )

      setRows(response.data.data?.vehicles ?? [])
      setTotalRows(response.data.data?.count ?? 0)
    } catch (e) {
      } finally {
      setLoading(false)
    }
  }


  // useEffect(() => {
  //   fetchGame();
  // }, [fetchGame]);

  // useEffect(() => {
  //   setPage(0)
  // }, [selectedCategoryId, selectedGradeId, selectedPolishTypeId])

  // Reset page when filters change
  useEffect(() => {
    setPage(0)
  }, [selectedShopId, searchQuery])

  // Fetch data
  useEffect(() => {
    fetchGame()
  }, [page, pageSize, selectedShopId, searchQuery])







  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
  }
  const handleEditClick = (params: GridCellParams) => {
    setSelectedItem(params.row as CategoryRow)
    setOpenEdit(true)
  }
  const handleDeleteOpen = (params: GridCellParams) => {
    setSelectedItem(params.row as CategoryRow)
    setOpenDelete(true)
    }

  const handleSwitchChange = async (event: React.ChangeEvent<HTMLInputElement>, params: any) => {
    const { checked } = event.target;
    try {
      await axiosInstance.post(`/api/v1/admin/updateVehicle?id=${params.id}`, { is_active: checked })
      fetchGame()
      toast.success('Status updated successfully.')
    } catch (e) {
      toast.error('Failed to update status')
    }
  }
  const handleViewUser = (id: number) => {
    router.push(`vehicles/viewVehicle/${(id)}`)
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
      field: 'registration_number',
      headerName: 'Vehicle Number',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const value = params.row?.registration_number || 'NA';
        return (
          <TooltipOnly title={value}>
            <Box
              sx={{ display: 'flex', justifyContent: 'center', cursor: 'pointer', alignItems: 'center', height: '100%', gap: 2 }}
              onClick={() => handleViewUser(params.row.id)}
            >
              <Typography color="primary.main" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {value}
              </Typography>
              <Icon icon="solar:arrow-right-up-linear" style={{ color: 'primary', fontSize: 15 }}></Icon>
            </Box>
          </TooltipOnly>
        )
      }
    },
    {
      field: 'name',
      headerName: 'Vehicle Name',
      flex: 1,
      minWidth: 200,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const value = params.row?.name || 'NA';
        return (
          <TooltipOnly title={value}>
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.5 }}>
              {value}
            </div>
          </TooltipOnly>
        )
      }
    },
    // {
    //   field: 'vehicle_type',
    //   headerName: 'Type',
    //   flex: 1,
    //   minWidth: 150,
    //   sortable: false,
    //   renderCell: (params: GridCellParams) => {
    //     const value = params.row?.vehicle_type || 'NA';
    //     return (
    //       <TooltipOnly title={value}>
    //         <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.5 }}>
    //           {value}
    //         </div>
    //       </TooltipOnly>
    //     )
    //   }
    // },
    // {
    //   field: 'capacity_kg',
    //   headerName: 'Capacity (kg)',
    //   flex: 1,
    //   minWidth: 120,
    //   sortable: false,
    //   renderCell: (params: GridCellParams) => {
    //     const value = String(params.row?.capacity_kg || 'NA');
    //     return (
    //       <TooltipOnly title={value}>
    //         <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.5 }}>
    //           {value}
    //         </div>
    //       </TooltipOnly>
    //     )
    //   }
    // },
    {
      field: 'assigned_user.name',
      headerName: 'Assigned User',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const value = params.row?.assigned_user?.name || 'NA';
        return (
          <TooltipOnly title={value}>
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.5 }}>
              {value}
            </div>
          </TooltipOnly>
        )
      }
    },
    {
      field: 'driver.name',
      headerName: 'Driver',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const value = params.row?.driver?.name || 'NA';
        return (
          <TooltipOnly title={value}>
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.5 }}>
              {value}
            </div>
          </TooltipOnly>
        )
      }
    },
   

    {
      field: 'status',
      headerName: 'Status',
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const isActive = params.row.is_active === true || params.row.is_active === 1 || params.row.is_active === '1';
        return (
          <Stack direction='row' alignItems='center' spacing={5}>
            <p>{isActive ? 'Active' : 'Inactive'}</p>
            <Switch checked={isActive} onChange={(event) => handleSwitchChange(event, params.row)} />
          </Stack>
        );
      },
      flex: 1,
    },
    {
      field: 'created_at',
      headerName: 'Created Date',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <DateFormateComponent date={params.row?.created_at ?? ''} />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 150,
      sortable: false,
      flex: 1,
      renderCell: (params: GridCellParams) => (
        <>
          {/* {checkPermission('vehicle.view') && (
          <Button
            sx={{ color: 'text.secondary', margin: '-10px' }}
            onClick={() => handleViewUser(params.row.id)}>
            <Icon icon={'ph:eye'} fontSize={24} />
          </Button> 
          )} */}
          {checkPermission('vehicle.update') && (

          <Tooltip title='Update Vehicle.' placement='bottom'>
            <Button sx={{ color: 'text.secondary', margin: '-10px' }} onClick={() => handleEditClick(params)}>
              <Icon icon={'circum:edit'} fontSize={24} />
            </Button>
          </Tooltip>

          )} 
          {/* {checkPermission('vehicle.delete') && (   

          <Tooltip title='Delete Vehicle.' placement='bottom'>
            <Button
              sx={{ color: 'text.secondary', margin: '-10px' }}
              onClick={() => handleDeleteOpen(params)}
            >
              <Icon icon={'ic:outline-delete'} fontSize={24} sx={{ color: 'error.main' }} />
            </Button>
          </Tooltip> */}
          {/* )} */}
        </>
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
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" sx={{ mb: 3 }}>

          {/* Left Side: Back Button and Title */}
          <Box display="flex" alignItems="center" gap={2}>
            <GoBack label="Vehicles" isBack={false} />
          </Box>

          {/* Right Side: Search and Add Button */}
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">

            {/* <Grid item xs={12} sm="auto" sx={{ minWidth: 250 }}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setPage(0);
                  setSearchQuery(e.target.value);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <GridSearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid> */}
            {/* <Grid item xs={12} sm="auto">
              <SearchInput handleSearch={handleSearch} placeHolder="Search..." />

            </Grid> */}




            <Grid item xs={12} sm="auto">
             
              {checkPermission('vehicle.add') && (
              <Button onClick={() => setOpenAdd(true)} variant='contained'>
                Add Vehicle <AddCircleOutlineIcon sx={{ ml: 1 }} />
              </Button>

               )}  

            </Grid>
          </Box>

        </Box>
        {/* <Grid container spacing={2}>

          <Grid item xs={12} md={10}></Grid>
          <Grid item xs={12} md={2} >
            <RHFAutoComplete
              control={control}
              name="shop_id"
              apiUrl="/api/v1/admin/getAllShops"
              placeholder="Select Shop"
              labelinput="Select Shop"
              labelKey="name"
              valueKey="id"
              required={false}
            />
          </Grid>
        </Grid> */}
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
      {openAdd && <AddVehicles open={openAdd} handleClose={() => setOpenAdd(false)} fetchData={fetchGame} />}
      {openDelete && (
        <DeleteDialogPopup show={openDelete} handleclose={() => setOpenDelete(false)} selectedItems={selectedItem?.id}
          fetchData={fetchGame}
          label={'Are you sure! You want to delete.'} apiUrl={'api/v1/admin/deleteVehicle/'} />
      )}
      {openEdit && (
        <AddVehicles open={openEdit} handleClose={() => setOpenEdit(false)}
          fetchData={fetchGame}
          selectedItem={selectedItem ?? undefined} />
      )}
    </>
  )
}

export default Vehicles
