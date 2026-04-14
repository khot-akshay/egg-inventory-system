import React from 'react'
import Link from 'next/link';

import Button from '@mui/material/Button'

import { Grid } from "@mui/material";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
import PageHeader from "../../../@core/components/page-header";
// import PromocodeList from 'src/components/promocode/PromocodeList';
import UserList from 'src/components/userManagement/User/UserList';
import checkPermission from 'src/configs/CheckPermisstion';
export default function Promocodes() {
  return (
    <div>
      <Grid container direction="row" justifyContent="space-between">
        <Grid item>
          <PageHeader
            title={
              <Typography style={{ fontWeight: 700 }} variant='h5'>
                User
              </Typography>
            }
            subtitle={
              <Typography variant='body2'>
                List
              </Typography>
            }
          />
        </Grid>
        {checkPermission('user-management') && (

          <Grid item>
            <Link href='/userManagement/user/create' passHref style={{ textDecoration: 'none' }}>
              <Button type='submit' variant='contained' style={{ marginBottom: '20px' }}>
                Add User
              </Button>
            </Link>
          </Grid>
        )}
      </Grid>
      <Grid container direction="row">
        <Grid item xs={12}>
          <UserList />
        </Grid>

      </Grid>
    </div>
  )
}
