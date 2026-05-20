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
import moment from "moment";
import { get } from "src/services/apiCall";
import MobileNumberModule from "src/components/common/Links/MobileNumberModule";
import EmailModule from "src/components/common/Links/EmailLink";
import UpdatePrice from "src/components/admin/vendor/UpdatePrice";

interface VendorData {
  id: number;
  uuid: string;
  shop_id: number;
  name: string;
  phone: string;
  email: string;
  gstin: string;
  address: string;
  payable_balance: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function ViewVendor() {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [vendorData, setVendorData] = useState<VendorData | null>(null);

  const router = useRouter();
  const { id } = router.query;
  const back = router.back;

  const getVendorData = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const url = `/api/v1/admin/getVendorById?id=${id}`;
      const response = await get(url);
      if (response["success"]) {
        setVendorData(response["data"]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getVendorData();
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
          mb: 1,
        }}
      >
        <Grid item xs={12}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={back}
              sx={{
                marginBottom: "15px",
                boxShadow: "none!important",
                color: theme.palette.primary.main,
              }}
              aria-label="back"
            >
              <ArrowBackIcon />
            </IconButton>

            <Typography
              sx={{
                fontWeight: 600,
                fontSize: 20,
                ml: 2,
                color: theme.palette.primary.main,
                mb: "5px",
              }}
            >
              Vendor Details
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          <Card sx={{ height: "auto", p: 4, ml: 1, mr: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 3 }}>
              Basic Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>Name</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {vendorData?.name || "NA"}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>Mobile Number</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {vendorData?.phone ? <MobileNumberModule mobileNo={vendorData.phone} /> : "NA"}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>Email ID</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {vendorData?.email ? <EmailModule email={vendorData.email} /> : "NA"}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>GST Number</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {vendorData?.gstin || "NA"}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>Address</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {vendorData?.address || "NA"}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>Payable Balance</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.error.main }}>
                  ₹ {vendorData?.payable_balance || "0.00"}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>Status</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={vendorData?.is_active ? "Active" : "Inactive"}
                    color={vendorData?.is_active ? "success" : "error"}
                    size="small"
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>Created At</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {vendorData?.created_at ? moment(vendorData.created_at).format("DD MMM YYYY, hh:mm A") : "NA"}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 2 }}>
        <UpdatePrice vendorId={id as string} />
      </Box>
    </>
  );
}
