import React from 'react'
import { TableCell, TableRow } from '@mui/material'
import { mostrarMesYAnio } from '../../../utils/functions/FormatDate'
import { CustomDialogConfirmOperation } from '../../../components/CustomComponents/CustomDialogConfirmOperation'
import { CustomDialogUpdateOperation } from '../../../components/CustomComponents/CustomDialogUpdateOperation'
import { CustomDialogDeleteOperation } from '../../../components/CustomComponents/CustomDialogDeleteOperation'

export const RowEditRequisicionEmpaquetadoPromocionalAlmacen = (
  {
    detalle,
    onUpdateDetalleRequisicion,
    onDeleteDetalleRequisicion,
    onCreateSalida
  }
) => {
  const { codLotProd, fecVenLotProd, idProdc } = detalle
  const textInfoLote = idProdc === null ? 'FIFO' : `${codLotProd} - ${mostrarMesYAnio(fecVenLotProd)}`

  return (
    <TableRow>
      {detalle.esProdFin === 1 &&
      (<TableCell><span className='me-2'>{textInfoLote}</span></TableCell>)
      }
      <TableCell>{detalle.codProd2}</TableCell>
      <TableCell>{detalle.nomProd}</TableCell>
      <TableCell>
        <span className={`badge text-bg-${detalle.esCom === 1 ? 'success' : 'danger'}`}>
          {detalle.esCom === 1 ? 'Completado' : 'Requerido'}
        </span>
      </TableCell>
      <TableCell align='center'>
        {detalle.canReqEmpPromDet}
      </TableCell>
      <TableCell>
        <div className="btn-toolbar d-flex justify-content-center">
          {/* BOTON DE VISTA DE DETALLE */}
          <CustomDialogConfirmOperation
            detalle={detalle}
            disabled={detalle.esCom !== 0}
            onConfirmOperation={onCreateSalida}
            formato={{
              nombre: 'nomProd',
              cantidad: 'canReqEmpPromDet',
              medida: 'simMed'
            }}
          />
          {/* EDICION DEL DETALLE */}
          <CustomDialogUpdateOperation
            detalle={detalle}
            disabled={detalle.esCom !== 0}
            onUpdateOperation={onUpdateDetalleRequisicion}
            formato={{
              nombre: 'nomProd',
              cantidad: 'canReqEmpPromDet',
              medida: 'simMed'
            }}
          />
          {/* ELIMINACION DE DETALLE */}
          <CustomDialogDeleteOperation
            detalle={detalle}
            disabled={detalle.esCom !== 0}
            onDeleteOperation={onDeleteDetalleRequisicion}
            formato={{
              nombre: 'nomProd',
              cantidad: 'canReqEmpPromDet',
              medida: 'simMed'
            }}
          />
        </div>
      </TableCell>
    </TableRow>
  )
}
