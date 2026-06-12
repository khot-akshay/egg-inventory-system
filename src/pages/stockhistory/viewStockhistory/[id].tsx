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
import EmailModule from "src/components/common/Links/EmailLink";
import MobileNumberModule from "src/components/common/Links/MobileNumberModule";

export default function ViewStockMovement() {
  const router = useRouter();
  const { id } = router.query;
  const { back } = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [stockDetails, setStockDetails] = useState<any>({});

  const getStockMovement = async () => {
    if (!id) return;

    try {
      setIsLoading(true);

      const response = await axiosInstance.get(
        `/api/v1/admin/getStockMovementById?id=${id}`
      );

      if (response?.data?.success) {
        setStockDetails(response.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getStockMovement();
    }
  }, [id]);

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
              Stock Movement Details
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Stock Movement Information */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card sx={{ p: 4, mx: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 3 }}>
              Stock Movement Information
            </Typography>

            <Grid container spacing={3}>
              

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Movement Type</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.movement_type || "NA"}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Eggs Delta</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.eggs_delta || 0}
                </Typography>
              </Grid>
 
              <Grid item xs={12} md={3}>
                <Typography variant="body2">Shop Balance After</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.shop_balance_after || 0}
                </Typography>
              </Grid>

              

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Created At</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.created_at
                    ? moment(stockDetails.created_at).format(
                        "DD-MM-YYYY HH:mm"
                      )
                    : "NA"}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2">Notes</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.notes || "NA"}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* Shop + Category */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 4, ml: 1, height: "100%" }}>
            <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 3 }}>
              Shop Details
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2">Shop Name</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.shop?.name || "NA"}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2">Shop Code</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.shop?.code || "NA"}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2">City</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.shop?.city || "NA"}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2">Timezone</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.shop?.timezone || "NA"}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 4, mr: 1, height: "100%" }}>
            <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 3 }}>
              Category Details
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2">Category Name</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.category?.name || "NA"}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2">Min Price</Typography>
                <Typography fontWeight={600}>
                  ₹
                  {Number(
                    stockDetails?.category?.egg_price_min || 0
                  ).toFixed(2)}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2">Max Price</Typography>
                <Typography fontWeight={600}>
                  ₹
                  {Number(
                    stockDetails?.category?.egg_price_max || 0
                  ).toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* Creator Details */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card sx={{ p: 4, mx: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 3 }}>
              Created By
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2">Name</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.creator?.name || "NA"}
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="body2">Email</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.creator?.email ? (
                    <EmailModule email={stockDetails.creator.email} />
                  ) : (
                    "NA"
                  )}
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="body2">Phone</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.creator?.phone ? (
                    <MobileNumberModule
                      mobileNo={stockDetails.creator.phone}
                    />
                  ) : (
                    "NA"
                  )}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* Purchase Details */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card sx={{ p: 4, mx: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 3 }}>
              Vendor Purchase Details
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Typography variant="body2">Purchase No</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.reference?.purchase_no || "NA"}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Purchase Date</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.reference?.purchase_date
                    ? moment(
                        stockDetails.reference.purchase_date
                      ).format("DD-MM-YYYY")
                    : "NA"}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Status</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.reference?.status || "NA"}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Total Eggs</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.reference?.total_eggs || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Price Per Egg</Typography>
                <Typography fontWeight={600}>
                  ₹{stockDetails?.reference?.price_per_egg || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Total Amount</Typography>
                <Typography fontWeight={600}>
                  ₹{stockDetails?.reference?.total_amount || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Paid Amount</Typography>
                <Typography fontWeight={600}>
                  ₹{stockDetails?.reference?.paid_amount || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body2">Due Amount</Typography>
                <Typography fontWeight={600}>
                  ₹{stockDetails?.reference?.due_amount || 0}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* Vendor & Vehicle */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 4, ml: 1, height: "100%" }}>
            <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 3 }}>
              Vendor Details
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography>Name</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.reference?.vendor?.name || "NA"}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography>Phone</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.reference?.vendor?.phone || "NA"}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography>Email</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.reference?.vendor?.email || "NA"}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography>Payable Balance</Typography>
                <Typography fontWeight={600}>
                  ₹
                  {Number(
                    stockDetails?.reference?.vendor?.payable_balance || 0
                  ).toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 4, mr: 1, height: "100%" }}>
            <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 3 }}>
              Vehicle & Driver Details
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography>Vehicle</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.reference?.vehicle?.name || "NA"}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography>Registration No</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.reference?.vehicle?.registration_number ||
                    "NA"}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography>Driver Name</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.reference?.driver?.name || "NA"}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography>Driver Phone</Typography>
                <Typography fontWeight={600}>
                  {stockDetails?.reference?.driver?.phone || "NA"}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* Items Table */}
      <Grid container spacing={2} sx={{ mt: 2, mb: 3 }}>
        <Grid item xs={12}>
          <Card sx={{ p: 4, mx: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 3 }}>
              Purchase Items
            </Typography>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Category</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Total Eggs</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Price / Egg</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Amount</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {stockDetails?.reference?.items?.length > 0 ? (
                    stockDetails.reference.items.map(
                      (item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>
                            {item?.category?.name || "NA"}
                          </TableCell>
                          <TableCell>{item?.total_eggs || 0}</TableCell>
                          <TableCell>
                            ₹{item?.price_per_egg || 0}
                          </TableCell>
                          <TableCell>
                            ₹{item?.line_amount || 0}
                          </TableCell>
                        </TableRow>
                      )
                    )
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No Items Found
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