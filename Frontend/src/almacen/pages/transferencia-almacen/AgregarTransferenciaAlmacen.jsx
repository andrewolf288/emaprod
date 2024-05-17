import React from 'react'
import { CustomActionsView } from '../../../components/CustomComponents/CustomActionsView'
import { FilterProductosDynamic } from '../../../components/ReferencialesFilters/Producto/FilterProductosDynamic'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material'
import { useCreateTransferenciaAlmacenes } from '../../hooks/transferencia-almacenes/useCreateTransferenciaAlmacenes'
import { RowEditTransferenciaAlmacenDetalle } from '../../components/componentes-transferencia-almacenes/RowEditTransferenciaAlmacenDetalle'
import { FilterAlmacenDynamicOnlyData } from '../../../components/ReferencialesFilters/Almacen/FilterAlmacenDynamicOnlyData'

export const AgregarTransferenciaAlmacen = () => {
  const {
    transferenciaAlmacen,
    produtSelected,
    handleAddProductoDetalleRequisicionMateriales,
    handleChangeCantidadRequisicionMateriales,
    handleChangeProductoRequisicionMateriales,
    almacenes,
    handleChangeAlmacenDestino,
    handleChangeAlmacenOrigen,
    deleteDetalleTransferenciaAlmacenes,
    updateDetalleTransferenciaAlmacenes,
    onAddReferenciaEntradasSalidaTransferencia,
    onAddReferenciaLoteProduccionSalidaTransferencia,
    onRemoveReferenciaEntradasSalidaTransferencia,
    onRemoveReferenciaLoteProduccionSalidaTransferencia,
    crearTransferenciaAlmacenes
  } = useCreateTransferenciaAlmacenes()
  return <>
    <div className='cotainer-fluid'>
      <p className='text-center fs-3 fw-bold'>Transferencia entre almacenes</p>
      <div className='card m-3'>
        <p className='card-header p-2 fw-semibold'>Información de transferencia</p>
        <div className='card-body'>
          <div className='row mb-2 mb-md-2'>
            <div className='col-md-3 col-12 mb-2'>
              <label className="form-label fw-semibold">Almacen origen</label>
              <FilterAlmacenDynamicOnlyData
                defaultValue={transferenciaAlmacen.idAlmOri}
                onNewInput={handleChangeAlmacenOrigen}
                onlyData={almacenes}
              />
            </div>
            <div className='col-md-3 col-12'>
              <label className="form-label fw-semibold">Almacen destino</label>
              <FilterAlmacenDynamicOnlyData
                defaultValue={transferenciaAlmacen.idAlmDes}
                onNewInput={handleChangeAlmacenDestino}
                onlyData={almacenes}
              />
            </div>
          </div>
          <div className='row'>
            <label className="form-label fw-semibold">Observación</label>
            <div className='row ms-1'>
              <textarea className="form-control" placeholder="Deja una observación"></textarea>
            </div>
          </div>
        </div>
      </div>
      <div className='card m-3'>
        <p className='card-header p-2 fw-semibold'>Detalle de transferencia</p>
        <div className='card-body'>
          <div className='d-flex flex-row justify-content-start align-items-center'>
            <div className='col-md-6 col-12'>
              <label className="form-label fw-semibold">Producto</label>
              <FilterProductosDynamic
                defaultValue={produtSelected.idProdt}
                onNewInput={handleChangeProductoRequisicionMateriales}
              />
            </div>
            <div className='col-md-2 col-12 ms-4'>
              <label className="form-label fw-semibold">Cantidad</label>
              <TextField
                autoComplete='off'
                type='number'
                size='small'
                value={produtSelected.cantReqMatDet}
                onWheel={(e) => { e.target.blur() }}
                onChange={handleChangeCantidadRequisicionMateriales}
              >
              </TextField>
            </div>
            <div className="col-md-3 col-12 d-flex justify-content-end ms-auto">
              <button
                className="btn btn-primary"
                onClick={handleAddProductoDetalleRequisicionMateriales}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-plus-circle-fill me-2"
                  viewBox="0 0 16 16"
                >
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z" />
                </svg>
                Agregar
              </button>
            </div>
          </div>
          <Paper className='mt-4'>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow
                    sx={{
                      '& th': {
                        color: 'rgba(96, 96, 96)',
                        backgroundColor: '#f5f5f5'
                      }
                    }}
                  >
                    <TableCell align='left' width={70} sx={{ fontWeight: 'bold' }}>
                      Referencia
                    </TableCell>
                    <TableCell align="left" width={100} sx={{ fontWeight: 'bold' }}>
                      Codigo
                    </TableCell>
                    <TableCell align="left" width={120} sx={{ fontWeight: 'bold' }}>
                      Clase
                    </TableCell>
                    <TableCell align='left' width={200} sx={{ fontWeight: 'bold' }}>
                      Nombre
                    </TableCell>
                    <TableCell align="left" width={150} sx={{ fontWeight: 'bold' }}>
                      Cantidad
                    </TableCell>
                    <TableCell align="left" width={150} sx={{ fontWeight: 'bold' }}>
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transferenciaAlmacen.detTranAlm.map((element, index) => (
                    <RowEditTransferenciaAlmacenDetalle
                      key={index}
                      detalle={element}
                      idAlmacen={transferenciaAlmacen.idAlmOri}
                      onDelete={deleteDetalleTransferenciaAlmacenes}
                      onEdit={updateDetalleTransferenciaAlmacenes}
                      onAgregarReferenciaEntrada={onAddReferenciaEntradasSalidaTransferencia}
                      onAgregarReferenciaLoteProduccion={onAddReferenciaLoteProduccionSalidaTransferencia}
                      onQuitarReferenciaEntrada={onRemoveReferenciaEntradasSalidaTransferencia}
                      onQuitarReferenciaLoteProduccion={onRemoveReferenciaLoteProduccionSalidaTransferencia}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </div>
      </div>
      <CustomActionsView
        onSaveOperation={crearTransferenciaAlmacenes}
      />
    </div>
  </>
}
