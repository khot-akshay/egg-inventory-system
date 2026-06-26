import React from 'react'
import { Grid, Box } from '@mui/material'
import AddDistributorQuickBill from 'src/components/distributor/quickbill/AddDistributorQuickBill'
import DistributorQuickbillDashboard from 'src/components/distributor/quickbill/DistributorQuickbillDashboard'

const DistributorQuickBillPage = () => {
  return (
    <Box>
      <Grid container spacing={3}>
        {/* Left Side: Add Stock Design (4 grid) */}
        <Grid item xs={12} md={4}>
          <AddDistributorQuickBill />
        </Grid>

        {/* Right Side: Stocks Table (8 grid) */}
        <Grid item xs={12} md={8}>
          <DistributorQuickbillDashboard />
        </Grid>
      </Grid>
    </Box>
  )
}

export default DistributorQuickBillPage