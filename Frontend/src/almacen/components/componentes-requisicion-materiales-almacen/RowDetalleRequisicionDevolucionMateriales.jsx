import React from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'
import { CustomDialogUpdateOperation } from '../../../components/CustomComponents/CustomDialogUpdateOperation'
import { CustomDialogDeleteOperation } from '../../../components/CustomComponents/CustomDialogDeleteOperation'
import { CustomDialogConfirmOperation } from '../../../components/CustomComponents/CustomDialogConfirmOperation'

export const RowDetalleRequisicionDevolucionMateriales = ({
  requisicion,
  onUpdateDetalle,
  onDeleteDetalle,
  onCheckDetalle
}) => {
  const { detDev } = requisicion
  return (
    <div className="mt-2">
      <p>
        <b>Detalle</b>
      </p>
      <TableContainer key={detDev.id} component={Paper}>
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
            {detDev.map((detalle, index) => (
              <TableRow key={`${detalle.id} - ${index}`}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{detalle.desProdDevMot}</TableCell>
                <TableCell>{detalle.nomProd}</TableCell>
                <TableCell>{detalle.simMed}</TableCell>
                <TableCell>{detalle.canReqDevMatDet}</TableCell>
                <TableCell>
                  <span
                    className={
                      detalle.esComReqDevMatDet === 0
                        ? 'badge text-bg-danger'
                        : 'badge text-bg-success'
                    }
                  >
                    {detalle.esComReqDevMatDet === 0 ? 'Requerido' : 'Completo'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="btn-toolbar">
                    {/* BOTON DE VISTA DE DETALLE */}
                    <CustomDialogUpdateOperation
                      detalle={detalle}
                      disabled={detalle.esComReqDevMatDet !== 0}
                      onUpdateOperation={onUpdateDetalle}
                      formato={{
                        nombre: 'nomProd',
                        cantidad: 'canReqDevMatDet',
                        medida: 'simMed'
                      }}
                    />
                    <CustomDialogDeleteOperation
                      detalle={detalle}
                      disabled={detalle.esComReqDevMatDet !== 0}
                      onDeleteOperation={onDeleteDetalle}
                      formato={{
                        nombre: 'nomProd',
                        cantidad: 'canReqDevMatDet',
                        medida: 'simMed'
                      }}
                    />
                    <CustomDialogConfirmOperation
                      detalle={detalle}
                      disabled={detalle.esComReqDevMatDet !== 0}
                      onConfirmOperation={onCheckDetalle}
                      formato={{
                        nombre: 'nomProd',
                        cantidad: 'canReqDevMatDet',
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
