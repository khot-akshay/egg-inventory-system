import {
  Card,
  Grid,
  Box,
  Typography,
  IconButton,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DownloadIcon from '@mui/icons-material/Download'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { get } from 'src/services/apiCall'

const Viewopportunity = () => {
  const router = useRouter()

  const { id, viewid, subId } = router.query

  const userId = id ? Number(id) : undefined
  const plantId = viewid ? Number(viewid) : undefined
  const detailsId = subId ? Number(subId) : undefined

  const [isLoading, setIsLoading] = useState(false)
  const [newData, setNewData] = useState<any>({})

  /* ---------------- API ---------------- */
  const getAllData = async (detailsId: number) => {
    console.log('✅ API CALL WITH detailsId:', detailsId)
    try {
      setIsLoading(true)

      const url = `/api/v1/admin/plantProducts/getPlantProductsById/${detailsId}`
      const response = await get(url, '')

      if (response?.success) {
        setNewData(response.data.data)
      }
    } catch (error) {
      console.error('API Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  /* ---------------- EFFECT ---------------- */
  useEffect(() => {
    if (!router.isReady) return

    if (!detailsId || Number.isNaN(detailsId)) {
      console.log('❌ Invalid plantId:', detailsId)
      return
    }

    console.log('✅ API CALL WITH plantId:', detailsId)
    getAllData(detailsId)
  }, [router.isReady, detailsId])

  const plantDetails = newData ?? {}

  /* ---------------- DOWNLOAD ---------------- */
  const handleDownload = async (url: string, name: string) => {
    const res = await fetch(url)
    const blob = await res.blob()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = name
    link.click()
    URL.revokeObjectURL(link.href)
  }

  /* ---------------- UI ---------------- */
  return (
    <>
      {/* HEADER */}
      <Grid container spacing={2} sx={{ pl: 4, pr: 4, mb: 3 }}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => router.back()}>
              <ArrowBackIcon sx={{ color: '#3598DB' }} />
            </IconButton>

            <Typography sx={{ fontWeight: 600, fontSize: 20, ml: 2 }}>
              Product Details
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* DEBUG (Same as ViewSubDetails) */}
      {/* <Card sx={{ p: 3, mb: 3 }}>
        <Typography>User ID: {userId}</Typography>
        <Typography>Plant ID: {plantId}</Typography>
        <Typography>Details ID: {detailsId}</Typography>
      </Card> */}

      {/* PRODUCT DETAILS */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card sx={{ p: 4 }}>
            <Typography fontWeight={600} fontSize={18} mb={3}>
              Product Information
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography>Product Name</Typography>
                <Typography fontWeight={600}>
                  {plantDetails?.product?.name || 'NA'}
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography>Category</Typography>
                <Typography fontWeight={600}>
                  {plantDetails?.product?.categories?.name || 'NA'}
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography> Product Grade</Typography>
                <Typography fontWeight={600}>
                  {plantDetails?.grade?.name || 'NA'}
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography>Polish Type</Typography>
                <Typography fontWeight={600}>
                  {plantDetails?.polish_type?.name || 'NA'}
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography>Moisture Level (%)</Typography>
                <Typography fontWeight={600}>
                  {plantDetails?.moisture_content || 'NA'}
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography>Purity (%)</Typography>
                <Typography fontWeight={600}>
                  {plantDetails?.purity || 'NA'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography>Foreign Matter (%)</Typography>
                <Typography fontWeight={600}>
                  {plantDetails?.foreign_matter || 'NA'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography>Packaging (kg)</Typography>
                <Typography fontWeight={600}>
                  {plantDetails?.packaging_kg || 'NA'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography>Grain Size (MM)</Typography>
                <Typography fontWeight={600}>
                  {plantDetails?.grain_size || 'NA'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography>Description</Typography>
                <Typography fontWeight={600}>
                  {plantDetails?.product?.description || 'NA'}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* DOCUMENTS */}
      {plantDetails?.documents?.length > 0 && (
        <Grid container spacing={2} mt={4}>
          <Grid item xs={12}>
            <Card sx={{ p: 4 }}>
              <Typography fontWeight={600} fontSize={18} mb={3}>
                Plant Documents
              </Typography>

              <Grid container spacing={2}>
                {plantDetails.documents.map((doc: any, index: number) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Typography>{doc.remarks || 'Document'}</Typography>

                    <Box
                      sx={{
                        position: 'relative',
                        height: 180,
                        mt: 1,
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                          backgroundColor: '#fff',
                        }}
                        onClick={() =>
                          handleDownload(doc.document_path, doc.remarks)
                        }
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>

                      <img
                        src={doc.document_path}
                        alt={doc.remarks}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Card>
          </Grid>
        </Grid>
      )}
    </>
  )
}

export default Viewopportunity
