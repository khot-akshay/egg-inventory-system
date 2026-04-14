import { Button, CircularProgress } from '@mui/material'
import React from 'react'
interface Props {
    onSubmit: () => void
    isLoading: boolean
    label: string,
    isWidth:boolean,
    color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
}
export default function SubmitButton({ onSubmit, isLoading, label, isWidth ,color = 'primary'}:Props) {
    return (
        <Button onClick={onSubmit} type='submit' variant='contained' sx={{ marginRight: '20px', cursor: isLoading ? 'not-allowed' : 'pointer',  width:isWidth?'100%':'auto' }} color={color}>
            {isLoading && (
                <CircularProgress
                    sx={{
                        color: 'common.white',
                        width: '20px !important',
                        height: '20px !important',

                        mr: theme => theme.spacing(2)
                    }} />
            )}
            {label}
        </Button>
    )
}
