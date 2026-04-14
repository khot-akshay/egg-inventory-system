
// import React from 'react'

// import Dialog from '@mui/material/Dialog'
// import Divider from '@mui/material/Divider'
// import DialogTitle from '@mui/material/DialogTitle'

// import DialogContent from '@mui/material/DialogContent'

// import Icon from 'src/@core/components/icon'
// import { Grid } from '@mui/material'
// import Button from '@mui/material/Button'
// import dayjs from 'dayjs'

// import Paper from '@mui/material/Paper'
// import Table from '@mui/material/Table'
// import TableHead from '@mui/material/TableHead'
// import TableBody from '@mui/material/TableBody'
// import TableCell from '@mui/material/TableCell'
// import TableContainer from '@mui/material/TableContainer'
// import TableRow from '@mui/material/TableRow'

// export default function PromocodeViewPopup({ show, handleclose, selectedPromocode }) {
//     // const date = selectedPromocode.start_from;
//     // const startFrom = date.substring(0, 10);

//     console.log(); // Output: "22-02-2023"
//     return (
//         <Dialog
//             scroll='body'
//             open={show}
//             onClose={handleclose}
//             aria-labelledby='user-view-plans'
//             aria-describedby='user-view-plans-description'
//             sx={{
//                 '& .MuiPaper-root': { width: '100%', maxWidth: 960, },
//                 '& .MuiDialogTitle-root ~ .MuiDialogContent-root': { pt: theme => `${theme.spacing(2)} !important` }
//             }}
//         >
//             <DialogTitle id='user-view-plans' sx={{ textAlign: 'center', fontSize: '1.5rem !important' }}>
//                 <Grid container item xs={12} justifyContent='space-between' alignItems='center'>

//                     Promocode
//                     <Icon icon='ic:baseline-close' style={{ cursor: 'pointer' }} onClick={handleclose} />
//                 </Grid>
//             </DialogTitle>
//             <Divider
//                 sx={{
//                     mt: theme => `${theme.spacing(0.5)} !important`,
//                     mb: theme => `${theme.spacing(7.5)} !important`
//                 }}
//             />

//             <DialogContent>

//                 <Grid container spacing={5}>
//                     <Grid item xs={6}>
//                         <TableContainer component={Paper}>
//                             <Table sx={{ minWidth: 100, border: '1px solid #e6e9eb' }} aria-label='simple table'>
//                                 <TableHead>
//                                     <TableRow>
//                                         <TableCell>Property Name</TableCell>
//                                         <TableCell align='right'>Property values</TableCell>
//                                     </TableRow>
//                                 </TableHead>
//                                 <TableBody>
//                                     <TableRow
//                                         sx={{
//                                             '&:last-of-type td, &:last-of-type th': {
//                                                 border: 0
//                                             }
//                                         }}
//                                     >
//                                         <TableCell component='th' scope='row'>
//                                             Promocode Name
//                                         </TableCell>
//                                         <TableCell align='right'>{selectedPromocode.promocode}</TableCell>

//                                     </TableRow>
//                                     <TableRow
//                                         sx={{
//                                             '&:last-of-type td, &:last-of-type th': {
//                                                 border: 0
//                                             }
//                                         }}
//                                     >
//                                         <TableCell component='th' scope='row'>
//                                             Start From
//                                         </TableCell>
//                                         <TableCell align='right'>{dayjs(selectedPromocode.start_from).format('YYYY-MM-DD')}</TableCell>

//                                     </TableRow>
//                                     <TableRow
//                                         sx={{
//                                             '&:last-of-type td, &:last-of-type th': {
//                                                 border: 0
//                                             }
//                                         }}
//                                     >
//                                         <TableCell component='th' scope='row'>
//                                             End On
//                                         </TableCell>
//                                         <TableCell align='right'>{dayjs(selectedPromocode.end_on).format('YYYY-MM-DD')}</TableCell>

