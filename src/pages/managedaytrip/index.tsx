import React from 'react'
import { Box, Grid } from '@mui/material'
import DayTripDashboard from 'src/components/distributor/daytrip/DayTripDashboard'
import AddDayTrip from 'src/components/distributor/daytrip/AddDayTrip'

const DayTripPage = () => {
  return (
    

    <Box>
          <Grid container spacing={3}>
            {/* Left Side: Add Stock Design (4 grid) */}
            <Grid item xs={12} md={4}>
      <AddDayTrip/>
            </Grid>
    
            {/* Right Side: Stocks Table (8 grid) */}
            <Grid item xs={12} md={8}>
      <DayTripDashboard />
            </Grid>
          </Grid>
        </Box>
  )
}

export default DayTripPage