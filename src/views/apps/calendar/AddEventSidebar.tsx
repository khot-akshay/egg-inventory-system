// ** React Imports
import { useCallback, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import CreateVillaBooking from 'src/components/villa/booking/CreateBooking'

// ** Third Party Imports
import { useForm } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Styled Components

// ** Types
import CreateBooking from 'src/components/turf_management/booking/CreateBooking'
import themeConfig from 'src/configs/themeConfig'
import { AddEventSidebarType } from 'src/types/apps/calendarTypes'


interface DefaultStateType {
  url: string
  title: string
  allDay: boolean
  calendar: string
  description: string
  endDate: Date | string
  startDate: Date | string
  guests: string[] | string | undefined
}


const defaultState: DefaultStateType = {
  url: '',
  title: '',
  guests: [],
  allDay: true,
  description: '',
  endDate: new Date(),
  calendar: 'Business',
  startDate: new Date()
}

const AddEventSidebar = (props: AddEventSidebarType) => {
  // ** Props
  const {
    store,
    dispatch,
    addEvent,
    updateEvent,
    drawerWidth,
    calendarApi,
    deleteEvent,
    handleSelectEvent,
    addEventSidebarOpen,
    handleAddEventSidebarToggle
  } = props

  // ** States
  const [values, setValues] = useState<DefaultStateType>(defaultState)

  const {
    control,
    setValue,
    clearErrors,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: { title: '' } })

  const handleSidebarClose = async () => {
    setValues(defaultState)
    clearErrors()
    dispatch(handleSelectEvent(null))
    handleAddEventSidebarToggle()
  }



  const resetToStoredValues = useCallback(() => {
    if (store.selectedEvent !== null) {
      const event = store.selectedEvent
      setValue('title', event.title || '')
      setValues({
        url: event.url || '',
        title: event.title || '',
        allDay: event.allDay,
        guests: event.extendedProps.guests || [],
        description: event.extendedProps.description || '',
        calendar: event.extendedProps.calendar || 'Business',
        endDate: event.end !== null ? event.end : event.start,
        startDate: event.start !== null ? event.start : new Date()
      })
    }
  }, [setValue, store.selectedEvent])

  const resetToEmptyValues = useCallback(() => {
    setValue('title', '')
    setValues(defaultState)
  }, [setValue])

  useEffect(() => {
    if (store.selectedEvent !== null) {
      resetToStoredValues()
    } else {
      resetToEmptyValues()
    }
  }, [addEventSidebarOpen, resetToStoredValues, resetToEmptyValues, store.selectedEvent])


  return (
    <Drawer
      anchor='right'
      open={addEventSidebarOpen}
      onClose={handleSidebarClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: ['100%', drawerWidth] } }}
    >
      <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} sx={{ m: 5 }}>
        <Typography sx={{ fontSize: '20px', fontWeight: 'bold' }}>Add Booking</Typography>
        <Button onClick={handleSidebarClose}>

          <Icon icon='bx:x' style={{ fontSize: '30px', color: 'text-dark' }} />
        </Button>
      </Box>
      {themeConfig.projectFor == 'villa' ? (

        <CreateVillaBooking />
      ) : (
        <CreateBooking />
      )}

    </Drawer>
  )
}

export default AddEventSidebar
