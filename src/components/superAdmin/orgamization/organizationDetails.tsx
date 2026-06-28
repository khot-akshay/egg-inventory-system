import { Accordion, AccordionDetails, AccordionSummary, Box, Card, CardContent, Grid, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import Icon from 'src/@core/components/icon'
import FallbackSpinner from 'src/@core/components/spinner'
import axiosInstance from 'src/services/axios'
import { decodeParams } from 'src/utils/encodeid'
import { useRouter } from 'next/router'
export default function OrganizationDetails() {
    const router = useRouter()
    const [organization, setOrganization] = useState(null)
    const [loading, setLoading] = useState<string | ''>('idle')
    const fetchEmployee = async () => {
        setLoading('pending')
        try {
            const response = await axiosInstance(`/admin/v1/auth/organization/getOrganization/${decodeParams(router.query.id)}`)
            setOrganization(response.data.data)
            setLoading('success')
        } catch (e) {
            setLoading('failed')
        }
    }
    useEffect(() => {
        fetchEmployee()
    }, [router.query.id])
    if (loading == 'pending') return (
        <FallbackSpinner />
    )
    if (loading == 'failed') return (
        <Typography textAlign={'center'}>Failed to get organization data 😥</Typography>
    )
    return (


        <Accordion
            //   expanded={expanded === 'panel1'} 
            defaultExpanded
        >
            <AccordionSummary
                id='controlled-panel-header-1'
                aria-controls='controlled-panel-content-1'
                expandIcon={<Icon icon='bx:chevron-down' />}
            >
                <Typography variant='h6'>General Info</Typography>
            </AccordionSummary>
            <AccordionDetails style={{ marginTop: '20px' }}>
                <Grid container spacing={5} justifyContent={'start'} alignItems={'center'}>
                    <Grid item >
                        <Box display={'flex'} flexDirection={'column'}>
                            <Typography fontWeight={700} >Organization Name: </Typography>
                            <Typography fontWeight={700} >Email: </Typography>
                            <Typography fontWeight={700} >Telegram Number: </Typography>
                        </Box>
                    </Grid>
                    <Grid item>
                        <Box display={'flex'} flexDirection={'column'}>
                            <Typography>{organization?.name??"NA"}</Typography>
                            <Typography>{organization?.org_admin?.email??"NA"}</Typography>
                            <Typography>{organization?.telegram_number??"NA"}</Typography>
                         
                        </Box>
                    </Grid>
                </Grid>
            </AccordionDetails>
        </Accordion>

    )
}
