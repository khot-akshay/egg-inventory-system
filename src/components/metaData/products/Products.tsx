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
import AddProducts from './AddProducts';
import { useRouter } from 'next/router';
import RHFAutoComplete from 'src/hook-forms/RHFAutoComplete';




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

const Products = () => {
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
      categories_id: null,
      product_grades_id: null,
      polish_type_id: null
    }
  })
  const selectedCategoryId = watch('categories_id') as number | null
  const selectedGradeId = watch('product_grades_id') as number | null
  const selectedPolishTypeId = watch('polish_type_id') as number | null



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
    setLoading(true)
    try {
      const params = new URLSearchParams({
        pageNo: String(page),
        limit: String(pageSize)
      })

      if (searchQuery) params.append('global_search', searchQuery)
      if (selectedCategoryId) params.append('categories_id', String(selectedCategoryId))
      if (selectedGradeId) params.append('product_grades_id', String(selectedGradeId))
      if (selectedPolishTypeId) params.append('polish_type_id', String(selectedPolishTypeId))

      const response = await axiosInstance.get(
        `/api/v1/admin/products/getAllProducts?${params.toString()}`
      )

      setRows(response.data.data?.data ?? [])
      setTotalRows(response.data.data?.count ?? 0)
    } catch (e) {
      console.error(e)
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
  }, [selectedCategoryId, selectedGradeId, selectedPolishTypeId, searchQuery])

  // Fetch data
  useEffect(() => {
    fetchGame()
  }, [page, pageSize, selectedCategoryId, selectedGradeId, selectedPolishTypeId, searchQuery])







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
      await axiosInstance.post(`/api/v1/admin/products/updateProducts/${params.id}`, { is_active: checked ? 1 : 0 })
      fetchGame()
      toast.success('Status updated successfully.')
    } catch (e) {
      toast.error('Failed to set active')
    }
  }
  const handleViewUser = (id: number) => {
    router.push(`products/viewProduct/${(id)}`)
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
      field: 'code',
      headerName: 'Product code ',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      minWidth: 250,
      sortable: false,
      renderCell: (params: GridCellParams) =>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', cursor: 'pointer', alignItems: 'center', height: '100%', gap: 2 }}
          onClick={() => handleViewUser(params.row.id)}
        >
          <Typography color="primary.main">
            {params.row?.code || 'NA'}
          </Typography>
          <Icon icon="solar:arrow-right-up-linear" style={{ color: 'primary', fontSize: 15 }}></Icon>
        </Box>

    },

    {
      field: 'name',
      headerName: 'Product Name',
      flex: 1,

      minWidth: 320,
      sortable: false,
      renderCell: (params: GridCellParams) =>
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
          {params.row?.name || 'NA'}
        </div>

      //  <Box
      //               sx={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', alignItems: 'start', height: '100%' }}
      //               onClick={() => handleViewUser(params.row.id)}
      //           >
      //               <Typography color="primary.main">        {params.row?.name || 'NA'}</Typography>
      //               <Icon icon="solar:arrow-right-up-linear" style={{ color: 'primary', fontSize: 15 }}></Icon>
      //           </Box>
    },
    {
      field: 'categories.name',
      headerName: 'Category Name',
      flex: 1,

      minWidth: 220,
      sortable: false,

      renderCell: (params: GridCellParams) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>

        {params.row?.categories?.name || 'NA'}
      </div>


    },

    {
      field: 'default_grade',
      headerName: 'Product Grade',
      flex: 1,

      minWidth: 240,
      sortable: false,
      renderCell: (params: GridCellParams) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
        {params.row?.grade?.name || 'NA'}
      </div>
    },
    {
      field: 'default_polish_type',
      headerName: 'Polish Type ',
      flex: 1,

      minWidth: 200,
      sortable: false,
      renderCell: (params: GridCellParams) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
        {params.row?.polish_type?.name || 'NA'}
      </div>
    },

    // {
    //   field: 'code',
    //   headerName: 'Product code ',
    //   flex: 1,

    //   minWidth: 250,
    //   sortable: false,
    //   renderCell: (params: GridCellParams) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
    //     {params.row?.code || 'NA'}
    //   </div>
    // },

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
          <Button
            style={{ color: '#84919d', margin: '-10px' }}
            onClick={() => handleViewUser(params.row.id)}>
            <Icon icon={'ph:eye'} fontSize={24} />
          </Button>
          <Tooltip title='Update Product.' placement='bottom'>
            <Button sx={{ color: '#84919d', margin: '-10px' }} onClick={() => handleEditClick(params)}>
              <Icon icon={'circum:edit'} fontSize={24} />
            </Button>
          </Tooltip>
          {/* )} */}
          {/* {checkPermission('delete_brand') && (  */}

          <Tooltip title='Delete Product.' placement='bottom'>
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
    setPage(0)
    setQuery(query);
  };

  return (
    <>

      <Card sx={{ p: 5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" sx={{ mb: 3 }}>

          {/* Left Side: Back Button and Title */}
          <Box display="flex" alignItems="center" gap={2}>
            <GoBack label="Products" isBack={false} />
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
                Add Product <AddCircleOutlineIcon sx={{ ml: 1 }} />
              </Button>

              {/* )} */}

            </Grid>
          </Box>

        </Box>
        <Grid container spacing={2}>

          <Grid item xs={12} md={6}></Grid>
          <Grid item xs={12} md={2} >
            <RHFAutoComplete
              control={control}
              name="categories_id"
              apiUrl="/api/v1/admin/categories/getAllCategories"
              extraParams={{ is_active: 1 }}
              placeholder="Select Category"
              labelinput="Select Category"
              labelKey="name"
              valueKey="id"
              required={false}
            />
          </Grid>
          <Grid item xs={12} md={2} >
            <RHFAutoComplete
              control={control}
              name='product_grades_id'
              apiUrl='/api/v1/admin/productGrades/getAllProductGrades'
              extraParams={{ is_active: 1 }}
              placeholder='Select Product Grade'
              labelinput='Select Product Grade'
              labelKey="name"
              valueKey="id"
              required={false}
            />
          </Grid>
          <Grid item xs={12} md={2} >
            <RHFAutoComplete
              control={control}
              name='polish_type_id'
              apiUrl='/api/v1/admin/polishTypes/getAllPolishTypes'
              extraParams={{ is_active: 1 }}
              placeholder='Select Polish Type'
              labelinput='Select Polish Type'
              labelKey="name"
              valueKey="id"
              required={false}
            />
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
      {openAdd && <AddProducts open={openAdd} handleClose={() => setOpenAdd(false)} fetchData={fetchGame} />}
      {openDelete && (
        <DeleteDialogPopup show={openDelete} handleclose={() => setOpenDelete(false)} selectedItems={selectedItem?.id}
          fetchData={fetchGame}
          label={'Are you sure! You want to delete.'} apiUrl={'api/v1/admin/products/deleteProducts/'} />
      )}
      {openEdit && (
        <AddProducts open={openEdit} handleClose={() => setOpenEdit(false)}
          fetchData={fetchGame}
          selectedItem={selectedItem ?? undefined} />
      )}
    </>
  )
}

export default Products
