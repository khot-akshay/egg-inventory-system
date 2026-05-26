import React from 'react'
import { Grid, Box } from '@mui/material'
import AddPurchaseForm from 'src/components/staff/purchase/AddPurchase'
import Purchase from 'src/components/staff/purchase/Purchase'

const PurchasePage = () => {
  return (
    <Box>
      <Grid container spacing={3}>
        {/* Left Side: Add Stock Design (4 grid) */}
        <Grid item xs={12} md={4}>
          <AddPurchaseForm />
        </Grid>

        {/* Right Side: Stocks Table (8 grid) */}
        <Grid item xs={12} md={8}>
          <Purchase />
        </Grid>
      </Grid>
    </Box>
  )
}

export default PurchasePage