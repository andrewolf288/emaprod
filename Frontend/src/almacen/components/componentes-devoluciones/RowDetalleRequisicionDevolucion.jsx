import React from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'
import { CustomDialogUpdateOperation } from '../../../components/CustomComponents/CustomDialogUpdateOperation'
import { CustomDialogDeleteOperation } from '../../../components/CustomComponents/CustomDialogDeleteOperation'
import { CustomDialogConfirmOperation } from '../../../components/CustomComponents/CustomDialogConfirmOperation'

export const RowDetalleRequisicionDevolucion = ({
  requisicion,
  onUpdateDetalle,
  onDeleteDetalle,
  onCheckDetalle
}) => {
  const { detReqDev } = requisicion

  const onCheckAuxDetalle = (detalle) => {
    onCheckDetalle(detalle, requisicion)
  }
  return (
    <div className="mt-2">
      <p>
        <b>Detalle</b>
      </p>
      <TableContainer key={detReqDev.id} component={Paper}>
        <Table>
          <TableHead style={{ backgroundColor: '#FEE7BC' }}>
            <TableRow>
              <TableCell>
                <b>#</b>
              </TableCell>
              <TableCell>
                <b>Motivo</b>
              </TableCell>
              <TableCell>
                <b>Producto</b>
              </TableCell>
              <TableCell>
                <b>Medida</b>
              </TableCell>
              <TableCell>
                <b>Cantidad</b>
              </TableCell>
              <TableCell>
                <b>Estado</b>
              </TableCell>
              <TableCell>
                <b>Acciones</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {detReqDev.map((detalle, index) => (
              <TableRow key={`${detalle.id} - ${index}`}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{detalle.desProdDevMot}</TableCell>
                <TableCell>{detalle.nomProd}</TableCell>
                <TableCell>{detalle.simMed}</TableCell>
                <TableCell>{detalle.canReqDevDet}</TableCell>
                <TableCell>
                  <span
                    className={
                      detalle.esComReqDevDet === 0
                        ? 'badge text-bg-danger'
                        : 'badge text-bg-success'
                    }
                  >
                    {detalle.esComReqDevDet === 0 ? 'Requerido' : 'Completo'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="btn-toolbar">
                    <CustomDialogUpdateOperation
                      detalle={detalle}
                      disabled={detalle.esComReqDevDet === 1}
                      onUpdateOperation={onUpdateDetalle}
                      formato={{
                        nombre: 'nomProd',
                        cantidad: 'canReqDevDet',
                        medida: 'simMed'
                      }}
                    />
                    <CustomDialogDeleteOperation
                      detalle={detalle}
                      disabled={detalle.esComReqDevDet === 1}
                      onDeleteOperation={onDeleteDetalle}
                      formato={{
                        nombre: 'nomProd',
                        cantidad: 'canReqDevDet',
                        medida: 'simMed'
                      }}
                    />
                    <CustomDialogConfirmOperation
                      detalle={detalle}
                      disabled={detalle.esComReqDevDet === 1}
                      onConfirmOperation={onCheckAuxDetalle}
                      formato={{
                        nombre: 'nomProd',
                        cantidad: 'canReqDevDet',
                        medida: 'simMed'
                      }}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}
