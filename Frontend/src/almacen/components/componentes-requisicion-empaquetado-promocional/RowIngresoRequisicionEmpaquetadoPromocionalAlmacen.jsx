import React from 'react'
import { TableCell, TableRow } from '@mui/material'
import { CustomDialogConfirmOperation } from '../../../components/CustomComponents/CustomDialogConfirmOperation'
import { CustomDialogUpdateOperation } from '../../../components/CustomComponents/CustomDialogUpdateOperation'
import { CustomDialogDeleteOperation } from '../../../components/CustomComponents/CustomDialogDeleteOperation'

export const RowIngresoRequisicionEmpaquetadoPromocionalAlmacen = ({ detalle, onUpdateDetalleRequisicion, onDeleteDetalleRequisicion, onCreateSalida }) => {
  return (
    <TableRow>
      <TableCell>{detalle.codProd2}</TableCell>
      <TableCell>{detalle.nomProd}</TableCell>
      <TableCell>
        <span className={`badge text-bg-${detalle.esComProdIng === 1 ? 'success' : 'danger'}`}>
          {detalle.esComProdIng === 1 ? 'Completado' : 'Requerido'}
        </span>
      </TableCell>
      <TableCell align='center'>
        {detalle.canProdIng}
      </TableCell>
      <TableCell>
        <div className="btn-toolbar d-flex justify-content-center">
          {/* BOTON DE VISTA DE DETALLE */}
          <CustomDialogConfirmOperation
            detalle={detalle}
            disabled={detalle.esComProdIng !== 0}
            onConfirmOperation={onCreateSalida}
            formato={
              {
                nombre: 'nomProd',
                cantidad: 'canProdIng',
                medida: 'simMed'
              }
            }
          />
          {/* EDICION DEL DETALLE */}
          <CustomDialogUpdateOperation
            detalle={detalle}
            disabled={detalle.esComProdIng !== 0}
            onUpdateOperation={onUpdateDetalleRequisicion}
            formato={
              {
                nombre: 'nomProd',
                cantidad: 'canProdIng',
                medida: 'simMed'
              }
            }
          />
          {/* ELIMINACION DE DETALLE */}
          <CustomDialogDeleteOperation
            detalle={detalle}
            disabled={detalle.esComProdIng !== 0}
            onDeleteOperation={onDeleteDetalleRequisicion}
            formato={
              {
                nombre: 'nomProd',
                cantidad: 'canProdIng',
                medida: 'simMed'
              }
            }
          />
        </div>
      </TableCell>
    </TableRow>
  )
}
