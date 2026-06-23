import { Box, Button, Card, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, Stack, Switch, TextField, Tooltip, Typography } from '@mui/material'
import { GridCellParams, GridColDef, GridSearchIcon } from '@mui/x-data-grid'
import React, { useEffect, useState } from 'react'
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
import Link from 'next/link';
import { useRouter } from 'next/router';




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

const ActivityLogs = () => {
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
  const [moduleName, setModuleName] = useState('all')
  const router = useRouter();

  const handleViewAudit = (id: number) => {
    router.push(`/logs/${id}`);
  }



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
    setLoading(true);
    try {
      let url = `/api/v1/admin/getAllAudits?pageNo=${page}&limit=${pageSize}&module=${moduleName}`;

      // if (searchQuery) {
      //   url += `&search=${encodeURIComponent(searchQuery)}`;
      // }
      if (searchQuery) {
        url = `${url}&global_search=${searchQuery}`;
      }


      const response = await axiosInstance.get(url);
      setRows((response.data.data?.data ?? []) as CategoryRow[]);
      setTotalRows(response.data.data?.count ?? 0);
    } catch (e) {
      } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchGame();
  }, [page, pageSize, searchQuery, moduleName]);



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
      await axiosInstance.post(`/api/v1/admin/categories/updateCategories/${params.id}`, { is_active: checked ? 1 : 0 })
      fetchGame()
      toast.success('Status updated successfully.')
    } catch (e) {
      toast.error('Failed to set active')
    }
  }
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Sr. No.',
      flex: 0.5,
      minWidth: 100,

      sortable: false,
      renderCell: index => {
        const rowIndex = index.api.getRowIndex(index.row.id)
        return page * pageSize + (rowIndex % pageSize) + 1
      },
      hideable: false
    },
    
    {
      field: 'name',
      headerName: 'User Name',
      flex: 1,

      minWidth: 250,
      sortable: false,
      renderCell: (params: GridCellParams) => 
      // <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
      //   {params.row?.user?.name || 'NA'}
      // </div>
 <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            cursor: "pointer",
            alignItems: "start",
            height: "100%",
          }}
          onClick={() => handleViewAudit(params.row.id)}
        >
          <Typography color="primary.main">
            {" "}
        {params.row?.user?.name || 'NA'}
          </Typography>

          <Icon
            icon="solar:arrow-right-up-linear"
            style={{ color: "primary", fontSize: 15 }}
          ></Icon>
        </Box>

    },
    //   {
    //     field: 'amenity_type',
    //     headerName: 'Amenity Type',
    //     flex: 1,
    //     minWidth: 250,
    //     sortable: false,
    //     renderCell: (params: GridCellParams) => (
    //       <p>{params.row?.amenity_type?.name ? (params.row?.amenity_type?.name) : 'NA'}</p>
    //     )
    //   },
    //   { 
    //     field: 'icon',
    //     headerName: 'Amenity Icon',
    //     flex: 1,
    //     minWidth: 250,
    //     sortable: false,
    //     renderCell: (params: GridCellParams) => (
    //       <Icon icon={params?.row?.icon ? params?.row?.icon : 'mdi:home-plus-outline'}/>
    //     )
    //   },
    //   {
    //     field: 'status',
    //     headerName: 'Status',
    //     minWidth: 150,
    //     sortable: false,
    //     renderCell: (params: GridCellParams) => (
    //         <Stack direction='row' alignItems='center' spacing={5}>

    //             <p>{params.row.is_active == '1' ? 'Active' : 'In-active'}</p>
    //             <Switch checked={params.row.is_active == '1' ? true : false} onChange={(event) => handleSwitchChange(event, params.row)} />
    //         </Stack>
    //     ),
    //     flex: 1,
    // },
    {
      field: 'status',
      headerName: 'Event',
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
        {params.row?.event || 'NA'}
      </div>,
      flex: 1,
    },
    {
      field: 'mobile',
      headerName: 'Mobile Number',
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
        {params.row?.user?.mobile_number || 'NA'}
      </div>,
      flex: 1,
    },
    {
      field: 'ip',
      headerName: 'IP Address',
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
        {params.row?.ip_address || 'NA'}
      </div>,
      flex: 1,
    },
    {
      field: 'url',
      headerName: 'URL',
      minWidth: 350,
      sortable: false,
      renderCell: (params: GridCellParams) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
        {params.row?.url ?? 'NA'}
      </div>,
      flex: 1,
    },
    {
      field: 'created_at',
      headerName: ' Date',
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

          <Tooltip title='View Audit Details.' placement='bottom'>
            <Button sx={{ color: '#84919d', margin: '-10px' }} onClick={() => handleViewAudit(params.row.id)}>
              <Icon icon={'ph:eye'} fontSize={24} />
            </Button>
          </Tooltip>



        </>
      ),
    },

  ]
  const handleSearch = (query: string) => {
    setQuery(query);
  };

  return (
    <>

      <Card sx={{ p: 5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" sx={{ mb: 3 }}>

          {/* Left Side: Back Button and Title */}
          <Box display="flex" alignItems="center" gap={2}>
            <GoBack label="Activity Logs" isBack={false} />
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
            <Grid item xs={12} md={3}>
              <SearchInput handleSearch={handleSearch} placeHolder="Search..." />

            </Grid>



            <Grid item xs={12} sm="auto" sx={{ minWidth: 250 }}>
              {/* <Button onClick={() => setOpenAdd(true)} variant="contained" startIcon={<AddCircleOutlineIcon />}>
                Add Brand
              </Button> */}
              {/* {checkPermission('add_brand') && ( */}
              {/* <Button onClick={() => setOpenAdd(true)} variant='contained'>
                  Add Category <AddCircleOutlineIcon sx={{ ml: 1 }} />
                </Button> */}

              {/* )} */}

              <FormControl fullWidth size='small'>
                <InputLabel id='controlled-select-label'>Select Module</InputLabel>

                <Select
                  label='Select Module'
                  id='controlled-select'
                  labelId='controlled-select-label'
                  defaultValue={'iqtest'}
                  value={moduleName}
                  onChange={(e) => { setModuleName(e.target.value) }}
                >
                  <MenuItem value={'all'}>All</MenuItem>
                  <MenuItem value={'categories'}>Categories</MenuItem>
                  <MenuItem value={'plants'}>Plants</MenuItem>
                  <MenuItem value={'plant_products'}>Plant Products</MenuItem>
                  <MenuItem value={'appuser'}>Appuser</MenuItem>
                  <MenuItem value={'daily_requirements'}>Daily Requirements</MenuItem>
                  <MenuItem value={'faqs'}>FAQ</MenuItem>
                  <MenuItem value={'orders'}>Orders</MenuItem>
                  <MenuItem value={'shipments'}>Shipments</MenuItem>
                </Select>

              </FormControl>

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

    </>
  )
}

export default ActivityLogs
