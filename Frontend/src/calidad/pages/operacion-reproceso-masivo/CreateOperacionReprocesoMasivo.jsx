import React from 'react'
import { CustomActionsView } from '../../../components/CustomComponents/CustomActionsView'
import { useCreateOperacionReprocesoMasivo } from '../../hooks/operacion-reproceso-masivo/useCreateOperacionReprocesoMasivo'
import { IconButton } from '@mui/material'
import CancelRoundedIcon from '@mui/icons-material/CancelRounded'
import { BuscarLoteProduccion } from '../../../components/CommonComponents/buscadores/BuscarLoteProduccion'
import { mostrarMesYAnio } from '../../../utils/functions/FormatDate'

export const CreateOperacionReprocesoMasivo = () => {
  const {
    informacionLoteProduccion,
    detalleReprocesoMasivo,
    buscarLoteProduccion,
    quitarLoteProduccion
  } = useCreateOperacionReprocesoMasivo()
  return (
    <>
      <div className='container-flex m-4'>
        <h1 className='text-center fs-2 mt-4 mb-4'>Creación de operación de reproceso masivo</h1>
        <div className='card mb-4 '>
          <div className='card-header fw-bold'>Información de lote de producción</div>
          <div className='card-body'>
            {/* SECCION DE SELECCION DE LOTE DE PRODUCCION */}
            <div className='text-center mb-4'>
              {informacionLoteProduccion.idProdc !== null
                ? <div>
                  <span className='badge text-bg-primary p-2'>{`${informacionLoteProduccion.codLotProd} - ${mostrarMesYAnio(informacionLoteProduccion.fecVenLotProd)}`}</span>
                  <IconButton
                    color="error"
                    onClick={quitarLoteProduccion}
                  >
                    <CancelRoundedIcon fontSize="large" />
                  </IconButton>
                </div>
                : <div>
                  <span className='badge text-bg-danger p-2'>Seleccione un lote</span>
                  <BuscarLoteProduccion handleConfirm={buscarLoteProduccion}/>
                </div>}
            </div>
            {/*  DATOS DE PRODUCCION */}
            <div className='d-flex flex-row justify-content-center gap-4'>
              <div className='col-3'>
                <label className='form-label fw-semibold'>Lote</label>
                <input type="text" className="form-control" value={`${informacionLoteProduccion.idProdc !== null ? informacionLoteProduccion.codLotProd : 'Sin asignar'}`} disabled/>
              </div>
              <div className='col-3'>
                <label className='form-label fw-semibold'>Fecha vencimiento</label>
                <input type="text" className="form-control" value={`${informacionLoteProduccion.idProdc !== null ? informacionLoteProduccion.fecVenLotProd : 'Sin asignar'}`} disabled/>
              </div>
              <div className='col-3'>
                <label className='form-label fw-semibold'>Fecha de producción</label>
                <input type="text" className="form-control" value={`${informacionLoteProduccion.idProdc !== null ? informacionLoteProduccion.fecProdIni : 'Sin asignar'}`} disabled/>
              </div>
            </div>
            {/* BOTON DE GENERACIÓN AUTOMÁTICA */}
            <div className='d-flex flex-row justify-content-center mt-4'>
              <button className='btn btn-primary btn-md' disabled={informacionLoteProduccion.idProdc === null}>Traer detalle</button>
            </div>
          </div>
        </div>
        {/* DETALLE DE REPROCESO POR ITEMS */}
        <div className='card'>
          <div className='card-header fw-bold'>Detalle de reproceso</div>
          <div className='card-body col-xs-12 col-sm-6 col-md-8'>

          </div>
        </div>
      </div>
      <CustomActionsView onShowCreateButton={true}/>
    </>
  )
}
