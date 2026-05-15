import React from 'react'
import { Grid, Box } from '@mui/material'
import AddQuickBillForm from 'src/components/staff/quickbill/AddQuickBill'
import QuickBill from 'src/components/staff/quickbill/QuickBill'
import QuickBillDashboard from 'src/components/staff/quickbill/QuickbillDashboard'

const StocksPage = () => {
  return (
    <Box>
      <Grid container spacing={3}>
        {/* Left Side: Add Stock Design (4 grid) */}
        <Grid item xs={12} md={4}>
          <AddQuickBillForm />
        </Grid>

        {/* Right Side: Stocks Table (8 grid) */}
        <Grid item xs={12} md={8}>
          <QuickBillDashboard />
        </Grid>
      </Grid>
    </Box>
  )
}

export default StocksPage