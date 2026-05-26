import Grid from '@mui/material/Grid'
import React, { useEffect, useState } from 'react'
import axiosInstance from 'src/services/axios'
import ProfileView from 'src/components/profile/ProfileView'

export default function Profile() {
    const [userData, setUserData] = useState([])

    const fetchData = async () => {

        try {
            const response = await axiosInstance.get(`/api/v1/admin/getCurrentUser`)
            setUserData(response.data?.data?.userData)
        }
        catch (error) {
            return (error)
        }
    };


    useEffect(() => {
        fetchData();
    }, []);
    return (
        <div>
            <Grid container>
                <Grid item xs={12}>
                    <ProfileView userData={userData} fetchData={fetchData} />
                </Grid>

            </Grid>
        </div>
    )
}
