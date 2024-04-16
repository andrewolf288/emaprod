import React, { useEffect, useState } from 'react'
import { FormatDateMYSQL } from '../../../utils/functions/FormatDate'
import FechaPickerMonth from '../../../components/Fechas/FechaPickerMonth'
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow
} from '@mui/material'
import { getOrdenesTransformacion } from '../../helpers/requisicion-transformacion/getOrdenesTransformacion'
import { Link } from 'react-router-dom'
import config from '../../../config'
import axios from 'axios'
import { createRoot } from 'react-dom/client'
import { PDFTransformacion } from '../../components/componentes-transdormacion/PDFTransformacion'
import UnarchiveIcon from '@mui/icons-material/Unarchive'

export const ListRequisicionTransformacion = () => {
  const [dataOrdenTransformacion, setdataOrdenTransformacion] = useState([])

  // filtros
  const [formState, setformState] = useState({
    fechaInicio: FormatDateMYSQL(),
    fechaFin: FormatDateMYSQL()
  })

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

  // Filtros generales que hacen nuevas consultas
  const handleFechaInicioChange = (newfecEntSto) => {
    const dateFormat = newfecEntSto.split(' ')[0]
    setformState({
      ...formState,
      fechaInicio: dateFormat
    })

    // armamos el body
    const body = {
      ...formState,
      fechaInicio: dateFormat
    }
    obtenerdataOrdenTransformacion(body)
  }

  const handleFechaFinChange = (newfecEntSto) => {
    const dateFormat = newfecEntSto.split(' ')[0]
    setformState({
      ...formState,
      fechaFin: dateFormat
    })

    // armamos el body
    const body = {
      ...formState,
      fechaFin: dateFormat
    }
    obtenerdataOrdenTransformacion(body)
  }

  // FUNCION PARA TRAER LA DATA DE REQUISICION MOLIENDA
  const obtenerdataOrdenTransformacion = async (formState) => {
    const resultPeticion = await getOrdenesTransformacion(formState)
    const { message_error, description_error, result } = resultPeticion
    if (message_error.length === 0) {
      setdataOrdenTransformacion(result)
    } else {
      alert(description_error)
    }
  }

  // EXPORT PDF REQUISICION
  const exportPDFRequisicionTransformacion = async (idOrdTrans) => {
    // primero hacemos una requisicion para traer los datos necesarios
    const domain = config.API_URL
    const path =
      '/produccion/requisicion-transformacion/reportPDFOrdenTransformacion.php'
    axios({
      url: domain + path,
      data: {
        idOrdTrans
      },
      method: 'POST'
    })
      .then((response) => {
        const { data } = response
        const { message_error, description_error, result } = data

        if (message_error.length === 0) {
          const newWindow = window.open('', 'Transformacion', 'fullscreen=yes')
          // Crear un contenedor específico para tu aplicación
          const appContainer = newWindow.document.createElement('div')
          newWindow.document.body.appendChild(appContainer)
          const root = createRoot(appContainer)
          root.render(<PDFTransformacion data={result} />)
        } else {
          alert(description_error)
        }
      })
      .catch((error) => alert('Error al descargar el archivo', error))
  }

  // ****** TRAEMOS LA DATA DE REQUISICION MOLIENDA ******
  useEffect(() => {
    obtenerdataOrdenTransformacion()
  }, [])

  return (
    <>
      <div className="container-fluid">
        <div className="row d-flex mt-4">
          <div className="col-6">
            <div className="row">
              <div className="col-4">
                <FechaPickerMonth
                  onNewfecEntSto={handleFechaInicioChange}
                  label="Desde"
                />
              </div>
              <div className="col-4">
                <FechaPickerMonth
                  onNewfecEntSto={handleFechaFinChange}
                  label="Hasta"
                />
              </div>
            </div>
          </div>
          <div className="col-6 d-flex justify-content-end align-items-center">
            <div className="row me-4">
              <Link
                to={'/produccion/requisicion-transformacion/crear'}
                className="btn btn-primary"
              >
                Crear orden
              </Link>
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
                    <TableCell align="left" width={50}>
                      <strong>Codigo lote</strong>
                    </TableCell>
                    <TableCell align="left" width={120}>
                      <strong>Producto a transformar</strong>
                    </TableCell>
                    <TableCell align="center" width={70}>
                      <strong>Cantidad a transformar</strong>
                    </TableCell>
                    <TableCell align="left" width={120}>
                      <strong>Producto transformado</strong>
                    </TableCell>
                    <TableCell align="center" width={70}>
                      <strong>Cantidad transformada</strong>
                    </TableCell>
                    <TableCell align="left" width={140}>
                      <strong>Fecha creación</strong>
                    </TableCell>
                    <TableCell align="left" width={70}>
                      <strong>Acciones</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataOrdenTransformacion
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, i) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 }
                        }}
                      >
                        <TableCell align="left">{row.codLotProd}</TableCell>
                        <TableCell align="left">{row.nomProd1}</TableCell>
                        <TableCell align="center">
                          {row.canUndProdtOri}
                        </TableCell>
                        <TableCell align="left">{row.nomProd2}</TableCell>
                        <TableCell align="center">
                          {row.canUndProdtDes}
                        </TableCell>
                        <TableCell align="left">{row.fecCreOrdTrans}</TableCell>
                        <TableCell align="left">
                          <div className="btn-toolbar">
                            <Link
                              className="btn btn-warning me-2"
                              title="Presentaciones finales"
                              to={`ingreso-productos/${row.id}`}
                            >
                              <UnarchiveIcon />
                            </Link>
                            <button
                              className="btn btn-danger"
                              onClick={() =>
                                exportPDFRequisicionTransformacion(row.id)
                              }
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-file-earmark-pdf-fill"
                                viewBox="0 0 16 16"
                              >
                                <path d="M5.523 12.424q.21-.124.459-.238a8 8 0 0 1-.45.606c-.28.337-.498.516-.635.572l-.035.012a.3.3 0 0 1-.026-.044c-.056-.11-.054-.216.04-.36.106-.165.319-.354.647-.548m2.455-1.647q-.178.037-.356.078a21 21 0 0 0 .5-1.05 12 12 0 0 0 .51.858q-.326.048-.654.114m2.525.939a4 4 0 0 1-.435-.41q.344.007.612.054c.317.057.466.147.518.209a.1.1 0 0 1 .026.064.44.44 0 0 1-.06.2.3.3 0 0 1-.094.124.1.1 0 0 1-.069.015c-.09-.003-.258-.066-.498-.256M8.278 6.97c-.04.244-.108.524-.2.829a5 5 0 0 1-.089-.346c-.076-.353-.087-.63-.046-.822.038-.177.11-.248.196-.283a.5.5 0 0 1 .145-.04c.013.03.028.092.032.198q.008.183-.038.465z" />
                                <path
                                  fillRule="evenodd"
                                  d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2m5.5 1.5v2a1 1 0 0 0 1 1h2zM4.165 13.668c.09.18.23.343.438.419.207.075.412.04.58-.03.318-.13.635-.436.926-.786.333-.401.683-.927 1.021-1.51a11.7 11.7 0 0 1 1.997-.406c.3.383.61.713.91.95.28.22.603.403.934.417a.86.86 0 0 0 .51-.138c.155-.101.27-.247.354-.416.09-.181.145-.37.138-.563a.84.84 0 0 0-.2-.518c-.226-.27-.596-.4-.96-.465a5.8 5.8 0 0 0-1.335-.05 11 11 0 0 1-.98-1.686c.25-.66.437-1.284.52-1.794.036-.218.055-.426.048-.614a1.24 1.24 0 0 0-.127-.538.7.7 0 0 0-.477-.365c-.202-.043-.41 0-.601.077-.377.15-.576.47-.651.823-.073.34-.04.736.046 1.136.088.406.238.848.43 1.295a20 20 0 0 1-1.062 2.227 7.7 7.7 0 0 0-1.482.645c-.37.22-.699.48-.897.787-.21.326-.275.714-.08 1.103"
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
              count={dataOrdenTransformacion.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </div>
      </div>
    </>
  )
}
