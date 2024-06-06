import React, { useEffect, useState } from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import TextField from '@mui/material/TextField'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { FormatDateTimeMYSQL } from '../../utils/functions/FormatDate'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import moment from 'moment'

const FechaPickerYearAndMonthDynamic = ({
  onNewfecEntSto,
  dateValue = '',
  label = ''
}) => {
  const [value, setValue] = useState(dateValue ? moment(dateValue) : null)

  const formatFechaMYSQL = (newValue) => {
    if (newValue) {
      setValue(newValue)
      onNewfecEntSto(FormatDateTimeMYSQL(newValue._d))
    } else {
      setValue(null)
      onNewfecEntSto('') // Enviar una cadena vacía cuando el valor es nulo
    }
  }

  const handleKeyDown = (event) => {
    event.preventDefault()
  }

  useEffect(() => {
    setValue(dateValue ? moment(dateValue) : null)
  }, [dateValue])

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <DatePicker
        label={label}
        value={value}
        inputFormat="YYYY/MM"
        views={['year', 'month']}
        openTo="year"
        onChange={formatFechaMYSQL}
        renderInput={(params) => (
          <TextField size="small" {...params} onKeyDown={handleKeyDown} />
        )}
      />
    </LocalizationProvider>
  )
}

export default FechaPickerYearAndMonthDynamic
