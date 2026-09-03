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
import { useAuth } from 'src/hooks/useAuth';
import RHFAutoComplete from 'src/hook-forms/RHFAutoComplete';
import RHFFilterAutocomplete from 'src/hook-forms/RHFFilterAutocomplete';
import ClearIcon from '@mui/icons-material/Clear';
import VendorReportAdapter from './VendorReportAdapter';




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

const VendorPurchaseHistory = () => {
  const [rows, setRows] = useState<PurchaseRow[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(0)
  const [openAdd, setOpenAdd] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [selectedItem, setSelectedItem] = useState<PurchaseRow | null>(null)
  const [openEdit, setOpenEdit] = useState(false)
  const [searchQuery, setQuery] = useState("");
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [vendorTotals, setVendorTotals] = useState<any>({});
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




  const fetchGame = async () => {
    setLoading(true);
    try {
      const params: any = {};
      params.pageNo = String(page);
      params.limit = String(pageSize);
      if (searchQuery) params.global_search = searchQuery;
      if (selectedCategoryId) params.category_id = String(selectedCategoryId);
      if (startDate) params.from = startDate;
      if (endDate) params.to = endDate;
      if (selectedType) params.type = selectedType;

      const { id } = router.query;
      if (id) {
        params.vendor_id = String(id);
      }

      const response = await axiosInstance.get('/api/v1/admin/getVendorPurchaseHistory', { params });

      const fetchedRows = response.data.data?.records ?? response.data.data?.egg_vendor_purchase ?? response.data.data?.data ?? response.data?.records ?? [];
      const uniqueRows = fetchedRows.map((row: any, index: number) => ({
        ...row,
        _original_id: row.id,
        id: row.uuid || `${row.id || 'no-id'}-${index}`
      }));

      setRows(uniqueRows);
      setTotalRows(response.data.data?.total_count ?? response.data.data?.count ?? response.data?.count ?? fetchedRows.length);
      setVendorTotals(response.data.data?.vendor_totals ?? response.data?.vendor_totals ?? {});
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
  }, [selectedCategoryId, selectedShopId, searchQuery, startDate, endDate, selectedType])

  // Fetch data on filters/pagination change
  useEffect(() => {
    if (!router.isReady) return;
    fetchGame();
  }, [page, pageSize, selectedCategoryId, selectedShopId, searchQuery, startDate, endDate, selectedType, router.isReady, router.query.id]);

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
    {
      field: 'notes',
      headerName: 'note',
      flex: 1,
      minWidth: 140,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const text = params.row?.direction === 'out'
          ? (params.row?.description || 'NA')
          : (params.row?.notes || params.row?.purchase_no || 'NA');
        return (
          <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
            {text}
          </div>
        );
      }
    },
    // {
    //   field: 'vendor_name',
    //   headerName: 'Vendor',
    //   flex: 1,
    //   minWidth: 140,
    //   sortable: false,
    //   renderCell: (params: GridCellParams) => (
    //     <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
    //       {params.row?.vendor?.name || 'NA'}
    //     </div>
    //   )
    // },
    {
      field: 'vehicle',
      headerName: 'Vehicle',
      flex: 0.8,
      minWidth: 120,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
          {params.row?.vehicle?.registration_number || params.row?.vehicle?.name || 'NA'}
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
      headerName: 'Product & Quantity',
      flex: 1.5,
      minWidth: 300,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const items = params.row?.items || [];
        if (!items.length) return <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>NA</div>;
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, py: 1 }}>
            {items.map((item: any, idx: number) => (
              <div key={item.id || idx} style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5, fontSize: '0.85rem' }}>
                {item.category?.name || 'Unknown'} : {Number(item.total_eggs || item.quantity || 0)}
              </div>
            ))}
          </Box>
        );
      }
    },
    {
      field: 'price_per_egg',
      headerName: 'Product Rate',
      flex: 1,
      minWidth: 160,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const items = params.row?.items || [];
        if (!items.length) return <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>0</div>;
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, py: 1 }}>
            {items.map((item: any, idx: number) => (
              <div key={item.id || idx} style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5, fontSize: '0.85rem' }}>
                ₹{Number(item.price_per_egg || item.unit_cost || 0).toFixed(2)}
              </div>
            ))}
          </Box>
        );
      }
    },
    {
      field: 'line_amount',
      headerName: 'Product Price',
      flex: 1,
      minWidth: 160,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const items = params.row?.items || [];
        if (!items.length) return <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>0</div>;
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, py: 1 }}>
            {items.map((item: any, idx: number) => (
              <div key={item.id || idx} style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5, fontSize: '0.85rem' }}>
                ₹{Number(item.line_amount || item.line_total || 0).toFixed(2)}
              </div>
            ))}
          </Box>
        );
      }
    },
    {
      field: 'paid_amount',
      headerName: 'Paid',
      flex: 1,
      minWidth: 100,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const paid = params.row?.direction === 'out' ? params.row?.amount : (params.row?.amount || 0);
        return (
          <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
            ₹{Number(paid || 0).toFixed(2)}
          </div>
        );
      }
    },
    // {
    //   field: 'due_amount',
    //   headerName: 'Due Amount',
    //   flex: 1,
    //   minWidth: 110,
    //   sortable: false,
    //   renderCell: (params: GridCellParams) => (
    //     <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5, color: Number(params.row?.due_amount || 0) > 0 ? '#d32f2f' : 'inherit' }}>
    //       ₹{Number(params.row?.due_amount || 0).toFixed(2)}
    //     </div>
    //   )
    // },
    {
      field: 'total_amount',
      headerName: 'Total Bill',
      flex: 1,
      minWidth: 110,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5, fontWeight: 600 }}>
          ₹{Number(params.row?.total_amount || 0).toFixed(2)}
        </div>
      )
    },
    {
      field: 'balance_due',
      headerName: 'Balance',
      flex: 1,
      minWidth: 110,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5, color: Number(params.row?.due_amount || 0) > 0 ? '#d32f2f' : 'inherit' }}>
          ₹{Number(params.row?.balance || 0).toFixed(2)}
        </div>
      )
    },
    {
      field: 'created_at',
      headerName: 'Created Date',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <DateFormateComponent date={params.row?.created_at ?? params.row?.purchase_date ?? ''} />
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
      {vendorTotals && Object.keys(vendorTotals).length > 0 && (
        <Card sx={{ p: 5, mb: 3 }}>
          <Box sx={{ mb: 0 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Card sx={{ p: 3, bgcolor: '#e3f2fd', color: '#1565c0', boxShadow: 'none', border: '1px solid #bbdefb', borderRadius: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Total Amount</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>₹{Number(vendorTotals.total_amount || 0).toFixed(2)}</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ p: 3, bgcolor: '#e8f5e9', color: '#2e7d32', boxShadow: 'none', border: '1px solid #c8e6c9', borderRadius: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Paid Amount</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>₹{Number(vendorTotals.paid_amount || 0).toFixed(2)}</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ p: 3, bgcolor: '#ffebee', color: '#c62828', boxShadow: 'none', border: '1px solid #ffcdd2', borderRadius: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Due Amount</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>₹{Number(vendorTotals.due_amount || 0).toFixed(2)}</Typography>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Card>
      )}

      <Card sx={{ p: 3 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} md={3} >
            <GoBack label="Egg Vendor Purchases" isBack={false} />
          </Grid>
          <Grid item xs={12} md={9} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
            {/* <Grid item xs={12} sm="auto">
              <SearchInput handleSearch={handleSearch} placeHolder="Search purchase no, vendor..." />
            </Grid> */}
            <Grid item xs={12} sm="auto">
              <RHFFilterAutocomplete
                options={[{ label: 'All', value: '' }, { label: 'Cashbook', value: 'cashbook' }, { label: 'Purchase', value: 'purchase' }]}
                labelKey="label"
                value={selectedType ? { label: selectedType.charAt(0).toUpperCase() + selectedType.slice(1), value: selectedType } : { label: 'All', value: '' }}
                onChange={(newValue) => setSelectedType(newValue?.value || '')}
                label="Type"
                placeholder="Select Type"
                minWidth={150}
              />
            </Grid>
            <Grid item xs={12} sm="auto">
              <TextField
                label="Start Date"
                type="date"
                size="small"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 160 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setStartDate('')}
                        edge="end"
                        aria-label="clear start date"
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm="auto">
              <TextField
                label="End Date"
                type="date"
                size="small"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: startDate }}
                sx={{ minWidth: 160 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setEndDate('')}
                        edge="end"
                        aria-label="clear end date"
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm="auto">
              <Button
                variant="outlined"
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                  setSelectedType('')
                }}
              >
                Reset
              </Button>
            </Grid>
            <Grid item xs={12} sm="auto">
              <VendorReportAdapter
                searchQuery={searchQuery}
                rowsPerPage={pageSize}
                startDate={startDate}
                endDate={endDate}
                selectedType={selectedType}
                vendorId={router.query.id as string}
                selectedCategoryId={selectedCategoryId}
              />
            </Grid>
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

    </>
  )
}

export default VendorPurchaseHistory    
