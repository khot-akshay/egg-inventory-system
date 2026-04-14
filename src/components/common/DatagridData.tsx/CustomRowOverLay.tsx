import { Box, Typography } from '@mui/material'
import React from 'react'
import Icon from 'src/@core/components/icon'

export default function CustomRowOverLay() {
    return (
        <Box sx={{ height: '100%' }} display='flex' justifyContent='center' alignItems='center' flexDirection='column'>
            <Icon  icon={'iconamoon:cloud-no-light'} fontSize={50}/>
            {/* <img 
                // src="/images/nodatafound.jpg"  // Replace with your image path or URL
                src="/images/hand-drawn-no-data-illustration_23-2150584268-removebg-preview.png"
                alt="No Data"
                style={{ width: 100, height: 100, marginBottom: 8 }} 
            /> */}
            <Typography>No Data Found</Typography>
        </Box>
    )
}
