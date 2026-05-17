import { Tooltip, Typography } from '@mui/material'
import moment from 'moment'
import React from 'react'

interface Props {
    date: string
}
export default function DateFormateComponent({ date }: Props) {
    return (
        <>

            {date ? (

                <Tooltip title={`${moment(date).format('MMMM Do YYYY, h:mm:ss ')}`}>

                    {/* <p >{moment(date).format('DD/MM/YY')}</p> */}
                    <p>{moment(date).format("DD/MM/YYYY h:mm A")}</p>
                </Tooltip>
            ) : (
                <Typography>NA</Typography>
            )}
        </>
    )
}
