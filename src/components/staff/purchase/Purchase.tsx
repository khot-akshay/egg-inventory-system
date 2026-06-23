import { Box, Button, Card, CardActionArea, Grid, IconButton, InputAdornment, Stack, Switch, TextField, Tooltip, Typography } from '@mui/material'
import { GridCellParams, GridColDef, GridSearchIcon } from '@mui/x-data-grid'
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/router';
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
import AddProducts from './AddPurchase';
import { useAuth } from 'src/hooks/useAuth';
import RHFAutoComplete from 'src/hook-forms/RHFAutoComplete';
import AddPurchaseForm from './AddPurchase'




interface PurchaseRow {
  id: number
  uuid?: string
  purchase_no?: string
  total_trays?: number | null
  total_eggs?: number
  price_per_egg?: string
  total_amount?: string
  paid_amount?: string
  due_amount?: string
  purchase_date?: string
  status?: string
  notes?: string
  vendor?: {
    id: number
    name: string
  }
  vehicle?: {
    id: number
    registration_number: string
  }
  items?: Array<{
    id: number
    category_id: number
    total_trays?: number | null
    eggs_per_tray?: number | null
    total_eggs: number
    price_per_egg: string
    line_amount: string
    category?: {
      id: number
      name: string
    }
  }>
  created_at?: string | null
  [key: string]: any
}

type SelectOption = {
  label: string
  value: number | string
}

