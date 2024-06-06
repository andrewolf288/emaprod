import React from 'react'
import { useReporteTrazabilidadLote } from '../../hooks/reportes/useReporteTrazabilidadLote'
import { CustomLoading } from '../../../components/CustomComponents/CustomLoading'
import { BuscarLoteProduccion } from '../../../components/CommonComponents/buscadores/BuscarLoteProduccion'
import { IconButton } from '@mui/material'
import CancelRoundedIcon from '@mui/icons-material/CancelRounded'

export const RoporteTrazabilidadLote = () => {
  const {
    loading,
    dataLoteProduccion,
    submitDataFilterToExcel,
    agregarLoteProduccions,
    quitarLoteProduccion,
    textInfoLote
  } = useReporteTrazabilidadLote()

  const exportDataExcel = () => {
    const URL = '/calidad/reportes/generate_reporte_produccion_calidad.php'
    submitDataFilterToExcel(URL, 'reporte-trazabilidad-calidad.xlsx')
  }

  return (
    <>
      <div className="container-fluid mx-3">
        <h1 className='text-center'>Reporte Trazabilidad Lote</h1>

        <div className="d-flex flex-row align-items-center mt-4">
          <span className='me-2'>{textInfoLote}</span>
          {
            dataLoteProduccion.idProdc === null
              ? (<BuscarLoteProduccion
                dataDetalle={{ index: 0 }}
                handleConfirm={agregarLoteProduccions}
              />)
              : (<IconButton
                color="error"
                onClick={() => { quitarLoteProduccion() }}
              >
                <CancelRoundedIcon fontSize="large" />
              </IconButton>)
          }
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