//                                     </TableRow>
//                                     <TableRow
//                                         sx={{
//                                             '&:last-of-type td, &:last-of-type th': {
//                                                 border: 0
//                                             }
//                                         }}
//                                     >
//                                         <TableCell component='th' scope='row'>
//                                             Promocode For
//                                         </TableCell>
//                                         <TableCell align='right'>{selectedPromocode.promocode_for}</TableCell>

//                                     </TableRow>
//                                     <TableRow
//                                         sx={{
//                                             '&:last-of-type td, &:last-of-type th': {
//                                                 border: 0
//                                             }
//                                         }}
//                                     >
//                                         <TableCell component='th' scope='row'>
//                                             Type
//                                         </TableCell>
//                                         <TableCell align='right'>{selectedPromocode.type}</TableCell>

//                                     </TableRow>
//                                     {/* <TableRow
//                                         sx={{
//                                             '&:last-of-type td, &:last-of-type th': {
//                                                 border: 0
//                                             }
//                                         }}
//                                     >
//                                         <TableCell component='th' scope='row'>
//                                             Free Item Count
//                                         </TableCell>
//                                         <TableCell align='right'>{selectedPromocode.freeItemCount ? selectedPromocode.freeItemCount : 'null'}</TableCell>

//                                     </TableRow> */}
//                                     <TableRow
//                                         sx={{
//                                             '&:last-of-type td, &:last-of-type th': {
//                                                 border: 0
//                                             }
//                                         }}
//                                     >
//                                         <TableCell component='th' scope='row'>
//                                             Discount
//                                         </TableCell>
//                                         <TableCell align='right'>{selectedPromocode.discount}</TableCell>

//                                     </TableRow>
//                                     {/* <TableRow
//                                         sx={{
//                                             '&:last-of-type td, &:last-of-type th': {
//                                                 border: 0
//                                             }
//                                         }}
//                                     >
//                                         <TableCell component='th' scope='row'>
//                                             Is For New User
//                                         </TableCell>
//                                         <TableCell align='right'>{selectedPromocode.is_for_new_user ? 'yes' : 'no'}</TableCell>

//                                     </TableRow> */}
//                                     {/* <TableRow
//                                         sx={{
//                                             '&:last-of-type td, &:last-of-type th': {
//                                                 border: 0
//                                             }
//                                         }}
//                                     >
//                                         <TableCell component='th' scope='row'>
//                                             Registered From
//                                         </TableCell>
//                                         <TableCell align='right'>{selectedPromocode.registered_from ? selectedPromocode.registered_from : 'null'}</TableCell>

//                                     </TableRow> */}

//                                 </TableBody>
//                             </Table>
//                         </TableContainer>
//                     </Grid>
//                     <Grid item xs={6}>
//                         <TableContainer component={Paper}>
//                             <Table sx={{ minWidth: 100, border: '1px solid #e6e9eb' }} aria-label='simple table'>
//                                 <TableHead>
//                                     <TableRow>
//                                         <TableCell>Property Name</TableCell>
//                                         <TableCell align='right'>Property values</TableCell>
//                                     </TableRow>
//                                 </TableHead>
//                                 <TableBody>
//                                     {/* <TableRow
//                                         sx={{
//                                             '&:last-of-type td, &:last-of-type th': {
//                                                 border: 0
//                                             }
//                                         }}
//                                     >
//                                         <TableCell component='th' scope='row'>
//                                             Is For Only App
//                                         </TableCell>
//                                         <TableCell align='right'>{selectedPromocode.is_for_only_app ? 'yes' : 'no'}</TableCell>

//                                     </TableRow> */}
//                                     {/* <TableRow
//                                         sx={{
//                                             '&:last-of-type td, &:last-of-type th': {
//                                                 border: 0
//                                             }
//                                         }}
//                                     >
//                                         <TableCell component='th' scope='row'>
//                                             Is For Paymentapp
//                                         </TableCell>
//                                         <TableCell align='right'>{selectedPromocode.is_for_paymentapp ? 'yes' : 'no'}</TableCell>

