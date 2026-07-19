import React from 'react'
import { Box, Grid } from '@mui/material'

import DisributorDashboard from 'src/components/admin/disributorDashboard/DisributorDashboard'

const DistributorDashboardPage = () => {
  return (
    

    <Box>
          <Grid container spacing={3}>
            {/* Left Side: Add Stock Design (4 grid) */}
            {/* <Grid item xs={12} md={4}>
      <AddDayTrip/>
            </Grid> */}
    
            {/* Right Side: Stocks Table (8 grid) */}
            <Grid item xs={12} md={12}>
      <DisributorDashboard />
            </Grid>
          </Grid>
        </Box>
  )
}

export default DistributorDashboardPage