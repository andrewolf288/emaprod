import React from 'react'
import { CustomFilterDateRange } from '../../../components/CustomComponents/CustomFilterDateRange'
import { CustomLoading } from '../../../components/CustomComponents/CustomLoading'
import { FilterCategoriasReporteEmpaquesCalidad } from '../../../components/ReferencialesFilters/ReporteCalidad/FilterCategoriasReporteEmpaquesCalidad'
import { useReporteCategoria } from '../../hooks/reportes/useReporteCategoria'

export const ReporteF09 = () => {
  const {
    dateState,
    handleEndDateChange,
    handleStartDateChange,
    loading,
    submitDataFilterToExcel,
    categoria,
    onChangeCategoria
  } = useReporteCategoria()

  const exportDataExcel = () => {
    const URL = '/calidad/reportes/reporte-emacal-F09.php'
    submitDataFilterToExcel(URL, { ...dateState, categoria })
  }

  return (
    <>
      <div className="container-fluid mx-3">
        <h1 className='text-center'>Reporte de calidad F09</h1>
        {/* RANGO DE FECHAS */}
        <div className="row d-flex mt-4">
          <CustomFilterDateRange
            dateState={dateState}
            handleStartDateChange={handleStartDateChange}
            handleEndDateChange={handleEndDateChange}
          />
          <div className='col col-4'>
            <FilterCategoriasReporteEmpaquesCalidad
              defaultValue={categoria}
              onNewInput={onChangeCategoria}
            />
          </div>
        </div>
        <div className="row d-flex flex-row justify-content-center mt-4">
          <p className="text-bg-light p-3 fs-4 fw-bold">Formatos para exportar</p>
          <div className="col-1">
            <button onClick={exportDataExcel} className="btn btn-success">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-file-earmark-excel-fill"
                viewBox="0 0 16 16"
              >
                <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM5.884 6.68 8 9.219l2.116-2.54a.5.5 0 1 1 .768.641L8.651 10l2.233 2.68a.5.5 0 0 1-.768.64L8 10.781l-2.116 2.54a.5.5 0 0 1-.768-.641L7.349 10 5.116 7.32a.5.5 0 1 1 .768-.64z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <CustomLoading
        open={loading}
      />
    </>
  )
}