//                                     </TableRow> */}
//                                     <TableRow
//                                         sx={{
//                                             '&:last-of-type td, &:last-of-type th': {
//                                                 border: 0
//                                             }
//                                         }}
//                                     >
//                                         <TableCell component='th' scope='row'>
//                                             Is Active
//                                         </TableCell>
//                                         <TableCell align='right'>{selectedPromocode.is_active ? 'yes' : 'no'}</TableCell>

//                                     </TableRow>
//                                     <TableRow
//                                         sx={{
//                                             '&:last-of-type td, &:last-of-type th': {
//                                                 border: 0
//                                             }
//                                         }}
//                                     >
//                                         <TableCell component='th' scope='row'>
//                                         Show on Landing Page                                        </TableCell>
//                                         <TableCell align='right'>{selectedPromocode.is_landing ? 'yes' : 'no'}</TableCell>

//                                     </TableRow>
//                                     <TableRow
//                                         sx={{
//                                             '&:last-of-type td, &:last-of-type th': {
//                                                 border: 0
//                                             }
//                                         }}
//                                     >
//                                         <TableCell component='th' scope='row'>
//                                         Hide On Customer side
//                                         </TableCell>
//                                         <TableCell align='right'>{selectedPromocode.hide_promo ? 'yes' : 'no'}</TableCell>

//                                     </TableRow>
//                                     <TableRow
//                                         sx={{
//                                             '&:last-of-type td, &:last-of-type th': {
//                                                 border: 0
//                                             }
//                                         }}
//                                     >
//                                         <TableCell component='th' scope='row'>
//                                             Is For Registered Between
//                                         </TableCell>
//                                         <TableCell align='right'>{selectedPromocode.is_for_registered_between ? 'yes' : 'no'}</TableCell>

//                                     </TableRow>
//                                     {/* <TableRow
//                                         sx={{
//                                             '&:last-of-type td, &:last-of-type th': {
//                                                 border: 0
//                                             }
//                                         }}
//                                     >
//                                         <TableCell component='th' scope='row'>
//                                             Is For Specific Pincode
//                                         </TableCell>
//                                         <TableCell align='right'>{selectedPromocode.is_for_specific_pincode ? 'yes' : 'no'}</TableCell>

//                                     </TableRow> */}
//                                     {/* <TableRow
//                                         sx={{
//                                             '&:last-of-type td, &:last-of-type th': {
//                                                 border: 0
//                                             }
//                                         }}
//                                     >
//                                         <TableCell component='th' scope='row'>
//                                             Is For Specific Number
//                                         </TableCell>
//                                         <TableCell align='right'>{selectedPromocode.is_for_specific_number ? 'yes' : 'no'}</TableCell>

//                                     </TableRow> */}
//                                     <TableRow
//                                         sx={{
//                                             '&:last-of-type td, &:last-of-type th': {
//                                                 border: 0
//                                             }
//                                         }}
//                                     >
//                                         <TableCell component='th' scope='row'>
//                                             Max Discount
//                                         </TableCell>
//                                         <TableCell align='right'>{selectedPromocode.max_discount}</TableCell>

//                                     </TableRow>
//                                     <TableRow
//                                         sx={{
//                                             '&:last-of-type td, &:last-of-type th': {
//                                                 border: 0
//                                             }
//                                         }}
//                                     >
//                                         <TableCell component='th' scope='row'>
//                                             Minimal Total
//                                         </TableCell>
//                                         <TableCell align='right'>{selectedPromocode.minimal_cart_total}</TableCell>

//                                     </TableRow>
//                                     {/* <TableRow
//                                         sx={{
//                                             '&:last-of-type td, &:last-of-type th': {
//                                                 border: 0
//                                             }
//                                         }}
//                                     >
//                                         <TableCell component='th' scope='row'>
//                                             minimum Buy
//                                         </TableCell>
//                                         <TableCell align='right'>{selectedPromocode.minimumBuy ? selectedPromocode.minimumBuy : 'null'}</TableCell>