const Purchase = () => {
  const [rows, setRows] = useState<PurchaseRow[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pageSize, setPageSize] = useState(6)
  const [page, setPage] = useState(0)
  const [openAdd, setOpenAdd] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [selectedItem, setSelectedItem] = useState<PurchaseRow | null>(null)
  const [openEdit, setOpenEdit] = useState(false)
  const [searchQuery, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const { user } = useAuth();
  const currentStaffShopId = user?.shop_id || user?.shop?.id;
  const theme = useTheme();
  const router = useRouter()
  const { control, watch } = useForm({
    defaultValues: {
      category_id: null,
      shop_id: null
    }
  })
  const selectedCategoryId = watch('category_id') as number | null
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
    setLoading(true);
    try {
      const params: any = {};
      params.pageNo = String(page);
      params.limit = String(pageSize);
      if (searchQuery) params.global_search = searchQuery;
      if (selectedCategoryId) params.category_id = String(selectedCategoryId);
      // Use selectedShopId if set, otherwise fallback to current staff shop ID
      const shopId = selectedShopId ?? currentStaffShopId;
      if (shopId) params.shop_id = String(shopId);

      const response = await axiosInstance.get('/api/v1/shop/getAllEggVendorPurchases', { params });

      setRows(response.data.data?.purchases ?? []);
      setTotalRows(response.data.data?.count ?? 0);
    } catch (e) {
      } finally {
      setLoading(false);
    }
  };


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

  // Fetch data on filters/pagination change
  useEffect(() => {
    fetchGame();
  }, [page, pageSize, selectedCategoryId, selectedShopId, searchQuery]);

  // Listen for new purchase events
  useEffect(() => {
    const handlePurchaseAdded = () => {
      setPage(0);
      fetchGame();
    };
    window.addEventListener('purchaseAdded', handlePurchaseAdded);
    return () => {
      window.removeEventListener('purchaseAdded', handlePurchaseAdded);
    };
  }, [fetchGame]);







  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
  }
  const handleEditClick = (params: GridCellParams) => {
    setSelectedItem(params.row as PurchaseRow)
    setOpenEdit(true)
  }
  const handleDeleteOpen = (params: GridCellParams) => {
    setSelectedItem(params.row as PurchaseRow)
    setOpenDelete(true)
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

    // {
    //   field: 'purchase_no',
    //   headerName: 'Purchase No.',
    //   flex: 1,
    //   minWidth: 180,
    //   sortable: false,
    //   renderCell: (params: GridCellParams) => (
    //     <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
    //       {params.row?.purchase_no || 'NA'}
    //     </div>
    //   )
    // },
    {
      field: 'vendor_name',
      headerName: 'Vendor',
      flex: 1,
      minWidth: 140,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
          {params.row?.vendor?.name || 'NA'}
        </div>
      )
    },
    {
      field: 'vehicle',
      headerName: 'Vehicle',
      flex: 1,
      minWidth: 140,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
          {params.row?.vehicle?.registration_number || 'NA'}
        </div>
      )
    },
    {
      field: 'driver_name',
      headerName: 'Driver Name',
      flex: 1,
      minWidth: 140,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
          {params.row?.driver?.name || 'NA'}
        </div>
      )
    },

    {
      field: 'category_egg_counts',
      headerName: 'Product (Eggs)',
      flex: 1,
      minWidth: 300,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <Box sx={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
          {params.row.items?.map((item: any) => (
            <div key={item.id}>{`${item.category?.name || 'NA'}: ${item.total_eggs || 0}`}</div>
          )) || 'NA'}
        </Box>
      ),
    },
    {
      field: 'total_eggs',
      headerName: 'Total Eggs',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
          {params.row?.total_eggs ?? 0}
        </div>
      )
    },
    // {
    //   field: 'price_per_egg',
    //   headerName: 'Rate/egg',
    //   flex: 1,
    //   minWidth: 100,
    //   sortable: false,
    //   renderCell: (params: GridCellParams) => (
    //     <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
    //       ₹{params.row?.price_per_egg || '0.00'}
    //     </div>
    //   )
    // },
    // {
    //   field: 'total_amount',
    //   headerName: 'Total Amount',
    //   flex: 1,
    //   minWidth: 130,
    //   sortable: false,
    //   renderCell: (params: GridCellParams) => (
    //     <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
    //       ₹{params.row?.total_amount || '0.00'}
    //     </div>
    //   )
    // },
    // {
    //   field: 'due_amount',
    //   headerName: 'Due Amount',
    //   flex: 1,
    //   minWidth: 130,
    //   sortable: false,
    //   renderCell: (params: GridCellParams) => (
    //     <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
    //       ₹{params.row?.due_amount || '0.00'}
    //     </div>
    //   )
    // },
    // {
    //   field: 'status',
    //   headerName: 'Status',
    //   flex: 1,
    //   minWidth: 100,
    //   sortable: false,
    //   renderCell: (params: GridCellParams) => (
    //     <div style={{ textTransform: 'capitalize' }}>
    //       {params.row?.status || 'NA'}
    //     </div>
    //   )
    // },


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
    //       {/* {checkPermission('update_brand') && ( */}
    //       <Button
    //         sx={{ color: 'text.secondary', margin: '-10px' }}
    //         onClick={() => handleViewUser(params.row.id)}>
    //         <Icon icon={'ph:eye'} fontSize={24} />
    //       </Button>
    //       <Tooltip title='Update Product.' placement='bottom'>
    //         <Button sx={{ color: 'text.secondary', margin: '-10px' }} onClick={() => handleEditClick(params)}>
    //           <Icon icon={'circum:edit'} fontSize={24} />
    //         </Button>
    //       </Tooltip>
    //       {/* )} */}
    //       {/* {checkPermission('delete_brand') && (  */}

    //       <Tooltip title='Delete Product.' placement='bottom'>
    //         <Button
    //           sx={{ color: 'text.secondary', margin: '-10px' }}
    //           onClick={() => handleDeleteOpen(params)}
    //         >
    //           <Icon icon={'ic:outline-delete'} fontSize={24} style={{ color: theme.palette.error.main }} />
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
            <GoBack label="Egg Vendor Purchases" isBack={false} />
          </Grid>
          <Grid item xs={12} md={3}>
            <SearchInput handleSearch={handleSearch} placeHolder="Search purchase no, vendor..." />
          </Grid>
          <Grid item xs={4} md={1} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {/* List View */}
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

            {/* Grid View */}
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

            {/* Download Button */}
            <CommonExport
              data={rows}
              fileName="EggVendorPurchases"
              columns={columns}
              transform={(row, index) => [
                index + 1,
                `"${row.purchase_no || 'NA'}"`,
                `"${row.vendor?.name || 'NA'}"`,
                row.vehicle?.registration_number || 'NA',
                row.total_eggs ?? 0,
                row.price_per_egg || '0.00',
                row.total_amount || '0.00',
                row.due_amount || '0.00',
                row.status || 'NA',
                row.purchase_date ? new Date(row.purchase_date).toLocaleDateString() : 'NA'
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
              handlebtnclick={() => { }}
            />
          </Grid>


        </Grid>
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
                <Grid item key={item.id} xs={12} sm={6} md={4} lg={4}>
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
                            {item.vendor?.name || "NA"}
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
                          Total Eggs: {item.total_eggs ?? 0}
                        </Typography>

                        {/* Items Breakdown */}
                        {item.items && item.items.length > 0 && (
                          <Box sx={{ mt: 1.5 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                              Items:
                            </Typography>
                            {item.items.map((purchaseItem: any, index: number) => (
                              <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.3 }}>
                                <Typography variant="caption" color="text.secondary">
                                  {purchaseItem.category?.name || 'NA'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                  {purchaseItem.total_eggs || 0} eggs
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        )}

                        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700, mt: 1 }}>
                          ₹{item.total_amount || '0.00'}
                        </Typography>
                      </Box>

                      <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ textTransform: 'capitalize', px: 1, py: 0.5, borderRadius: 1, bgcolor: theme.palette.action.hover }}>
                          {item.status || 'NA'}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {item.purchase_date ? new Date(item.purchase_date).toLocaleDateString() : 'NA'}
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
      {openAdd && <AddPurchaseForm open={openAdd} handleClose={() => setOpenAdd(false)} fetchData={fetchGame} />}
      {openDelete && (
        <DeleteDialogPopup show={openDelete} handleclose={() => setOpenDelete(false)} selectedItems={selectedItem?.id}
          fetchData={fetchGame}
          label={'Are you sure! You want to delete.'} apiUrl={'api/v1/admin/products/deleteProducts/'} />
      )}
      {openEdit && (
        <AddPurchaseForm open={openEdit} handleClose={() => setOpenEdit(false)}
          fetchData={fetchGame}
          selectedItem={selectedItem ?? undefined} />
      )}
    </>
  )
}

export default Purchase    
