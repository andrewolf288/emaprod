import React, { useState, useEffect } from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import TextField from '@mui/material/TextField'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { FormatDateTimeMYSQL } from '../../utils/functions/FormatDate'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'

const FechaPickerYear = ({ onNewfecEntSto, date }) => {
  const [value, setValue] = useState(null)

  const formatFechaMYSQL = (newValue) => {
    setValue(newValue)
    onNewfecEntSto(FormatDateTimeMYSQL(newValue._d))
  }

  const handleKeyDown = (event) => {
    event.preventDefault()
  }

  useEffect(() => {
    if (date) {
      setValue(date)
    }
  }, [date])

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <DatePicker
        value={value}
        openTo={'year'}
        inputFormat="DD/MM/YYYY"
        onChange={formatFechaMYSQL}
        renderInput={(params) => (
          <TextField {...params} onKeyDown={handleKeyDown} size="small" />
        )}
      />
    </LocalizationProvider>
  )
}

export default FechaPickerYear
