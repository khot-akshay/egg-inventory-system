import {
  Grid,
  Box,
  Typography,
  IconButton,
  Card,
  useTheme,
  Chip,
  Button,
  Tooltip
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axiosInstance from "src/services/axios";
import EmailModule from "src/components/common/Links/EmailLink";
import MobileNumberModule from "src/components/common/Links/MobileNumberModule";
import moment from "moment";
import GoBack from "src/components/common/goBack/GoBackButton";
import SearchInput from "src/components/common/SearchInput";
import CommonDatagrid from "src/components/common/DatagridData.tsx/CommonDatagrid";
import DateFormateComponent from "src/components/common/dateFormat/DateFromatModule";


export default function ViewCustomer() {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<any>({});
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
      console.error(error);
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
  
        const response = await axiosInstance.get(
          `/api/v1/admin/getAllQuickbills?${params.toString()}`
        )
  
        setRows(response.data.data?.quickbills ?? response.data.data?.data ?? [])
        setTotalRows(response.data.data?.count ?? 0)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    useEffect(() => {
      fetchGame()
    }, [page, pageSize, searchQuery, id])

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
       //           <Icon icon={'ic:outline-delete'} fontSize={24} sx={{ color: 'error.main' }} />
       //         </Button>
       //       </Tooltip>
       //       {/* )} */}
       //     </>
       //   ),
       // },
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
           <Card sx={{ p: 5,mt:3 }}  >
                  <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" sx={{ mb: 3 }}>
          
                    {/* Left Side: Back Button and Title */}
                    <Box display="flex" alignItems="center" gap={2}>
                      <GoBack label="Customer" isBack={false} />
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
                        {/* <Button onClick={() => setOpenAdd(true)} variant="contained" startIcon={<AddCircleOutlineIcon />}>
                          Add Brand
                        </Button> */}
                        {/* {checkPermission('add_brand') && ( */}
                        {/* <Butto onClick={() => setOpenAdd(true)} variant='contained'>
                          Add Customer <AddCircleOutlineIcon sx={{ ml: 1 }} />
                        </Button> */}
          
                        {/* )} */}
          
                      </Grid>
                    </Box>
          
                  </Box>
                  {/* <Grid container spacing={2}>
          
                    <Grid item xs={12} md={8}></Grid>
                    <Grid item xs={12} md={2} >
                      <RHFAutoComplete
                        control={control}
                        name="category_id"
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
        </Grid>
      </Grid>
    </>
  );
}
