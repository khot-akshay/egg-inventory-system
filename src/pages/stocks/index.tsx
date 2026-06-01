import React from 'react'
import { Grid, Box } from '@mui/material'
import Stocks from 'src/components/admin/stocks/Stocks'
import AddStocksForm from 'src/components/admin/stocks/AddStocks'

const StocksPage = () => {
  return (
    // <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Grid container spacing={3}>
        {/* Left Side: Add Stock Design (4 grid) */}
        <Grid item xs={12} md={4}>
          <AddStocksForm />
        </Grid>

        {/* Right Side: Stocks Table (8 grid) */}
        <Grid item xs={12} md={8}>
          <Stocks />
        </Grid>
      </Grid>
    // </Box>
  )
}

export default StocksPage