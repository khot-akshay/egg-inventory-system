import React from 'react'
import { Grid, Box } from '@mui/material'
import DistributorQuickBill from 'src/components/distributor/quickbill/DistributorQuickBill'

const DistributorQuickBillList = () => {
    return (
        <Box>
            <Grid container spacing={3}>
                {/* Left Side: Add Stock Design (4 grid) */}
                {/* <Grid item xs={12} md={4}>
          <AddQuickBillForm />
        </Grid> */}

                {/* Right Side: Stocks Table (8 grid) */}
                <Grid item xs={12} md={12}>
                    <DistributorQuickBill />
                </Grid>
            </Grid>
        </Box>
    )
}

export default DistributorQuickBillList