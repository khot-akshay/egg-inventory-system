import {
  Grid,
  Box,
  Typography,
  IconButton,
  Card,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import moment from "moment";
import { get } from "src/services/apiCall";
import EmailModule from "src/components/common/Links/EmailLink";
import MobileNumberModule from "src/components/common/Links/MobileNumberModule";
import axiosInstance from "src/services/axios";

export default function ViewExpense() {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [expenseDetails, setExpenseDetails] = useState<any>({});
  
  const router = useRouter();
  const { id } = router.query;
  const { back } = useRouter();

  const getAllData = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const url = `/api/v1/shop/getExpenseById?id=${id}`;
      const response = await axiosInstance.get(url);
      if (response.data.success) {
        setIsLoading(false);
        setExpenseDetails(response.data.data);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      }
  };

  useEffect(() => {
    if (id) {
      getAllData();
    }
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
          mb: 3,
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
              Staff Expense Details
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
          <Card sx={{ height: "auto", p: 4, ml: 1 }} className="bg-gray-50">
            <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 3 }}>
              Expense Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3} sx={{ mb: 2 }}>
                <Typography variant="body1">Expense ID</Typography>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  {expenseDetails?.id ? `#${expenseDetails.id}` : "NA"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3} sx={{ mb: 2 }}>
                <Typography variant="body1">Expense Date</Typography>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  {expenseDetails?.expense_date ? moment(expenseDetails.expense_date).format("DD-MM-YYYY") : "NA"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3} sx={{ mb: 2 }}>
                <Typography variant="body1">Category</Typography>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  <span style={{ textTransform: "capitalize" }}>
                    {expenseDetails?.category || "NA"}
                  </span>
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body1">Amount</Typography>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  {expenseDetails?.amount ? `₹${expenseDetails.amount}` : "NA"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={12}>
                <Typography variant="body1">Description</Typography>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  {expenseDetails?.description || "NA"}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%", p: 4, ml: 1 }} className="bg-gray-50">
            <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 3 }}>
              Shop Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sx={{ mb: 2 }}>
                <Typography variant="body1">Shop Name</Typography>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  {expenseDetails?.shop?.name || "NA"}
                </Typography>
              </Grid>
              <Grid item xs={12} sx={{ mb: 2 }}>
                <Typography variant="body1">Shop Code</Typography>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  {expenseDetails?.shop?.code || "NA"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">City</Typography>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  {expenseDetails?.shop?.city || "NA"}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%", p: 4, mr: 1 }} className="bg-gray-50">
            <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 3 }}>
              User Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sx={{ mb: 2 }}>
                <Typography variant="body1">Name</Typography>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  {expenseDetails?.user?.name || "NA"}
                </Typography>
              </Grid>
              <Grid item xs={12} sx={{ mb: 2 }}>
                <Typography variant="body1">Email</Typography>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  {expenseDetails?.user?.email ? (
                    <EmailModule email={expenseDetails.user.email} />
                  ) : (
                    "NA"
                  )}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">Phone</Typography>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  {expenseDetails?.user?.phone ? (
                    <MobileNumberModule mobileNo={expenseDetails.user.phone} />
                  ) : (
                    "NA"
                  )}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
