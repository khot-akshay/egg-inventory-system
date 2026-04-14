import React, { useEffect, useState } from 'react'
import { Grid } from "@mui/material";
import Typography from "@mui/material/Typography";
import PageHeader from "../../../@core/components/page-header";
import UserForm from 'src/components/userManagement/User/AddUser';

export default function createCategory() {

  return (
    <div>
      <Grid container direction="row" justifyContent="space-between">
        <Grid item>
          <PageHeader
            title={
              <Typography variant='h5'>
                User
              </Typography>
            }
            subtitle={
              <Typography variant='body2'>
                Create
              </Typography>
            }
          />
        </Grid>
        <Grid item>

        </Grid>
      </Grid>
      <Grid container direction="row">
        <Grid item xs={12}>
          <UserForm />
        </Grid>

      </Grid>
    </div>
  )
}
