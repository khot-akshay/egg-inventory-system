import { Box, Button, Card, Grid, InputAdornment, Stack, Switch, TextField, Tooltip } from '@mui/material'
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
import AddCategories from './AddproductsGrade';
import AddProductsGrade from './AddproductsGrade';
import toast from 'react-hot-toast';




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

const ProductsGrade = () => {
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


  // const fetchGame = async () => {
  //   setLoading(true)
  //   try {
  //     const response = await axiosInstance.get(`/api/v1/admin/getAllBrands?pageNo=${page}&limit=${pageSize}`)

  //     setRows(response.data.data.brands ?? [])
  //     setTotalRows(response.data.data?.count ?? 0)
  //   } catch (e) {
  //     console.log(e)
  //   } finally {
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
  //     console.log(e);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchGame = async () => {
    setLoading(true);
    try {
      let url = `/api/v1/admin/productGrades/getAllProductGrades?pageNo=${page}&limit=${pageSize}`;

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
      console.log(e);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchGame();
  }, [page, pageSize, searchQuery]);



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
    console.log('Delete Clicked:', params.row)
    setSelectedItem(params.row as CategoryRow)
    setOpenDelete(true)
    console.log('Selected Item for delete:', selectedItem)
  }

  const handleSwitchChange = async (event: React.ChangeEvent<HTMLInputElement>, params: any) => {
    const { checked } = event.target;
    try {
        await axiosInstance.post(`/api/v1/admin/productGrades/updateProductGrades/${params.id}`, { is_active: checked ? 1 : 0 })
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
      field: 'name',
      headerName: 'Product Grade Name',
      flex: 1,

      minWidth: 250,
      sortable: false,
      renderCell: (params: GridCellParams) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
        {params.row?.name || 'NA'}
      </div>
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
          {/* {checkPermission('update_brand') && ( */}

            <Tooltip title='Update Category.' placement='bottom'>
              <Button sx={{ color: '#84919d', margin: '-10px' }} onClick={() => handleEditClick(params)}>
                <Icon icon={'circum:edit'} fontSize={24} />
              </Button>
            </Tooltip>
          {/* )} */}
          {/* {checkPermission('delete_brand') && (  */}

            <Tooltip title='Delete Category.' placement='bottom'>
              <Button
                style={{ color: '#84919d', margin: '-10px' }}
                onClick={() => handleDeleteOpen(params)}
              >
                <Icon icon={'ic:outline-delete'} fontSize={24} color='#FC4E4E' />
              </Button>
            </Tooltip>
          {/* )} */}
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
            <GoBack label="Product Grade" isBack={false} />
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
            <Grid item xs={12} sm="auto">
              <SearchInput handleSearch={handleSearch} placeHolder="Search..." />

            </Grid>



            <Grid item xs={12} sm="auto">
              {/* <Button onClick={() => setOpenAdd(true)} variant="contained" startIcon={<AddCircleOutlineIcon />}>
                Add Brand
              </Button> */}
              {/* {checkPermission('add_brand') && ( */}
                <Button onClick={() => setOpenAdd(true)} variant='contained'>
                  Add Product Grade <AddCircleOutlineIcon sx={{ ml: 1 }} />
                </Button>

              {/* )} */}

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
      {openAdd && <AddProductsGrade open={openAdd} handleClose={() => setOpenAdd(false)} fetchData={fetchGame} />}
      {openDelete && (
        <DeleteDialogPopup show={openDelete} handleclose={() => setOpenDelete(false)} selectedItems={selectedItem?.id}
          fetchData={fetchGame}
          label={'Are you sure! You want to delete.'} apiUrl={'api/v1/admin/productGrades/deleteProductGrades/'} />
      )}
      {openEdit && (
        <AddProductsGrade open={openEdit} handleClose={() => setOpenEdit(false)}
          fetchData={fetchGame}
          selectedItem={selectedItem ?? undefined} />
      )}
    </>
  )
}

export default ProductsGrade
