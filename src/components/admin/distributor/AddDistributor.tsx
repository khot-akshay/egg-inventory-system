import { yupResolver } from '@hookform/resolvers/yup'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
  Button,
  Box
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import SubmitButton from 'src/components/common/button/Button'
import RHFInput from 'src/hook-forms/RHFInput'
import RHFAutoComplete from 'src/hook-forms/RHFAutoComplete'
import axiosInstance from 'src/services/axios'
import * as yup from 'yup'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import toast, { Toaster } from 'react-hot-toast'
import { IconButton as MuiIconButton } from '@mui/material'

const schema = yup.object().shape({
  name: yup.string().required('Route name is required'),

  route_date: yup.string().required('Route date is required'),

  status: yup.string().required('Status is required'),

  distributor_user_id: yup
    .mixed()
    .required('Distributor is required'),

  stops: yup.array().of(
    yup.object().shape({
      customer_id: yup
        .mixed()
        .required('Customer is required'),

      sequence: yup
        .number()
        .required('Sequence is required')
    })
  )
})

interface StopItem {
  customer_id: any
  sequence: number
}

interface FormData {
  name: string
  route_date: string
  status: string
  distributor_user_id: any
  stops: StopItem[]
}

interface SelectedItem {
  id?: number
  name?: string
  route_date?: string
  status?: string
  distributor_user_id?: number
  distributor?: {
    name?: string
  }
  stops?: any[]
}

interface Props {
  open: boolean
  handleClose: () => void
  fetchData: () => void
  selectedItem?: SelectedItem
}

const defaultValues: FormData = {
  name: '',
  route_date: '',
  status: 'planned',
  distributor_user_id: null,
  stops: [
    {
      customer_id: null,
      sequence: 1
    }
  ]
}

const AddDistributor = ({
  open,
  handleClose,
  fetchData,
  selectedItem
}: Props) => {
  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'stops'
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      const payload = {
        name: data.name,
        route_date: data.route_date,
        status: data.status,
        distributor_user_id:
          typeof data.distributor_user_id === 'object'
            ? data.distributor_user_id.id
            : data.distributor_user_id,

        stops: data.stops.map(item => ({
          customer_id:
            typeof item.customer_id === 'object'
              ? item.customer_id.id
              : item.customer_id,

          sequence: Number(item.sequence)
        }))
      }

      let url = ''

      if (selectedItem) {
        url = `/api/v1/admin/createDistributionRoute?id=${selectedItem.id}`
      } else {
        url = '/api/v1/admin/createDistributionRoute'
      }

      const response = await axiosInstance.post(url, payload)

      if (response.data.success) {
        toast.success(response.data.message)
        handleCloseModal()
        fetchData()
      }
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ??
          (selectedItem
            ? 'Failed to update route'
            : 'Failed to create route')
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedItem) {
      setValue('name', selectedItem.name || '')

      setValue(
        'route_date',
        selectedItem.route_date || ''
      )

      setValue('status', selectedItem.status || '')

      if (selectedItem.distributor_user_id) {
        setValue('distributor_user_id', {
          id: selectedItem.distributor_user_id,
          name:
            selectedItem.distributor?.name ||
            'Distributor'
        })
      }

      if (selectedItem.stops?.length) {
        setValue(
          'stops',
          selectedItem.stops.map((item, index) => ({
            customer_id: {
              id: item.customer_id,
              name: item.customer?.name
            },
            sequence: item.sequence || index + 1
          }))
        )
      }
    } else {
      reset(defaultValues)
    }
  }, [selectedItem, setValue, reset])

  const handleCloseModal = () => {
    reset(defaultValues)
    handleClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
      maxWidth='md'
      fullWidth
      disableEnforceFocus
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: theme =>
            theme.palette.action.hover
        }}
      >
        <Toaster position='top-right' />

        <Typography
          sx={{
            fontSize: '25px',
            fontWeight: 'bold',
            flexGrow: 1,
            pl: 1
          }}
        >
          {selectedItem ? 'Update' : 'Add'} Route
        </Typography>

        <IconButton onClick={handleCloseModal}>
          <HighlightOffIcon
            sx={{ color: 'error.main' }}
            fontSize='large'
          />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <RHFInput
                control={control}
                name='name'
                label='Route Name'
                placeholder='Route Name'
                mandatory
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFInput
                control={control}
                name='route_date'
                label='Route Date'
                type='date'
                placeholder='Route Date'
                mandatory
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFInput
                control={control}
                name='status'
                label='Status'
                placeholder='planned'
                mandatory
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFAutoComplete
                control={control}
                name='distributor_user_id'
                placeholder='Select Distributor'
                labelinput='Select Distributor'
                apiUrl='/api/v1/admin/getAllUsers'
                labelKey='name'
                valueKey='id'
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Box
                display='flex'
                justifyContent='space-between'
                alignItems='center'
                mb={2}
              >
                <Typography variant='h6'>
                  Stops
                </Typography>

                <Button
                  startIcon={<AddIcon />}
                  variant='contained'
                  onClick={() =>
                    append({
                      customer_id: null,
                      sequence:
                        watch('stops').length + 1
                    })
                  }
                >
                  Add Stop
                </Button>
              </Box>
            </Grid>

            {fields.map((field, index) => (
              <React.Fragment key={field.id}>
                <Grid item xs={12} md={5}>
                  <RHFAutoComplete
                    control={control}
                    name={`stops.${index}.customer_id`}
                    placeholder='Select Customer'
                    labelinput='Select Customer'
                    apiUrl='/api/v1/admin/getAllCustomers'
                    labelKey='name'
                    valueKey='id'
                    required
                  />
                </Grid>

                <Grid item xs={12} md={5}>
                  <RHFInput
                    control={control}
                    name={`stops.${index}.sequence`}
                    label='Sequence'
                    placeholder='Sequence'
                    mandatory
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  md={2}
                  display='flex'
                  alignItems='center'
                >
                  <MuiIconButton
                    color='error'
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <DeleteIcon />
                  </MuiIconButton>
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ mt: 3 }}>
          <Button
            variant='outlined'
            onClick={handleCloseModal}
          >
            Cancel
          </Button>

          <SubmitButton
            label='Submit'
            isLoading={isLoading}
            onSubmit={handleSubmit(onSubmit)}
            isWidth={false}
          />
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddDistributor