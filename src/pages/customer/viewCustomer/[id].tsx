import {
  Grid,
  Box,
  Typography,
  IconButton,
  Card,
  useTheme,
  Chip
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axiosInstance from "src/services/axios";
import EmailModule from "src/components/common/Links/EmailLink";
import MobileNumberModule from "src/components/common/Links/MobileNumberModule";
import moment from "moment";

export default function ViewCustomer() {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<any>({});
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
        </Grid>

       
      </Grid>
    </>
  );
}
