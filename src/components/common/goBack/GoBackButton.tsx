import { Typography } from '@mui/material'
import React from 'react'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import { useRouter } from 'next/router'
interface Props {
    label: string,
    isBack?: boolean
}
export default function GoBack({ label, isBack=true }: Props) {
    const router = useRouter()
    return (
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 3 }} >
            {isBack &&

                <ArrowBackIosNewIcon sx={{ width: '20px', height: '20px' }} onClick={() => router.back()} />
            }
            <Typography sx={{ color: 'primary.main', fontSize: 20, fontWeight: 700 }}>{label}</Typography>
        </div>
    )
}
