import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'
import { CustomDialogUpdateOperation } from '../../../components/CustomComponents/CustomDialogUpdateOperation'
import { CustomDialogDeleteOperation } from '../../../components/CustomComponents/CustomDialogDeleteOperation'
import { CustomDialogConfirmOperation } from '../../../components/CustomComponents/CustomDialogConfirmOperation'

export const CardRequisicionIngresoProductos = ({
  requisicion,
  onDeleteRequisicionAgregacionDetalle,
  onUpdateRequisicionAgregacionDetalle,
  onCheckRequisicionAgrgeacionDetalle
}) => {
  console.log(requisicion)
  return (
    <div className="card mt-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6>Detalle de Requisición</h6>
      </div>
      <div className="card-body">
        <TableContainer component={Paper}>
          <Table>
            <TableHead style={{ backgroundColor: '#F3DBB6' }}>
              <TableRow>
                <TableCell>
                  <b>Ref.</b>
                </TableCell>
                <TableCell>
                  <b>Presentacion</b>
                </TableCell>
                <TableCell>
                  <b>Cantidad</b>
                </TableCell>
                <TableCell>
                  <b>Fecha entrada</b>
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
              <TableRow>
                <TableCell>{requisicion.refProdtProg}</TableCell>
                <TableCell>{requisicion.nomProd}</TableCell>
                <TableCell>{requisicion.canProdIng}</TableCell>
                <TableCell>{requisicion.fecProdIng}</TableCell>
                <TableCell>
                  <span
                    className={
                      requisicion.esComProdIng === 0
                        ? 'badge text-bg-danger'
                        : 'badge text-bg-success'
                    }
                  >
                    {requisicion.esComProdIng === 0 ? 'Requerido' : 'Completo'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="btn-toolbar">
                    <CustomDialogUpdateOperation
                      detalle={requisicion}
                      disabled={requisicion.esComProdIng === 1}
                      onUpdateOperation={onUpdateRequisicionAgregacionDetalle}
                      formato={{
                        nombre: 'nomProd',
                        cantidad: 'canProdIng',
                        medida: 'simMed'
                      }}
                    />
                    <CustomDialogDeleteOperation
                      detalle={requisicion}
                      disabled={requisicion.esComProdIng === 1}
                      onDeleteOperation={onDeleteRequisicionAgregacionDetalle}
                      formato={{
                        nombre: 'nomProd',
                        cantidad: 'canProdIng',
                        medida: 'simMed'
                      }}
                    />
                    <CustomDialogConfirmOperation
                      detalle={requisicion}
                      disabled={requisicion.esComProdIng === 1}
                      onDeleteOperation={onCheckRequisicionAgrgeacionDetalle}
                      formato={{
                        nombre: 'nomProd',
                        cantidad: 'canProdIng',
                        medida: 'simMed'
                      }}
                    />
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  )
}
