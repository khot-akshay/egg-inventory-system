import { Box, Button, Card, Grid, InputAdornment, Menu, MenuItem, Stack, Switch, TextField, Tooltip, Typography } from '@mui/material'
import { GridCellParams, GridColDef, GridSearchIcon } from '@mui/x-data-grid'
import React, { useCallback, useEffect, useState, FC } from 'react'
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

import { encodeParams, decodeParams } from 'src/utils/encodeid'
import AddProductPlant from './AddProductPlant';
import RHFAutoComplete from 'src/hook-forms/RHFAutoComplete';
import { useForm } from 'react-hook-form'
import AddProducts from '../metaData/products/AddProducts';
import AddNewProductPlant from './AddNewProductPlant';



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

interface ProductPlantsProps {
  customerId?: number | string
}

const ProductPlants: FC<ProductPlantsProps> = ({ customerId }) => {
  const [rows, setRows] = useState<CategoryRow[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(0)
  const [openAdd, setOpenAdd] = useState(false)
  const [openAddProduct, setOpenAddProduct] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [selectedItem, setSelectedItem] = useState<CategoryRow | null>(null)
  const [openEdit, setOpenEdit] = useState(false)
  const [searchQuery, setQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const router = useRouter()
  const { control, watch } = useForm({
    defaultValues: {
      product_grades_id: null,
      polish_type_id: null
    }
  })
  const selectedGradeId: any = watch('product_grades_id')
  const selectedPolishTypeId: any = watch('polish_type_id')


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
  // const fetchGame = useCallback(async () => {
  //   setLoading(true);
  //   try {
  //     const params = new URLSearchParams({
  //       pageNo: String(page),
  //       limit: String(pageSize)
  //     })

  //     if (customerId) {
  //       let plantId: number | string | undefined = customerId;
  //       if (typeof customerId === 'string') {
  //         try {
  //           const decoded = decodeParams(customerId);
  //           if (typeof decoded === 'number') {
  //             plantId = decoded;
  //           } else if (decoded && typeof decoded === 'object' && 'id' in decoded) {
  //             plantId = Number(decoded.id);
  //           } else {
  //             plantId = Number(decoded ?? customerId);
  //           }
  //         } catch {
  //           plantId = Number(customerId);
  //         }
  //       }
  //       if (plantId && !isNaN(Number(plantId))) {
  //         params.append('plant_id', String(plantId))
  //       }
  //     }

  //     if (searchQuery) {
  //       params.append('global_search', searchQuery)
  //     }
  //     if (selectedGradeId) {
  //       params.append('product_grades_id', String(selectedGradeId?.id))
  //     }
  //     if (selectedPolishTypeId) {
  //       params.append('polish_type_id', String(selectedPolishTypeId?.id))
  //     }

  //     const url = `/api/v1/admin/plantProducts/getAllPlantProducts?${params.toString()}`
  //     console.log('Fetching plant products with URL:', url);
  //     const response = await axiosInstance.get(url);
  //     console.log('Plant products response:', response.data);
  //     setRows((response.data.data?.data ?? []) as CategoryRow[]);
  //     setTotalRows(response.data.data?.count ?? 0);
  //   } catch (e) {
  //     console.error('Error fetching plant products:', e);
  //     toast.error('Failed to load plant products.');
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [page, pageSize, searchQuery, customerId, selectedGradeId, selectedPolishTypeId]);

  const fetchGame = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        pageNo: String(page),
        limit: String(pageSize)
      })

      if (customerId) {
        let plantId: number | string | undefined = customerId;
        if (typeof customerId === 'string') {
          try {
            const decoded = decodeParams(customerId);
            if (typeof decoded === 'number') {
              plantId = decoded;
            } else if (decoded && typeof decoded === 'object' && 'id' in decoded) {
              plantId = Number(decoded.id);
            } else {
              plantId = Number(decoded ?? customerId);
            }
          } catch {
            plantId = Number(customerId);
          }
        }
        if (plantId && !isNaN(Number(plantId))) {
          params.append('plant_id', String(plantId))
        }
      }

      if (searchQuery) {
        params.append('global_search', searchQuery)
      }

      // Fixed: Properly extract and validate IDs before appending
      if (selectedGradeId) {
        const gradeId = typeof selectedGradeId === 'object' ? selectedGradeId.id : selectedGradeId;
        if (gradeId !== undefined && gradeId !== null && !isNaN(Number(gradeId))) {
          params.append('product_grades_id', String(gradeId))
        }
      }

      if (selectedPolishTypeId) {
        const polishId = typeof selectedPolishTypeId === 'object' ? selectedPolishTypeId.id : selectedPolishTypeId;
        if (polishId !== undefined && polishId !== null && !isNaN(Number(polishId))) {
          params.append('polish_type_id', String(polishId))
        }
      }

      const url = `/api/v1/admin/plantProducts/getAllPlantProducts?${params.toString()}`
      console.log('Fetching plant products with URL:', url);
      const response = await axiosInstance.get(url);
      console.log('Plant products response:', response.data);
      setRows((response.data.data?.data ?? []) as CategoryRow[]);
      setTotalRows(response.data.data?.count ?? 0);
    } catch (e) {
      console.error('Error fetching plant products:', e);
      toast.error('Failed to load plant products.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery, customerId, selectedGradeId, selectedPolishTypeId]);

  useEffect(() => {
    if (customerId) {
      fetchGame();
    }
  }, [fetchGame, customerId]);




  useEffect(() => {
    setPage(0)
  }, [selectedGradeId, selectedPolishTypeId])
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
      await axiosInstance.post(`/api/v1/admin/plantProducts/updatePlantProducts/${params.id}`, { is_active: checked ? 1 : 0 })
      fetchGame()
      toast.success('Status updated successfully.')
    } catch (e) {
      toast.error('Failed to set active')
    }
  }

  const handleViewUser = (id: number) => {
    console.log(id, 'id')
    if (customerId) {
      router.push(`/plants/viewplant/${customerId}/${id}`)
    } else {
      router.push(`/plants/viewplant/${encodeParams(id)}`)
    }
  }

  const handleAddClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddExisting = () => {
    setOpenAdd(true);
    handleMenuClose();
  };

  const handleAddNew = () => {
    setOpenAddProduct(true);
    handleMenuClose();
  };

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Sr. No.',
      flex: 0.5,
      minWidth: 90,

      sortable: false,
      renderCell: index => {
        const rowIndex = index.api.getRowIndex(index.row.id)
        return page * pageSize + (rowIndex % pageSize) + 1
      },
      hideable: false
    },
    {
      field: 'plant_name',
      headerName: 'Product code',
      flex: 1,

      minWidth: 300,
      sortable: false,
      renderCell: (params: GridCellParams) =>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', alignItems: 'start', height: '100%' }}
          onClick={() => handleViewUser(params.row.id)}
        >
          <Typography color="primary.main">              {params.row?.product?.code || 'NA'}
          </Typography>
          <Icon icon="solar:arrow-right-up-linear" style={{ color: 'primary', fontSize: 15 }}></Icon>
        </Box>
      // <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
      //   {params.row?.product?.name || 'NA'}
      // </div>
    },
    {
      field: 'polish_typeproduct',
      headerName: 'Product Name',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) =>
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
          {params.row?.product?.name || 'NA'}
        </div>
    },
    {
      field: 'organization_name',
      headerName: 'Product Grade',
      flex: 1,

      minWidth: 180,
      sortable: false,
      renderCell: (params: GridCellParams) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
        {params.row?.grade?.name || 'NA'}
      </div>
    },
    // {
    //   field: 'moisture_content',
    //   headerName: 'Moisture Level (%)',
    //   flex: 1,
    //   minWidth: 150,
    //   sortable: false,
    //   renderCell: (params: GridCellParams) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
    //     {params.row?.moisture_content !== null && params.row?.moisture_content !== undefined ? `${params.row.moisture_content}%` : 'NA'}
    //   </div>
    // },
    {
      field: 'polish_type',
      headerName: 'Polish Type',
      flex: 1,
      minWidth: 180,
      sortable: false,
      renderCell: (params: GridCellParams) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
        {params.row?.polish_type?.name || params.row?.polish_type_name || 'NA'}
      </div>
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
            <GoBack label="Plant Products" isBack={false} />
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
              <Button
                id="add-product-button"
                aria-controls={openMenu ? 'add-product-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={openMenu ? 'true' : undefined}
                onClick={handleAddClick}
                variant='contained'
              >
                Add Product <Icon icon="eva:arrow-ios-downward-fill" style={{ marginLeft: '8px' }} />
              </Button>
              <Menu
                id="add-product-menu"
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
                MenuListProps={{
                  'aria-labelledby': 'add-product-button',
                }}
              >
                <MenuItem onClick={handleAddExisting}>
                  <AddCircleOutlineIcon sx={{ mr: 2 }} fontSize="small" />
                  Add Existing Product
                </MenuItem>
                <MenuItem onClick={handleAddNew}>
                  <AddCircleOutlineIcon sx={{ mr: 2 }} fontSize="small" />
                  Add New Product
                </MenuItem>
              </Menu>
            </Grid>
          </Box>

        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}></Grid>
          <Grid item xs={12} md={2} >
            <RHFAutoComplete
              control={control}
              name='product_grades_id'
              apiUrl='/api/v1/admin/productGrades/getAllProductGrades'
              placeholder='Select Product Grade'
              labelinput='Select Product Grade'
              extraParams={{ is_active: 1 }}

              labelKey='name'
              valueKey='id'
              required={false}
            />
          </Grid>
          <Grid item xs={12} md={2} >
            <RHFAutoComplete
              control={control}
              name='polish_type_id'
              apiUrl='/api/v1/admin/polishTypes/getAllPolishTypes'
              placeholder='Select Polish Type'
              labelinput='Select Polish Type'
              labelKey='name'
              valueKey='id'
              required={false}
              extraParams={{ is_active: 1 }}
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
      {openAdd && <AddProductPlant open={openAdd} handleClose={() => setOpenAdd(false)} fetchData={fetchGame} plantId={customerId} />}
      {openDelete && (
        <DeleteDialogPopup show={openDelete} handleclose={() => setOpenDelete(false)} selectedItems={selectedItem?.id}
          fetchData={fetchGame}
          label={'Are you sure! You want to delete.'} apiUrl={'api/v1/admin/plantProducts/deletePlantProducts/'} />
      )}
      {openEdit && (
        <AddProductPlant open={openEdit} handleClose={() => setOpenEdit(false)}
          fetchData={fetchGame}
          selectedItem={selectedItem ?? undefined} plantId={customerId} />
      )}

      {openAddProduct && <AddNewProductPlant open={openAddProduct} handleClose={() => setOpenAddProduct(false)} fetchData={fetchGame} plantId={customerId} />}

    </>
  )
}

export default ProductPlants
