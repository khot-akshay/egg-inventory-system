import React, { useEffect, useState } from "react";
import {
  Grid,
  Box,
  Typography,
  Card,
  TextField,
  Button,
  CircularProgress
} from "@mui/material";
import toast from "react-hot-toast";
import axiosInstance from 'src/services/axios';

interface UpdatePriceProps {
  vendorId: string | number;
}

export default function UpdatePrice({ vendorId }: UpdatePriceProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [prices, setPrices] = useState<{ id: number; category_id: number; price_per_egg: string; name: string }[]>([]);

  const fetchPrices = async () => {
    if (!vendorId) return;
    try {
      setIsLoading(true);
      const url = `/api/v1/admin/getAllVendorEggPrices?vendor_id=${vendorId}`;
      const response = await axiosInstance.get(url);

      if (response.data.success) {
        const fetchedPrices = response.data.data?.prices || [];
        const formattedPrices = fetchedPrices.map((p: any) => ({
          id: p.id,
          category_id: p.category_id,
          price_per_egg: Number(p.price_per_egg).toFixed(2),
          name: p.category?.name || "Unknown Category"
        }));
        setPrices(formattedPrices);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to fetch prices");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [vendorId]);

  const handlePriceChange = (index: number, value: string) => {
    const newPrices = [...prices];
    newPrices[index].price_per_egg = value;
    setPrices(newPrices);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) return;

    try {
      setIsSaving(true);
      const url = `/api/v1/admin/updateVendorEggPrices`;

      // Map the payload as expected by the API
      const payload = {
        items: prices.map(p => ({
          id: p.id,
          price_per_egg: p.price_per_egg
        }))
      };

      const response = await axiosInstance.post(url, payload);

      if (response.data.success) {
        toast.success(response.data.message || "Prices updated successfully");
        fetchPrices(); // Refresh to ensure data is synced
      } else {
        toast.error(response.data.message || "Failed to update prices");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong while updating prices");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={12}>
        <Card sx={{ height: "auto", p: 4, ml: 1, mr: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 3 }}>
            Vendor Egg Prices
          </Typography>

          {isLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {prices.map((item, index) => (
                  <Grid item xs={6} md={2.4} key={item.id || item.category_id}>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
                      {item.name}
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      inputProps={{ step: "0.01", min: "0" }}
                      value={item.price_per_egg}
                      onChange={(e) => handlePriceChange(index, e.target.value)}
                      placeholder="0.00"
                    />
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-start' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSaving}
                >
                  {isSaving ? <CircularProgress size={24} color="inherit" /> : "Update Prices"}
                </Button>
              </Box>
            </form>
          )}
        </Card>
      </Grid>
    </Grid>
  );
}
