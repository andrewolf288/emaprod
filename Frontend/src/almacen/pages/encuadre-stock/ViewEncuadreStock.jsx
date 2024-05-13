import React from 'react'
import { useOperacionEncuadreStockView } from '../../hooks/encuadre-stock/useOperacionEncuadreStockView'
import { CustomLoading } from '../../../components/CustomComponents/CustomLoading'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { RowOperacionEncuadreDetalle } from '../../components/componentes-encuadre/RowOperacionEncuadreDetalle'

export const ViewEncuadreStock = () => {
  const {
    loading, operacionEncuadreStockDetail
  } = useOperacionEncuadreStockView()
  return (
    <>
      <div className="container-fluid mx-3">
        <h1 className="mt-4 text-center">Detalle de operación cuadre stock</h1>
        <div className="row mt-4 mx-4">
          {/* DATOS DE LA OEPRACION */}
          <div className="card d-flex mb-4">
            <h6 className="card-header">Datos de la operacion</h6>
            <div className='card-body'>
              <div className='row'>
                <div className='col-2'>
                  <label htmlFor="nombre" className="form-label">
                    <b>Código almacen</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={operacionEncuadreStockDetail.codAlm}
                    className="form-control"
                  />
                </div>
                <div className='col-3'>
                  <label htmlFor="nombre" className="form-label">
                    <b>Nombre almacén</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={operacionEncuadreStockDetail.nomAlm}
                    className="form-control"
                  />
                </div>
                <div className='col-2'>
                  <label htmlFor="nombre" className="form-label">
                    <b>Fecha encuadre</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={operacionEncuadreStockDetail.fecCreOpeEnc}
                    className="form-control"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* DETALLES DE LA OPERACION */}
          <div className="card d-flex mb-4">
            <h6 className="card-header">Detalle de la operacion</h6>
            <div className='card-body'>
              <Paper>
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
                        <TableCell align="left" width={120} sx={{ fontWeight: 'bold' }}>
                          Lote
                        </TableCell>
                        <TableCell align="left" width={40} sx={{ fontWeight: 'bold' }}>
                          Código
                        </TableCell>
                        <TableCell align="left" width={200} sx={{ fontWeight: 'bold' }}>
                          Nombre
                        </TableCell>
                        <TableCell align="center" width={80} sx={{ fontWeight: 'bold' }}>
                          Cantidad anterior
                        </TableCell>
                        <TableCell align="center" width={80} sx={{ fontWeight: 'bold' }}>
                          Cantidad cuadrada
                        </TableCell>
                        <TableCell align="center" width={80} sx={{ fontWeight: 'bold' }}>
                          Variación
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {
                        operacionEncuadreStockDetail.detOpeEncStockDet.map((element) => {
                          return (
                            <RowOperacionEncuadreDetalle
                              key={element.id}
                              item={element}
                            />
                          )
                        })
                      }
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </div>
          </div>
        </div>
      </div>
      {/* DIALOG DE LOADING */}
      <CustomLoading
        open={loading}
      />
    </>
  )
}
