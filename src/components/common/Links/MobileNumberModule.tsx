import { Box, Typography } from '@mui/material';
import Link from 'next/link';
import React from 'react'


interface Props {
   
    mobileNo: string
}
export default function MobileNumberModule({  mobileNo }: Props) {
    return (
        <>
            { mobileNo ? (
                <div onClick={() =>
                    window.open(
                        `tel:+${91}${mobileNo}`,
                        "_blank"
                    )
                }>

                    <p style={{

                        color: '#1976d2',
                        cursor: "pointer",

                    }}
                        title={`Mobile Number:${mobileNo}`}>+{91}{mobileNo}</p>
                </div>
            ) : (
                <Typography>NA</Typography>
            )}
        </>
    )
}
