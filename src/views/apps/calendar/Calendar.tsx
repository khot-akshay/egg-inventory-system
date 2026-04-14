// ** React Import
import { useEffect, useRef, useState } from 'react'

// ** Full Calendar & it's Plugins
import FullCalendar from '@fullcalendar/react'
import listPlugin from '@fullcalendar/list'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Types
import { CalendarType } from 'src/types/apps/calendarTypes'
import { useRouter } from 'next/router'
import SelectTurfDropdown from 'src/components/turf_management/SelectTurfDropdown'
import { Box } from '@mui/material'

const blankEvent = {
  title: '',
  start: '',
  end: '',
  allDay: false,
  url: '',
  extendedProps: {
    calendar: '',
    guests: [],
    location: '',
    description: ''
  }
}

const Calendar = (props: CalendarType) => {
  // ** Props
  const {
    store,
    turfData,
    dispatch,
    setSelectedturf,
    direction,
    updateEvent,
    calendarApi,
    calendarsColor,
    setCalendarApi,
    handleSelectEvent,
    handleLeftSidebarToggle,
    handleAddEventSidebarToggle
  } = props

  // ** Refs
  const calendarRef = useRef()
  const router = useRouter()

  useEffect(() => {

    if (calendarApi === null || calendarApi === undefined) {
      // @ts-ignore
      setCalendarApi(calendarRef.current?.getApi())
    }
  }, [calendarApi, setCalendarApi])
  if (turfData) {
    // ** calendarOptions(Props)
    const calendarOptions = {
      events: turfData.length ? turfData : [],
      plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        start: 'sidebarToggle,  title',
        end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
      },
      views: {
        week: {
          titleFormat: { year: 'numeric', month: 'long', day: 'numeric' }
        }
      },

      /*
      Enable dragging and resizing event
      ? Docs: https://fullcalendar.io/docs/editable
    */
      editable: true,

      /*
      Enable resizing event from start
      ? Docs: https://fullcalendar.io/docs/eventResizableFromStart
    */
      eventResizableFromStart: true,

      /*
      Automatically scroll the scroll-containers during event drag-and-drop and date selecting
      ? Docs: https://fullcalendar.io/docs/dragScroll
    */
      dragScroll: true,

      /*
      Max number of events within a given day
      ? Docs: https://fullcalendar.io/docs/dayMaxEvents
    */
      dayMaxEvents: 2,

      /*
      Determines if day names and week names are clickable
      ? Docs: https://fullcalendar.io/docs/navLinks
    */
      navLinks: true,

      eventClassNames({ event: calendarEvent }: any) {
        // @ts-ignore
        const colorName = calendarsColor[calendarEvent._def.extendedProps.calender]

        return [
          // Background Color
          `bg-${colorName}`
        ]
      },

      eventClick({ event: clickedEvent }: any) {
        dispatch(handleSelectEvent(clickedEvent))
        router.push(`/bookings/booking_details/${clickedEvent._def.publicId}`)
        // handleAddEventSidebarToggle()

        // * Only grab required field otherwise it goes in infinity loop
        // ! Always grab all fields rendered by form (even if it get `undefined`) otherwise due to Vue3/Composition API you might get: "object is not extensible"
        // event.value = grabEventDataFromEventApi(clickedEvent)

        // isAddNewEventSidebarActive.value = true
      },

      customButtons: {
        sidebarToggle: {
          text: <Icon icon='bx:menu' />,
          click() {
            handleLeftSidebarToggle()
          }
        }
      },

      dateClick(info: any) {
        const ev = { ...blankEvent }
        ev.start = info.date
        ev.end = info.date
        ev.allDay = true

        // @ts-ignore
        dispatch(handleSelectEvent(ev))
        handleAddEventSidebarToggle()
      },

      /*
      Handle event drop (Also include dragged event)
      ? Docs: https://fullcalendar.io/docs/eventDrop
      ? We can use `eventDragStop` but it doesn't return updated event so we have to use `eventDrop` which returns updated event
    */
      eventDrop({ event: droppedEvent }: any) {
        dispatch(updateEvent(droppedEvent))
      },

      /*
      Handle event resize
      ? Docs: https://fullcalendar.io/docs/eventResize
    */
      eventResize({ event: resizedEvent }: any) {
        dispatch(updateEvent(resizedEvent))
      },

      ref: calendarRef,

      // Get direction from app state (store)
      direction
    }

    return (
      <>
        <div className='my-5 w-full md:w-1/2'>

          <SelectTurfDropdown setTurf={setSelectedturf} multiple />
        </div>

        <FullCalendar {...calendarOptions} />
      </>
    )
  } else {
    return null
  }
}

export default Calendar
