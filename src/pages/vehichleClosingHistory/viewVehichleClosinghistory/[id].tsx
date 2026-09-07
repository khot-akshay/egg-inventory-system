import React, { useEffect, useState } from "react";
import {
  Grid,
  Box,
  Typography,
  IconButton,
  Card,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import moment from "moment";
import { useRouter } from "next/router";
import axiosInstance from "src/services/axios";

export default function viewVehichleClosinghistory() {
  const router = useRouter();
  const { id, egg_vendor_purchase_id } = router.query;
  const { back } = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [stockDetails, setStockDetails] = useState<any>({});

  const getStockMovement = async () => {
    if (!id || !egg_vendor_purchase_id) return;

    try {
      setIsLoading(true);

      const response = await axiosInstance.get(
        `/api/v1/admin/getVehicleCloseById?id=${id}&egg_vendor_purchase_id=${egg_vendor_purchase_id}`
      );

      if (response?.data?.success) {
        setStockDetails(response.data.data);
      }
    } catch (error) {
      } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id && egg_vendor_purchase_id) {
      getStockMovement();
    }
  }, [id, egg_vendor_purchase_id]);

  return (
    <>
      {/* Header */}
      <Grid
        container
        spacing={2}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row",
          pl: 4,
          pr: 7,
          mb: 3,
        }}
      >
        <Grid item xs={12}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={back}
              sx={{
                marginBottom: "15px",
                boxShadow: "none !important",
                color: "#3598DB",
              }}
            >
              <ArrowBackIcon />
            </IconButton>

            <Typography
              sx={{
                fontWeight: 600,
                fontSize: 22,
                ml: 2,
                color: "#3598DB",
                mb: "15px",
              }}
            >
              Vehicle Closing History Details
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Basic Information */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card sx={{ p: 4, mx: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 3 }}>
              Basic Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Typography variant="body2">Purchase No</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.purchase_no || "NA"}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Vendor Name</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.vendor_name || "NA"}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Vehicle</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.vehicle || "NA"}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Status</Typography>
                <Typography fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                  {stockDetails?.status || "NA"}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Total Eggs</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.total_eggs || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Remaining Eggs</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.remaining_eggs || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Expense Date</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.expense_date
                    ? moment(stockDetails.expense_date).format("DD-MM-YYYY")
                    : "NA"}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Total Expense Amount</Typography>
                <Typography fontWeight={600}>
                  ₹{stockDetails?.expense_amount || 0}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* Loaded Eggs */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card sx={{ p: 4, mx: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 3 }}>
              Loaded Eggs
            </Typography>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell><strong>Count</strong></TableCell>
                    <TableCell><strong>Remaining</strong></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {stockDetails?.loaded?.length > 0 ? (
                    stockDetails.loaded.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{item?.category || "NA"}</TableCell>
                        <TableCell>{item?.count || 0}</TableCell>
                        <TableCell>{item?.remaining || 0}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No Loaded Data Found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>

      {/* Customer Sell */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card sx={{ p: 4, mx: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 3 }}>
              Customer Sell Summary
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2">Total Amount</Typography>
                <Typography fontWeight={600}>
                  ₹{stockDetails?.customer_sell?.total_amount || 0}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell><strong>Count</strong></TableCell>
                    <TableCell><strong>Amount</strong></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {stockDetails?.customer_sell?.categories?.length > 0 ? (
                    stockDetails.customer_sell.categories.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{item?.category || "NA"}</TableCell>
                        <TableCell>{item?.count || 0}</TableCell>
                        <TableCell>₹{item?.amount || 0}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No Customer Sell Data Found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>

      {/* Expenses */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card sx={{ p: 4, mx: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 3 }}>
              Expenses
            </Typography>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell><strong>Amount</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {stockDetails?.expenses?.length > 0 ? (
                    stockDetails.expenses.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{item?.category || "NA"}</TableCell>
                        <TableCell>₹{item?.amount || 0}</TableCell>
                        <TableCell>{item?.description || "NA"}</TableCell>
                        <TableCell>
                          {item?.expense_date
                            ? moment(item.expense_date).format("DD-MM-YYYY")
                            : "NA"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No Expenses Found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>

      {/* Profit/Loss */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card sx={{ p: 4, mx: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 3 }}>
              Profit/Loss Summary
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Typography variant="body2">Sales Revenue</Typography>
                <Typography fontWeight={600}>
                  ₹{stockDetails?.profit_loss?.sales_revenue || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Sales Eggs</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.profit_loss?.sales_eggs || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Paid Collected</Typography>
                <Typography fontWeight={600}>
                  ₹{stockDetails?.profit_loss?.paid_collected || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Balance Due</Typography>
                <Typography fontWeight={600}>
                  ₹{stockDetails?.profit_loss?.balance_due || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Purchase Cost</Typography>
                <Typography fontWeight={600}>
                  ₹{stockDetails?.profit_loss?.purchase_cost || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Vendor Purchase Total</Typography>
                <Typography fontWeight={600}>
                  ₹{stockDetails?.profit_loss?.vendor_purchase_total || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Expense Amount</Typography>
                <Typography fontWeight={600}>
                  ₹{stockDetails?.profit_loss?.expense_amount || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Gross Profit</Typography>
                <Typography fontWeight={600}>
                  ₹{stockDetails?.profit_loss?.gross_profit || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Net Profit</Typography>
                <Typography 
                  fontWeight={600}
                  sx={{ 
                    color: stockDetails?.profit_loss?.net_profit >= 0 ? 'green' : 'red' 
                  }}
                >
                  ₹{stockDetails?.profit_loss?.net_profit || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Status</Typography>
                <Typography 
                  fontWeight={600}
                  sx={{ 
                    textTransform: 'capitalize',
                    color: stockDetails?.profit_loss?.status === 'profit' ? 'green' : 'red' 
                  }}
                >
                  {stockDetails?.profit_loss?.status || "NA"}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography sx={{ fontWeight: 600, fontSize: 18, mb: 2 }}>
              Category-wise Profit/Loss
            </Typography>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell><strong>Loaded Eggs</strong></TableCell>
                    <TableCell><strong>Remaining Eggs</strong></TableCell>
                    <TableCell><strong>Sales Eggs</strong></TableCell>
                    <TableCell><strong>Sales Revenue</strong></TableCell>
                    <TableCell><strong>Price/Egg</strong></TableCell>
                    <TableCell><strong>Purchase Cost</strong></TableCell>
                    <TableCell><strong>Gross Profit</strong></TableCell>
                    <TableCell><strong>Expense Amount</strong></TableCell>
                    <TableCell><strong>Net Profit</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {stockDetails?.profit_loss?.categories?.length > 0 ? (
                    stockDetails.profit_loss.categories.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{item?.category || "NA"}</TableCell>
                        <TableCell>{item?.loaded_eggs || 0}</TableCell>
                        <TableCell>{item?.remaining_eggs || 0}</TableCell>
                        <TableCell>{item?.sales_eggs || 0}</TableCell>
                        <TableCell>₹{item?.sales_revenue || 0}</TableCell>
                        <TableCell>₹{item?.price_per_egg || 0}</TableCell>
                        <TableCell>₹{item?.purchase_cost || 0}</TableCell>
                        <TableCell>₹{item?.gross_profit || 0}</TableCell>
                        <TableCell>₹{item?.expense_amount || 0}</TableCell>
                        <TableCell>₹{item?.net_profit || 0}</TableCell>
                        <TableCell 
                          sx={{ 
                            color: item?.status === 'profit' ? 'green' : 'red',
                            textTransform: 'capitalize'
                          }}
                        >
                          {item?.status || "NA"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} align="center">
                        No Category Data Found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>

      {/* Payment Summary */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card sx={{ p: 4, mx: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 3 }}>
              Payment Summary
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Typography variant="body2">Cash</Typography>
                <Typography fontWeight={600}>
                  ₹{stockDetails?.payment_summary?.cash || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Online</Typography>
                <Typography fontWeight={600}>
                  ₹{stockDetails?.payment_summary?.online || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">UPI</Typography>
                <Typography fontWeight={600}>
                  ₹{stockDetails?.payment_summary?.upi || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Card</Typography>
                <Typography fontWeight={600}>
                  ₹{stockDetails?.payment_summary?.card || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Credit</Typography>
                <Typography fontWeight={600}>
                  ₹{stockDetails?.payment_summary?.credit || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Mixed</Typography>
                <Typography fontWeight={600}>
                  ₹{stockDetails?.payment_summary?.mixed || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Other</Typography>
                <Typography fontWeight={600}>
                  ₹{stockDetails?.payment_summary?.other || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Total</Typography>
                <Typography fontWeight={600}>
                  ₹{stockDetails?.payment_summary?.total || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Expense Amount</Typography>
                <Typography fontWeight={600}>
                  ₹{stockDetails?.payment_summary?.expense_amount || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Total Cash</Typography>
                <Typography fontWeight={600}>
                  ₹{stockDetails?.payment_summary?.total_cash || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Cash in Hand</Typography>
                <Typography fontWeight={600}>
                  ₹{stockDetails?.payment_summary?.cash_in_hand || 0}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* Egg Sale Summary */}
      <Grid container spacing={2} sx={{ mt: 2, mb: 3 }}>
        <Grid item xs={12}>
          <Card sx={{ p: 4, mx: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 3 }}>
              Egg Sale Summary
            </Typography>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell><strong>Total Quantity</strong></TableCell>
                    <TableCell><strong>Total Amount</strong></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {stockDetails?.egg_sale_summary?.length > 0 ? (
                    stockDetails.egg_sale_summary.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{item?.category_name || "NA"}</TableCell>
                        <TableCell>{item?.total_quantity || 0}</TableCell>
                        <TableCell>₹{item?.total_amount || 0}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No Sale Summary Found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}