import { Box, Button, Card, CardActionArea, Grid, IconButton, InputAdornment, Stack, Switch, TextField, Tooltip, Typography, Chip, Tabs, Tab } from '@mui/material'
import { GridCellParams, GridColDef, GridSearchIcon } from '@mui/x-data-grid'
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTheme } from '@mui/material/styles'
import CommonSkeleton from 'src/@core/components/common-skeleton/CommonSkeleton'
import CommonCard from 'src/@core/components/common-card/CommonCard'
import CommonDatagrid from 'src/components/common/DatagridData.tsx/CommonDatagrid'
import CommonExport from 'src/@core/components/common-export/CommonExport'

import GoBack from 'src/components/common/goBack/GoBackButton';
import axiosInstance from 'src/services/axios'
import Icon from 'src/@core/components/icon'
import DeleteDialogPopup from 'src/components/common/DeletePopup/DeleteModalPopup'
import checkPermission from 'src/configs/CheckPermisstion';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import DateFormateComponent from 'src/components/common/dateFormat/DateFromatModule';
import SearchInput from 'src/components/common/SearchInput';
import toast from 'react-hot-toast';
import AddProducts from './AddQuickBill';
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

const QuickBill = () => {
  const [rows, setRows] = useState<CategoryRow[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pageSize, setPageSize] = useState(6)
  const [page, setPage] = useState(0)
  const [openAdd, setOpenAdd] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [selectedItem, setSelectedItem] = useState<CategoryRow | null>(null)
  const [openEdit, setOpenEdit] = useState(false)
  const [searchQuery, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const theme = useTheme();
  const router = useRouter()
  const { control, watch, setValue } = useForm({
    defaultValues: {
      category_id: null,
      shop_id: null
    }
  })
  const selectedCategoryId = watch('category_id') as number | null
  const selectedShopId = watch('shop_id') as number | null

  const [shops, setShops] = useState<any[]>([])

  const fetchShops = async () => {
    try {
      const response = await axiosInstance.get('/api/v1/admin/getAllShops')
      const data = response.data?.data
      if (Array.isArray(data)) {
        setShops(data)
      } else if (data && Array.isArray(data.shops)) {
        setShops(data.shops)
      } else {
        setShops([])
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchShops()
  }, [])



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
      if (selectedCategoryId) params.append('category_id', String(selectedCategoryId))
      if (selectedShopId) params.append('shop_id', String(selectedShopId))

      const response = await axiosInstance.get(
        `/api/v1/shop/getAllQuickbills?${params.toString()}`
      )

      setRows(response.data.data?.quickbills ?? [])
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
  }, [selectedCategoryId, selectedShopId, searchQuery])

  // Fetch data
  useEffect(() => {
    fetchGame()
  }, [page, pageSize, selectedCategoryId, selectedShopId, searchQuery])







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
      await axiosInstance.post(`/api/v1/admin/updateProduct?id=${params.id}`, { is_active: checked ? 1 : 0 })
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
      flex: 0.5,
      minWidth: 80,

      sortable: false,
      renderCell: index => {
        const rowIndex = index.api.getRowIndex(index.row.id)
        return page * pageSize + (rowIndex % pageSize) + 1
      },
      hideable: false
    },

    {
      field: 'customer_name',
      headerName: 'customer name',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
          {params.row?.customer?.name || 'NA'}
        </div>
      )
    },
    {
      field: 'shop',
      headerName: 'Product & Quantity',
      flex: 1.5,
      minWidth: 180,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const items = params.row?.items || [];
        if (!items.length) return <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>NA</div>;
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, py: 1 }}>
            {items.map((item: any, idx: number) => (
              <div key={idx} style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5, fontSize: '0.85rem' }}>
                {item.category?.name || 'Unknown'} : {Number(item.quantity)}
              </div>
            ))}
          </Box>
        );
      }
    },
    {
      field: 'quantity',
      headerName: 'Product Rate',
      flex: 1,
      minWidth: 100,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const items = params.row?.items || [];
        if (!items.length) return <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>0</div>;
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, py: 1 }}>
            {items.map((item: any, idx: number) => (
              <div key={idx} style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5, fontSize: '0.85rem' }}>
                ₹{Number(item.unit_cost || 0).toFixed(2)}
              </div>
            ))}
          </Box>
        );
      }
    },
    {
      field: 'unit_cost',
      headerName: 'Product Price',
      flex: 1,
      minWidth: 100,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const items = params.row?.items || [];
        if (!items.length) return <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>0</div>;
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, py: 1 }}>
            {items.map((item: any, idx: number) => (
              <div key={idx} style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5, fontSize: '0.85rem' }}>
                ₹{Number(item.line_total || 0).toFixed(2)}
              </div>
            ))}
          </Box>
        );
      }
    },
     {
      field: 'total_due',
      headerName: 'Total Due',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
          ₹{params.row?.balance_due || '0'}
        </div>
      )
    },
    {
      field: 'status',
      headerName: 'Payment',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const payments = params.row?.meta?.payments || [];
        if (!payments.length) {
          return (
            <div style={{ textTransform: 'capitalize' }}>
              {params.row?.status || 'NA'}
            </div>
          );
        }

        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, height: '100%', justifyContent: 'center' }}>
            {payments.map((p: any, i: number) => (
              // <Typography
              //   key={i}
              //   variant="body2"
              //   sx={{
              //     textTransform: 'capitalize',
              //     fontWeight: 500,
              //     fontSize: '0.8rem',
              //     // color:
              //     //   p.payment_type === 'cash' ? 'success.main' : 
              //     //   p.payment_type === 'upi' ? 'info.main' : 
              //     //   p.payment_type === 'credit' ? 'error.main' : 'text.primary'
              //   }}
              // >
              //   {p.payment_type} : ₹{p.amount}
              // </Typography>
                      <div key={i} style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 , textTransform: 'capitalize',}}>
                {p.payment_type} : ₹{p.amount}

</div>
            ))}
          </Box>
        );
      }
    },
    {
      field: 'total',
      headerName: 'Total Bill',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
          ₹{params.row?.total || '0'}
        </div>
      )
    },
   
   

    // {
    //   field: 'status',
    //   headerName: 'Status',
    //   minWidth: 150,
    //   sortable: false,
    //   renderCell: (params: GridCellParams) => {
    //     const isActive = params.row.is_active === true || params.row.is_active === 1 || params.row.is_active === '1';
    //     return (
    //       <Stack direction='row' alignItems='center' spacing={5}>
    //         <p>{isActive ? 'Active' : 'Inactive'}</p>
    //         <Switch checked={isActive} onChange={(event) => handleSwitchChange(event, params.row)} />
    //       </Stack>
    //     );
    //   },
    //   flex: 1,
    // },
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
    // {
    //   field: 'actions',
    //   headerName: 'Actions',
    //   minWidth: 150,
    //   sortable: false,
    //   flex: 1,
    //   renderCell: (params: GridCellParams) => (
    //     <>
    //       {/* {checkPermission('quick_bill.view') && ( */}
    //       <Button
    //         sx={{ color: 'text.secondary', margin: '-10px' }}
    //         onClick={() => handleViewUser(params.row.id)}>
    //         <Icon icon={'ph:eye'} fontSize={24} />
    //       </Button>
  //        )}
  //        {checkPermission('quick_bill.update') && (
    //       <Tooltip title='Update Product.' placement='bottom'>
    //         <Button sx={{ color: 'text.secondary', margin: '-10px' }} onClick={() => handleEditClick(params)}>
    //           <Icon icon={'circum:edit'} fontSize={24} />
    //         </Button>
    //       </Tooltip>
    //       )}
    //       {/* )} */}
    //       {/* {checkPermission('delete_brand') && (  */}

    //       <Tooltip title='Delete Product.' placement='bottom'>
    //         <Button
    //           sx={{ color: 'text.secondary', margin: '-10px' }}
    //           onClick={() => handleDeleteOpen(params)}
    //         >
    //           <Icon icon={'ic:outline-delete'} fontSize={24} sx={{ color: 'error.main' }} />
    //         </Button>
    //       </Tooltip>
    //       {/* )} */}
    //     </>
    //   ),
    // },
  ]
  const handleSearch = (query: string) => {
    setPage(0)
    setQuery(query);
  };

  return (
    <>

      <Card sx={{ p: 3 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} md={6} >
            <GoBack label="Quick Bill List" isBack={true} />
          </Grid>
              {/* <Grid item xs={12} md={3}>
                <SearchInput handleSearch={handleSearch} placeHolder="Search..." />
              </Grid>
               <Grid item xs={4} md={1} sx={{display:'flex', gap:1, alignItems:'center'}}>
                  <IconButton
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "6px",
                      border: viewMode === "list" ? "none" : "1px solid #D1D5DB",
                      bgcolor: viewMode === "list" ? theme.palette.primary.main : "transparent",
                      color: viewMode === "list" ? "common.white" : undefined,
                      transition: "all 0.25s ease",
                      "&:hover": {
                        bgcolor: theme.palette.primary.main,
                        color: "common.white",
                        border: "none",
                      },
                    }}
                    onClick={() => {
                      setViewMode("list");
                      setPage(0);
                    }}
                  >
                    <Icon icon="material-symbols:list" width={20} />
                  </IconButton>

                  <IconButton
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "6px",
                      border: viewMode === "grid" ? "none" : "1px solid #D1D5DB",
                      bgcolor: viewMode === "grid" ? theme.palette.primary.main : "transparent",
                      color: viewMode === "grid" ? "common.white" : undefined,
                      transition: "all 0.25s ease",
                      "&:hover": {
                        bgcolor: theme.palette.primary.main,
                        color: "common.white",
                        border: "none",
                      },
                    }}
                    onClick={() => {
                      setViewMode("grid");
                      setPage(0);
                    }}
                  >
                    <Icon icon="material-symbols:apps" width={20} />
                  </IconButton>

                  <CommonExport
                    data={rows}
                    fileName="QuickBills"
                    columns={columns}
                    transform={(row, index) => [
                      index + 1,
                      `"${row.customer?.name || 'NA'}"`,
                      `"${row.items?.[0]?.product?.name || 'NA'}"`,
                      row.items?.[0]?.quantity || '0',
                      row.items?.[0]?.unit_cost || '0',
                      row.total || '0',
                      row.status || 'NA',
                      row.created_at ? new Date(row.created_at).toLocaleDateString() : 'NA'
                    ]}
                  />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <RHFAutoComplete
                  control={control}
                  name="category_id"
                  apiUrl="/api/v1/admin/categories/getAllCategories"
                  extraParams={{ is_active: 1 }}
                  placeholder="Select Category"
                  labelinput=""
                  labelKey="name"
                  valueKey="id"
                  required={false}
                />
              </Grid> */}
            </Grid>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={selectedShopId || 'all'} 
            onChange={(e, newValue) => {
              setValue('shop_id', newValue === 'all' ? null : newValue)
            }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All Shops" value="all" />
            {shops.map(shop => (
              <Tab key={shop.id} label={shop.name} value={shop.id} />
            ))}
          </Tabs>
        </Box>
        {viewMode === 'list' ? (
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
        ) : (
          <Grid container spacing={3}>
            {loading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
                  <CommonCard sx={{ '&:hover': { transform: 'none', boxShadow: theme.shadows[2], borderColor: theme.palette.divider } }}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <CommonSkeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: 1 }} />
                      <CommonSkeleton variant="text" width="60%" />
                    </Box>
                    <CommonSkeleton variant="text" width="80%" />
                    <Box sx={{ mt: 2 }}>
                      <CommonSkeleton variant="text" width="40%" />
                      <CommonSkeleton variant="text" width="90%" />
                    </Box>
                  </CommonCard>
                </Grid>
              ))
            ) : rows.length > 0 ? (
              rows.map((item) => (
                <Grid item key={item.id} xs={12} sm={6} md={3} lg={3}>
                  <CardActionArea onClick={() => handleViewUser(item.id)} sx={{ height: "100%" }}>
                    <CommonCard>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, minWidth: 0 }}>
                          <Icon icon="solar:bill-list-linear" fontSize={24} color={theme.palette.primary.main} />
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontSize: "16px",
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item.customer?.name || "NA"}
                          </Typography>
                        </Box>
                        <Box onClick={(e) => e.stopPropagation()}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedItem(item)
                              setOpenEdit(true)
                            }}
                          >
                            <Icon icon="circum:edit" fontSize={20} />
                          </IconButton>
                        </Box>
                      </Box>

                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Product: {item.items?.[0]?.product?.name || 'NA'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Quantity: {item.items?.[0]?.quantity || '0'}
                        </Typography>
                        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700, mt: 1 }}>
                          ₹{item.total || '0'}
                        </Typography>
                      </Box>

                      <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <Typography variant="caption" sx={{ textTransform: 'capitalize', px: 1, py: 0.5, borderRadius: 1, bgcolor: theme.palette.action.hover }}>
                          {item.status || 'NA'}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {new Date(item.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </CommonCard>
                  </CardActionArea>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Typography color="text.secondary">No bills found</Typography>
                </Box>
              </Grid>
            )}
            
            {totalRows > pageSize && (
               <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2">
                      Page {page + 1} of {Math.ceil(totalRows / pageSize)}
                    </Typography>
                    <IconButton disabled={page === 0} onClick={() => setPage(page - 1)}>
                      <Icon icon="mdi:chevron-left" />
                    </IconButton>
                    <IconButton disabled={(page + 1) * pageSize >= totalRows} onClick={() => setPage(page + 1)}>
                      <Icon icon="mdi:chevron-right" />
                    </IconButton>
                  </Box>
               </Grid>
            )}
          </Grid>
        )}
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

export default QuickBill    
