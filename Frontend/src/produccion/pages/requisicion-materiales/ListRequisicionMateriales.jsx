import React, { useState, useEffect } from 'react'
// IMPORTACIONES PARA TABLE MUI
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import TablePagination from '@mui/material/TablePagination'
import { getRequisicionMaterialesWithDetalle } from '../../helpers/requisicion-materiales/getRequisicionMaterialesById'
import { RequisicionMoliendaDetalleOnlyView } from '../../../molienda/components/RequisicionMoliendaDetalleOnlyView'
import { Button } from '@mui/material'
import { PDFRequisicionMateriales } from '../../components/componentes-requisicion-materiales/PDFRequisicionMateriales'
import { createRoot } from 'react-dom/client'

export const ListRequisicionMateriales = () => {
  // ESTADOS PARA LOS FILTROS PERSONALIZADOS
  const [dataRequisicion, setdataRequisicion] = useState([])

  // ESTADOS PARA EL MODAL
  const [mostrarDetalle, setMostrarDetalle] = useState(false)
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null)

  // ESTADOS PARA LA PAGINACIÓN
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  // MANEJADORES DE LA PAGINACION
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // FUNCION PARA TRAER LA DATA DE REQUISICION MOLIENDA
  const obtenerDataRequisicionMateriales = async () => {
    const resultPeticion = await getRequisicionMaterialesWithDetalle()
    const { message_error, description_error, result } = resultPeticion
    if (message_error.length === 0) {
      setdataRequisicion(result)
    } else {
      alert(description_error)
    }
  }

  // funcion para mostrar pdf
  const generatePDF = (data) => {
    const formatData = {
      requisicion: data
    }
    const newWindow = window.open(
      '',
      'Requisicion materiales',
      'fullscreen=yes'
    )
    // Crear un contenedor específico para tu aplicación
    const appContainer = newWindow.document.createElement('div')
    newWindow.document.body.appendChild(appContainer)
    const root = createRoot(appContainer)
    root.render(<PDFRequisicionMateriales data={formatData} />)
  }

  // ******* REQUISICION MATERIALES DETALLE ********
  const closeDetalleRequisicionMateriales = () => {
    // ocultamos el modal
    setMostrarDetalle(false)
    // dejamos el null la data del detalle
    setDetalleSeleccionado(null)
  }

  // MOSTRAR Y OCULTAR DETALLE DE REQUISICION MOLIENDA
  const showRequisicionMaterialesDetalle = (idPosElement) => {
    // var ss = dataRequisicionTemp[idPosElement].reqMolDet
    const ss = dataRequisicion[idPosElement].reqDet
    const requisicionMoliendaDetalle = ss
    // return;
    setDetalleSeleccionado(requisicionMoliendaDetalle)
    setMostrarDetalle(true)
  }

  useEffect(() => {
    obtenerDataRequisicionMateriales()
  }, [])

  return (
    <>
      <div className="container-fluid">
        <div className="col-9 mt-4">
          <div className="row" style={{ border: '0px solid black' }}>
            <div
              className="col-3"
              style={{
                display: 'flex',
                justifyContent: 'end',
                alignItems: 'center'
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  window.open('/produccion/requisicion-materiales/crear')
                }}
              >
                Crear Requisición
              </Button>
            </div>
          </div>
        </div>
        {/* TABLA DE RESULTADOS */}
        <div className="mt-4">
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
                    <TableCell align="left" width={70}>
                      <b>Codigo</b>
                    </TableCell>
                    <TableCell align="center" width={70}>
                      <b>Estado</b>
                    </TableCell>
                    <TableCell align="left" width={80}>
                      <b>Fecha requerido</b>
                    </TableCell>
                    <TableCell align="left" width={80}>
                      <b>Fecha terminado</b>
                    </TableCell>
                    <TableCell align="left" width={80}>
                      <b>Acciones</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataRequisicion
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, i) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 }
                        }}
                      >
                        <TableCell align="left" width={100}>
                          <b>{row.codReq}</b>
                        </TableCell>
                        <TableCell align="center">
                          <span
                            className={
                              row.idReqEst === 1
                                ? 'badge text-bg-danger'
                                : row.idReqEst === 2
                                  ? 'badge text-bg-warning'
                                  : row.idReqEst === 3
                                    ? 'badge text-bg-success'
                                    : 'badge text-bg-success'
                            }
                          >
                            {row.desReqEst}
                          </span>
                        </TableCell>
                        <TableCell align="left">{row.fecPedReq}</TableCell>
                        <TableCell align="left">
                          {row.fecEntReq === null
                            ? 'Aun no terminado'
                            : row.fecEntReq}
                        </TableCell>
                        <TableCell align="left">
                          <div className="btn-toolbar">
                            <button
                              onClick={() => {
                                showRequisicionMaterialesDetalle(i)
                              }}
                              className="btn btn-primary me-2 btn"
                              data-toggle="modal"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-eye-fill"
                                viewBox="0 0 16 16"
                              >
                                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
                                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
                              </svg>
                            </button>
                            <button
                              title="PDF produccion"
                              onClick={() => {
                                generatePDF(row)
                              }}
                              className="btn btn-danger me-2 btn"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-file-earmark-pdf-fill"
                                viewBox="0 0 16 16"
                              >
                                <path d="M5.523 12.424c.14-.082.293-.162.459-.238a7.878 7.878 0 0 1-.45.606c-.28.337-.498.516-.635.572a.266.266 0 0 1-.035.012.282.282 0 0 1-.026-.044c-.056-.11-.054-.216.04-.36.106-.165.319-.354.647-.548zm2.455-1.647c-.119.025-.237.05-.356.078a21.148 21.148 0 0 0 .5-1.05 12.045 12.045 0 0 0 .51.858c-.217.032-.436.07-.654.114zm2.525.939a3.881 3.881 0 0 1-.435-.41c.228.005.434.022.612.054.317.057.466.147.518.209a.095.095 0 0 1 .026.064.436.436 0 0 1-.06.2.307.307 0 0 1-.094.124.107.107 0 0 1-.069.015c-.09-.003-.258-.066-.498-.256zM8.278 6.97c-.04.244-.108.524-.2.829a4.86 4.86 0 0 1-.089-.346c-.076-.353-.087-.63-.046-.822.038-.177.11-.248.196-.283a.517.517 0 0 1 .145-.04c.013.03.028.092.032.198.005.122-.007.277-.038.465z" />
                                <path
                                  fillRule="evenodd"
                                  d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5.5 1.5v2a1 1 0 0 0 1 1h2l-3-3zM4.165 13.668c.09.18.23.343.438.419.207.075.412.04.58-.03.318-.13.635-.436.926-.786.333-.401.683-.927 1.021-1.51a11.651 11.651 0 0 1 1.997-.406c.3.383.61.713.91.95.28.22.603.403.934.417a.856.856 0 0 0 .51-.138c.155-.101.27-.247.354-.416.09-.181.145-.37.138-.563a.844.844 0 0 0-.2-.518c-.226-.27-.596-.4-.96-.465a5.76 5.76 0 0 0-1.335-.05 10.954 10.954 0 0 1-.98-1.686c.25-.66.437-1.284.52-1.794.036-.218.055-.426.048-.614a1.238 1.238 0 0 0-.127-.538.7.7 0 0 0-.477-.365c-.202-.043-.41 0-.601.077-.377.15-.576.47-.651.823-.073.34-.04.736.046 1.136.088.406.238.848.43 1.295a19.697 19.697 0 0 1-1.062 2.227 7.662 7.662 0 0 0-1.482.645c-.37.22-.699.48-.897.787-.21.326-.275.714-.08 1.103z"
                                />
                              </svg>
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/* PAGINACION DE LA TABLA */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={dataRequisicion.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </div>
      </div>
      {mostrarDetalle && (
        <RequisicionMoliendaDetalleOnlyView
          detalle={detalleSeleccionado}
          onClose={closeDetalleRequisicionMateriales}
        />
      )}
    </>
  )
}
