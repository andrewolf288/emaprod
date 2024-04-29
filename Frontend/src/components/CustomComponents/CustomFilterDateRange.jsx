import React from 'react'
import { FechaFilterRangeDate } from '../Fechas/FechaFilterRangeDate'

export const CustomFilterDateRange = ({ dateState, handleEndDateChange, handleStartDateChange }) => {
  return (
    <div className="col-6">
      <div className="row">
        <div className="col-4">
          <FechaFilterRangeDate
            dateValue={dateState.fechaInicio}
            onNewfecEntSto={handleStartDateChange}
            label="Desde"
          />
        </div>
        <div className="col-4">
          <FechaFilterRangeDate
            dateValue={dateState.fechaFin}
            onNewfecEntSto={handleEndDateChange}
            label="Hasta"
          />
        </div>
      </div>
    </div>
  )
}
