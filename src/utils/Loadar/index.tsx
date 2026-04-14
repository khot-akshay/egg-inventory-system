
'use client'
import * as React from 'react'
import Backdrop from '@mui/material/Backdrop'
import CircularProgress from '@mui/material/CircularProgress'

const Loader = ({ open = false }) => {
  return (
    <Backdrop sx={{ color: '#696CFF', zIndex: 999999 }} open={open}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CircularProgress color='inherit' />
      </div>
    </Backdrop>
  )
}

export default Loader
