import React from 'react'
import { TextField } from '@mui/material'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import moment from 'moment'

export const FechaFilterRangeDate = ({
  label = '',
  dateValue = '',
  onNewfecEntSto
}) => {
  const formatFechaMYSQL = (newValue) => {
    const formattedDate = moment(newValue).format('YYYY-MM-DD')
    onNewfecEntSto(formattedDate)
  }
  const handleKeyDown = (event) => {
    event.preventDefault()
  }

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <DatePicker
        label={label}
        value={dateValue}
        inputFormat="DD/MM/YYYY"
        views={['year', 'month', 'day']}
        onChange={formatFechaMYSQL}
        renderInput={(params) => (
          <TextField size="small" {...params} onKeyDown={handleKeyDown} />
        )}
      />
    </LocalizationProvider>
  )
}
