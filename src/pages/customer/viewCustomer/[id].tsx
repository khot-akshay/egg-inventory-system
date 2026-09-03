import {
  Grid,
  Box,
  Typography,
  IconButton,
  Card,
  useTheme,
  Chip,
  Button,
  Tooltip,
  TextField,
  InputAdornment
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ClearIcon from "@mui/icons-material/Clear";
import axiosInstance from "src/services/axios";
import EmailModule from "src/components/common/Links/EmailLink";
import MobileNumberModule from "src/components/common/Links/MobileNumberModule";
import moment from "moment";
import GoBack from "src/components/common/goBack/GoBackButton";
import SearchInput from "src/components/common/SearchInput";
import CommonDatagrid from "src/components/common/DatagridData.tsx/CommonDatagrid";
import DateFormateComponent from "src/components/common/dateFormat/DateFromatModule";
import RHFFilterAutocomplete from "src/hook-forms/RHFFilterAutocomplete";
import CustomerReportAdapter from "./CustomerReportAdapter";


export default function ViewCustomer() {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<any>({});
  const [rows, setRows] = useState<CategoryRow[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(0)
  const [customerTotals, setCustomerTotals] = useState<any>({})
  const [openAdd, setOpenAdd] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [selectedItem, setSelectedItem] = useState<CategoryRow | null>(null)
  const [openEdit, setOpenEdit] = useState(false)
  const [searchQuery, setQuery] = useState("");
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const router = useRouter();
  const { id } = router.query;
  const { back } = useRouter();

  const getAllData = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const url = `/api/v1/admin/getCustomerById?id=${id}`;
      const response = await axiosInstance.get(url);
      if (response.data["success"]) {
        setIsLoading(false);
        setCustomerDetails(response.data["data"]);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllData();
  }, [id]);

  const fetchGame = async () => {
    if (!id) return;
    setLoading(true)
    try {
      const params = new URLSearchParams({
        pageNo: String(page),
        limit: String(pageSize),
        customer_id: String(id) // dynamically passing the customer id from the route
      })

      if (searchQuery) params.append('global_search', searchQuery)
      if (startDate) params.append('from', startDate)
      if (endDate) params.append('to', endDate)
      if (selectedType) params.append('type', selectedType)

      const response = await axiosInstance.get(
        `/api/v1/admin/getAllQuickbills?${params.toString()}`
      )

      const fetchedRows = response.data.data?.records ?? response.data.data?.data ?? [];
      const uniqueRows = fetchedRows.map((row: any, index: number) => ({
        ...row,
        _original_id: row.id,
        id: row.uuid || `${row.id || 'no-id'}-${index}`
      }));
      setRows(uniqueRows);
      setTotalRows(response.data.data?.total_count ?? 0)
      setCustomerTotals(response.data.data?.customer_totals ?? {})
    } catch (e) {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGame()
  }, [page, pageSize, searchQuery, id, startDate, endDate, selectedType])

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
      headerName: 'note',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
          {params.row?.description || 'NA'}
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
      headerName: 'Paid',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        if (params.row?.type === 'quickbill') {
          const payments = params.row?.meta?.payments || [];
          const nonCreditPayments = payments.filter((p: any) => p.payment_type !== 'credit');
          if (!nonCreditPayments.length) {
            return (
              <div style={{ textTransform: 'capitalize', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
                {params.row?.status || 'NA'}
              </div>
            );
          }
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, height: '100%', justifyContent: 'center' }}>
              {nonCreditPayments.map((p: any, i: number) => (
                <div key={i} style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5, textTransform: 'capitalize' }}>
                  {p.payment_type} : ₹{p.amount}
                </div>
              ))}
            </Box>
          );
        }
        return (
          <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
            ₹{params.row?.amount || '0'}
          </div>
        );
      }
    },
    {
      field: 'status',
      headerName: 'credit',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const payments = params.row?.meta?.payments || [];
        const creditPayments = payments.filter((p: any) => p.payment_type === 'credit');

        if (!creditPayments.length) {
          return (
            <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
              -
            </div>
          );
        }

        const balanceDue = params.row?.balance_due ?? '0';

        return (
          <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5, textTransform: 'capitalize' }}>
            Credit : ₹{balanceDue}
          </div>
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

    {
      field: 'balance_due',
      headerName: 'Balance',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
          ₹{params.row?.balance || '0'}
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
        <DateFormateComponent date={params.row?.created_at ?? ''} />
      )
    },

  ]

  return (
    <>
      <Grid
        container
        spacing={2}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row",
          pl: 4,
          pr: 7,
          mb: 2,
        }}
      >
        <Grid item xs={12} md={10}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={back}
              sx={{
                marginBottom: "15px",
                boxShadow: "none!important",
                color: "#3598DB",
              }}
              aria-label="back"
            >
              <ArrowBackIcon sx={{ color: "#3598DB" }} />
            </IconButton>

            <Typography
              sx={{
                fontWeight: 600,
                fontSize: 20,
                ml: 2,
                color: "#3598DB",
                mb: "15px",
              }}
            >
              Customer Details
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Grid
        container
        spacing={2}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row",
        }}
      >
        <Grid item xs={12} md={12}>
          <Card sx={{ height: "auto", p: 4, ml: 0 }} className="bg-gray-50">
            <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 3 }}>
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12} sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4} sx={{ mb: 2 }}>
                    <Typography variant="body1">Shop Name</Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {customerDetails?.shop?.name || "NA"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ mb: 2 }}>
                    <Typography variant="body1">Name</Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {customerDetails?.name || "NA"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ mb: 2 }}>
                    <Typography variant="body1">Due Amount</Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600, color: customerDetails?.deu_amount > 0 ? "error.main" : "inherit" }}
                    >
                      {customerDetails?.deu_amount !== undefined ? `₹${customerDetails.deu_amount}` : "NA"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ mb: 2 }}>
                    <Typography variant="body1">Phone</Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {customerDetails?.phone ? <MobileNumberModule mobileNo={customerDetails.phone} /> : "NA"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ mb: 2 }}>
                    <Typography variant="body1">Email</Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {customerDetails?.email ? <EmailModule email={customerDetails.email} /> : "NA"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ mb: 2 }}>
                    <Typography variant="body1">Credit Limit</Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {customerDetails?.credit_limit ? `₹${customerDetails.credit_limit}` : "NA"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ mb: 2 }}>
                    <Typography variant="body1">Shop City</Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {customerDetails?.shop?.city || "NA"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ mb: 2 }}>
                    <Typography variant="body1">Status</Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {customerDetails?.is_active !== undefined ? (
                        <Chip
                          label={customerDetails.is_active ? "Active" : "Inactive"}
                          color={customerDetails.is_active ? "success" : "error"}
                          size="small"
                        />
                      ) : "NA"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ mb: 2 }}>
                    <Typography variant="body1">Created At</Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {customerDetails?.created_at ? moment(customerDetails.created_at).format("DD MMM YYYY, hh:mm A") : "NA"}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Card>

          <Card sx={{ p: 5, mt: 3 }}  >
            {customerTotals && Object.keys(customerTotals).length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ p: 3, bgcolor: '#e3f2fd', color: '#1565c0', boxShadow: 'none', border: '1px solid #bbdefb', borderRadius: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Total Amount</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>₹{Number(customerTotals.total_amount || 0).toFixed(2)}</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ p: 3, bgcolor: '#e8f5e9', color: '#2e7d32', boxShadow: 'none', border: '1px solid #c8e6c9', borderRadius: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Paid Amount</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>₹{Number(customerTotals.paid_amount || 0).toFixed(2)}</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ p: 3, bgcolor: '#ffebee', color: '#c62828', boxShadow: 'none', border: '1px solid #ffcdd2', borderRadius: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Due Amount</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>₹{Number(customerTotals.due_amount || 0).toFixed(2)}</Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Card>

          <Card sx={{ p: 5, mt: 3 }}>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {/* Left Side: Back Button and Title */}
              <Grid item xs={12} md={4}>
                <GoBack label="Customer" isBack={false} />
              </Grid>

              {/* Right Side: Filters */}
              <Grid item xs={12} md={8} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'flex-end' }}>

                <Grid item xs={12} sm="auto">
                  <RHFFilterAutocomplete
                    options={[{ label: 'All', value: '' }, { label: 'Cashbook', value: 'cashbook' }, { label: 'Quickbill', value: 'quickbill' }]}
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
                  <CustomerReportAdapter
                    searchQuery={searchQuery}
                    rowsPerPage={pageSize}
                    startDate={startDate}
                    endDate={endDate}
                    selectedType={selectedType}
                    customerId={id as string}
                  />
                </Grid>
                {/* <Button onClick={() => setOpenAdd(true)} variant="contained" startIcon={<AddCircleOutlineIcon />}>
                          Add Brand
                        </Button> */}
                {/* {checkPermission('add_brand') && ( */}
                {/* <Butto onClick={() => setOpenAdd(true)} variant='contained'>
                          Add Customer <AddCircleOutlineIcon sx={{ ml: 1 }} />
                        </Button> */}

                {/* )} */}

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
        </Grid>
      </Grid>
    </>
  );
}
