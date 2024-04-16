import React from 'react'
import { useIngresarProductoOrdenTransformacion } from '../../hooks/orden-transformacion/useIngresarProductoOrdenTransformacion'
import { RowIngresoProductoOrdenTransformacion } from '../../components/componentes-transdormacion/RowIngresoProductoOrdenTransformacion'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material'
import { FilterProductosProgramados } from '../../../components/ReferencialesFilters/Producto/FilterProductosProgramados'
import FechaPicker from '../../../components/Fechas/FechaPicker'
import FechaPickerYear from '../../../components/Fechas/FechaPickerYear'
import { RowEditIngresoProductoOrdenTransformacion } from '../../components/componentes-transdormacion/RowEditIngresoProductoOrdenTransformacion'
import { CustomActionsView } from '../../../components/CustomComponents/CustomActionsView'

export const IngresarProductoRequisicionTransformacion = () => {
  const {
    ordenTransformacion,
    productoFinal,
    detalleProductosFinales,
    onAddFecEntSto,
    onAddFecVenSto,
    onAddProductoFinalSubProducto,
    handledFormCantidadIngresada,
    handleAddProductoFinal,
    agregarLoteProduccionIngresoOrdenTransformacion,
    editarDetalleIngresoOrdenTransformacion,
    eliminarDetalleIngresoOrdenTransformacion,
    quitarLoteProduccionIngresoOrdenTransformacion,
    crearIngresosDetalleIingresoOrdenTransformacion
  } = useIngresarProductoOrdenTransformacion()

  return (
    <>
      <div className="container-fluid mx-3">
        <h1 className="mt-4 text-center">Ingreso Productos Orden Transformación</h1>
        <div className="row mt-4 mx-4">
          {/* Datos de produccion */}
          <div className="card d-flex">
            <h6 className="card-header">Datos de orden de transformación</h6>
            <div className="card-body">
              <div className="mb-3 row">
                {/* CORRELATIVO */}
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Correlativo</b>
                  </label>
                  <input
                    disabled={true}
                    type="text"
                    value={ordenTransformacion.correlativo ? ordenTransformacion.correlativo : ''}
                    className="form-control"
                  />
                </div>
                {/* PRODUCTO ORIGEN */}
                <div className="col-md-5 me-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Producto origen</b>
                  </label>
                  <input
                    disabled={true}
                    type="text"
                    value={ordenTransformacion.nomProd1}
                    className="form-control"
                  />
                </div>

                {/* CANTIDAD UNIDADES ORIGEN */}
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Cantidad origen</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={`${ordenTransformacion.canUndProdtOri} UND`}
                    className="form-control"
                  />
                </div>
                {/* CANTIDAD DE PESO ORIGEN */}
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Peso origen</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={`${ordenTransformacion.canPesProdtOri} KG`}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="mb-3 row d-flex align-items-center">
                {/* FECHA DE CREACIÓN */}
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Fecha creación</b>
                  </label>
                  <input
                    disabled={true}
                    type="text"
                    value={ordenTransformacion.fecCreOrdTrans}
                    className="form-control"
                  />
                </div>
                {/* PRODUCTO DESTINO */}
                <div className="col-md-5 me-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Producto destino</b>
                  </label>
                  <input
                    disabled={true}
                    type="text"
                    value={ordenTransformacion.nomProd2}
                    className="form-control"
                  />
                </div>

                {/* CANTIDAD UNIDADES DESTINO */}
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Cantidad destino</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={`${ordenTransformacion.canUndProdtDes} UND`}
                    className="form-control"
                  />
                </div>
                {/* CANTIDAD DE PESO DESTINO */}
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Peso destino</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={`${ordenTransformacion.canPesProdtDes} KG`}
                    className="form-control"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* REQUISICIONES DE AGREGACION REGISTRADAS */}
          <div className="card d-flex mt-4">
            <p className='card-header fw-bold'>Ingresos registrados</p>
            <Paper>
              <TableContainer>
                <Table sx={{ minWidth: 700 }} aria-label="customized table">
                  <TableHead>
                    <TableRow
                      sx={{
                        '& th': {
                          color: 'rgba(96, 96, 96)',
                          backgroundColor: '#f5f5f5'
                        }
                      }}
                    >
                      <TableCell align="left" width={60} sx={{ fontWeight: 'bold' }}>
                        Lote
                      </TableCell>
                      <TableCell align="left" width={140} sx={{ fontWeight: 'bold' }}>
                        Producto
                      </TableCell>
                      <TableCell align="left" width={20} sx={{ fontWeight: 'bold' }}>
                        Medida
                      </TableCell>
                      <TableCell align="left" width={50} sx={{ fontWeight: 'bold' }}>
                        Cantidad ingresada
                      </TableCell>
                      <TableCell align="left" width={50} sx={{ fontWeight: 'bold' }}>
                        Fecha ingreso
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {
                      ordenTransformacion.prodDetIng.map((ingreso) => (
                        <RowIngresoProductoOrdenTransformacion
                          key={ingreso.id}
                          detalle={ingreso}
                        />
                      ))
                    }
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </div>
          {/* REALIZAR INGRESO */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">
              <p className='card-header fw-bold'>Agregar ingreso</p>
            </h6>
            <div className="card-body">
              <form className="row mb-4 mt-4 d-flex flex-row justify-content-start align-items-end">
                {/* AGREGAR PRODUCTO */}
                <div className="col-md-4">
                  <label className="form-label">
                    Producto final o sub producto
                  </label>
                  {ordenTransformacion.idProdtDes !== 0 && (
                    <FilterProductosProgramados
                      onNewInput={onAddProductoFinalSubProducto}
                      products={[{
                        id: ordenTransformacion.idProdtDes,
                        codProd2: ordenTransformacion.codProd2,
                        nomProd: ordenTransformacion.nomProd2
                      }]}
                      defaultValue={productoFinal.idProdFin}
                    />
                  )}
                </div>

                <div className="col-md-2">
                  <label className="form-label">Fecha de entrada</label>
                  <FechaPicker
                    onNewfecEntSto={onAddFecEntSto}
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">Fecha de vencimiento</label>
                  <FechaPickerYear
                    onNewfecEntSto={onAddFecVenSto}
                    date={productoFinal.fecVenSto}
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">Cantidad</label>
                  <br />
                  <TextField
                    type="number"
                    autoComplete="off"
                    size="small"
                    name="cantidadIngresada"
                    value={productoFinal.cantidadIngresada}
                    onChange={handledFormCantidadIngresada}
                  />
                </div>

                {/* BOTON AGREGAR PRODUCTO */}
                <div className="col-md-2 align-self-center">
                  <button
                    onClick={handleAddProductoFinal}
                    className="btn btn-primary"
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
              </form>
              {/* LISTA DE PRODUCTOS */}
              <div className="mb-3 row">
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
                          <TableCell align="left" width={90} sx={{ fontWeight: 'bold' }}>
                            Lote
                          </TableCell>
                          <TableCell align="left" width={200} sx={{ fontWeight: 'bold' }}>
                            Nombre
                          </TableCell>
                          <TableCell align="left" width={120} sx={{ fontWeight: 'bold' }}>
                            Fecha entrada
                          </TableCell>
                          <TableCell align="left" width={120} sx={{ fontWeight: 'bold' }}>
                            Fecha vencimiento
                          </TableCell>
                          <TableCell align="left" width={100} sx={{ fontWeight: 'bold' }}>
                            Cantidad
                          </TableCell>
                          <TableCell align="center" width={100} sx={{ fontWeight: 'bold' }}>
                            Acciones
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {
                          detalleProductosFinales.map((element, index) => (
                            <RowEditIngresoProductoOrdenTransformacion
                              key={index}
                              detalle={element}
                              onEditDetalle={editarDetalleIngresoOrdenTransformacion}
                              onDeleteDetalle={eliminarDetalleIngresoOrdenTransformacion}
                              onAddLoteProduccion={agregarLoteProduccionIngresoOrdenTransformacion}
                              onRemoveLoteProduccion={quitarLoteProduccionIngresoOrdenTransformacion}
                            />
                          ))
                        }
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </div>
            </div>
          </div>
        </div>
        {/* ACCIONES DE BOTONES */}
        < CustomActionsView
          onSaveOperation={crearIngresosDetalleIingresoOrdenTransformacion}
        />
      </div>
    </>
  )
}
