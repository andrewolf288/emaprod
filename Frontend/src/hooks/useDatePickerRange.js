import { useState } from 'react'

export function useDatePickerRange (initialStartDate = '', initialEndDate = '') {
  const [dateState, setDateState] = useState({
    fechaInicio: initialStartDate,
    fechaFin: initialEndDate
  })

  const handleStartDateChange = (newStartDate) => {
    setDateState({
      ...dateState,
      fechaInicio: newStartDate
    })
  }

  const handleEndDateChange = (newEndDate) => {
    setDateState({
      ...dateState,
      fechaFin: newEndDate
    })
  }

  return {
    dateState,
    handleStartDateChange,
    handleEndDateChange
  }
}
