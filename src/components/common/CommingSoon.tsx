import { Box, Typography } from '@mui/material'
import React from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Image from 'next/image';
function CommingSoon() {
    return (
        <>
            <Box sx={{ height: '100%' }} display={'flex'} justifyContent={'center'} alignItems={'center'} flexDirection={'column'}>
                <Image
                    src={'/images/misc/coming-soon.png'}
                    width={400}
                    alt='Coming Soon'
                    height={400}
                />


            </Box>
        </>
    )
}

export default CommingSoon