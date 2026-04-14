import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Grid,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const EstimatedFareDialog = ({ open, onClose, newData }) => {
  console.log(newData, "newData");

  // ✅ Format numbers safely with toFixed(2)
  const formatCurrency = (value) => `₹ ${(Number(value) || 0).toFixed(2)}`;
  const formatDistance = (value) => `${(Number(value) || 0).toFixed(2)} KM`;

  // ✅ Prepare structured data
  const data = {
    estimated: {
      distance: formatDistance(newData?.temp_distance),
      tripFare: formatCurrency(newData?.temp_fare),
      gst: formatCurrency(newData?.temp_gst ?? newData?.gst ?? 0),
      total: formatCurrency(newData?.temp_total),
    },
    actual: {
      distance: formatDistance(newData?.final_distance),
      tripFare: formatCurrency(newData?.final_fare),
      gst: formatCurrency(newData?.final_gst ?? newData?.gst ?? 0),
      total: formatCurrency(newData?.total),
    },
    difference: {
      distance: formatDistance(
        (newData?.final_distance ?? 0) - (newData?.temp_distance ?? 0)
      ),
      tripFare: formatCurrency(
        (newData?.final_fare ?? 0) - (newData?.temp_fare ?? 0)
      ),
      gst: formatCurrency(
        (newData?.final_gst ?? 0) - (newData?.temp_gst ?? 0)
      ),
      total: formatCurrency(
        (newData?.total ?? 0) - (newData?.temp_total ?? 0)
      ),
    },
  };

  // ✅ Card row for each section
  const renderRow = (label, values) => (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        backgroundColor: "#fff",
      }}
    >
      <Typography variant="subtitle1" fontWeight={600} mb={1}>
        {label}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Typography variant="body2" color="text.secondary">
            Distance
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {values.distance}
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="body2" color="text.secondary">
            Trips Fare
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {values.tripFare}
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="body2" color="text.secondary">
            GST Amount
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {values.gst}
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="body2" color="text.secondary">
            Total Trip Amount
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {values.total}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pr: 1,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Estimated vs Actual Fare
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent dividers sx={{ backgroundColor: "#fafafa" }}>
        <Typography variant="body2" color="text.secondary" mb={2}>
          A quick comparison of your estimated fare and the actual amount calculated after trip
          completion.
        </Typography>

        {renderRow("Estimated Trip Fare", data.estimated)}
        {renderRow("Actual Trip Fare", data.actual)}
        {renderRow("Difference Fare", data.difference)}
      </DialogContent>
    </Dialog>
  );
};

export default EstimatedFareDialog;
