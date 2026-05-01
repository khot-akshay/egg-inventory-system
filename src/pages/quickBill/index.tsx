import React from 'react'
import { Grid, Box } from '@mui/material'
import Stocks from 'src/components/admin/stocks/Stocks'
import AddStocksForm from 'src/components/admin/stocks/AddStocks'
import AddQuickBillForm from 'src/components/admin/quickbill/AddQuickBill'
import QuickBill from 'src/components/admin/quickbill/QuickBill'

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
          <QuickBill />
        </Grid>
      </Grid>
    </Box>
  )
}

export default StocksPage