//                                     </TableRow> */}
//                                     {/* <TableRow
//                                         sx={{
//                                             '&:last-of-type td, &:last-of-type th': {
//                                                 border: 0
//                                             }
//                                         }}
//                                     >
//                                         <TableCell component='th' scope='row'>
//                                             Registered Till
//                                         </TableCell>
//                                         <TableCell align='right'>{selectedPromocode.registered_till ? selectedPromocode.registered_till : 'null'}</TableCell>

//                                     </TableRow> */}

//                                 </TableBody>
//                             </Table>
//                         </TableContainer>
//                     </Grid>
//                 </Grid>
//                 <div>

//                     <Button sx={{ mt: 7, }} onClick={handleclose} variant='contained' size='large'>
//                         Close
//                     </Button>
//                 </div>
//             </DialogContent>

//         </Dialog>
//     )
// }

import React from 'react'
import Dialog from '@mui/material/Dialog'
import Divider from '@mui/material/Divider'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Icon from 'src/@core/components/icon'
import { Grid, Button, Paper, Table, TableHead, TableBody, TableCell, TableContainer, TableRow } from '@mui/material'
import dayjs from 'dayjs'

export default function PromocodeViewPopup({ show, handleclose, selectedPromocode }) {
  return (
    <Dialog
      scroll="body"
      open={show}
      onClose={handleclose}
      aria-labelledby="user-view-plans"
      aria-describedby="user-view-plans-description"
      sx={{
        '& .MuiPaper-root': { 
          width: '100%', 
          maxWidth: { xs: '95%', sm: 600, md: 960 }  // Responsive maxWidth
        },
        '& .MuiDialogTitle-root ~ .MuiDialogContent-root': { 
          pt: theme => `${theme.spacing(2)} !important`
        }
      }}
    >
      <DialogTitle 
        id="user-view-plans" 
        sx={{ textAlign: 'center', fontSize: '1.5rem !important' }}
      >
        <Grid container justifyContent="space-between" alignItems="center">
          Promocode
          <Icon icon="ic:baseline-close" style={{ cursor: 'pointer' }} onClick={handleclose} />
        </Grid>
      </DialogTitle>
      <Divider
        sx={{
          mt: theme => `${theme.spacing(0.5)} !important`,
          mb: theme => `${theme.spacing(7.5)} !important`
        }}
      />

      <DialogContent>
        <Grid container spacing={5}>
          <Grid item xs={12} md={6}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 100, border: '1px solid #e6e9eb' }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Property Name</TableCell>
                    <TableCell align="right">Property Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Promocode Name
                    </TableCell>
                    <TableCell align="right">{selectedPromocode.promocode}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Start From
                    </TableCell>
                    <TableCell align="right">
                      {dayjs(selectedPromocode.start_from).format('YYYY-MM-DD')}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      End On
                    </TableCell>
                    <TableCell align="right">
                      {dayjs(selectedPromocode.end_on).format('YYYY-MM-DD')}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Promocode For
                    </TableCell>
                    <TableCell align="right">{selectedPromocode.promocode_for}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Type
                    </TableCell>
                    <TableCell align="right">{selectedPromocode.type}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Discount
                    </TableCell>
                    <TableCell align="right">{selectedPromocode.discount}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 100, border: '1px solid #e6e9eb' }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Property Name</TableCell>
                    <TableCell align="right">Property Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Is Active
                    </TableCell>
                    <TableCell align="right">{selectedPromocode.is_active ? 'yes' : 'no'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Show on Landing Page
                    </TableCell>
                    <TableCell align="right">{selectedPromocode.is_landing ? 'yes' : 'no'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Hide On Customer Side
                    </TableCell>
                    <TableCell align="right">{selectedPromocode.hide_promo ? 'yes' : 'no'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Is For Registered Between
                    </TableCell>
                    <TableCell align="right">{selectedPromocode.is_for_registered_between ? 'yes' : 'no'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Max Discount
                    </TableCell>
                    <TableCell align="right">{selectedPromocode.max_discount}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Minimal Total
                    </TableCell>
                    <TableCell align="right">{selectedPromocode.minimal_cart_total}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
        <div>
          <Button sx={{ mt: 7 }} onClick={handleclose} variant="contained" size="large">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
