import React, { useState } from 'react'
// IMPORTACIONES PARA TABLE MUI
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import TablePagination from '@mui/material/TablePagination'
// IMPORTACIONES PARA EL FEEDBACK
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import { useNavigate } from 'react-router-dom'
import { Typography } from '@mui/material'
import { getMateriaPrimaById } from '../../../helpers/Referenciales/producto/getMateriaPrimaById'
import { FilterEnvaseEmbalaje } from '../../../components/ReferencialesFilters/Producto/FilterEnvaseEmbalaje'
import { RowDetalleFormula } from '../../../molienda/components/RowDetalleFormula'
import { createRequisicionMateriales } from '../../helpers/requisicion-materiales/createRequisicionMateriales'

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert (props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

export const CreateRequisicionMateriales = () => {
  const [requisicionMateriales, setRequisicionMateriales] = useState({
    idAre: 4, // area de produccion
    idReqTip: 3, // tipo de requisicion
    detReqMat: []
  })
  const { detReqMat } = requisicionMateriales

  // ESTADOS PARA DATOS DE DETALLE FORMULA (DETALLE)
  const [materiaPrimaDetalle, setmateriaPrimaDetalle] = useState({
    idMateriaPrima: 0,
    cantidadMateriaPrima: 0
  })

  const { idMateriaPrima, cantidadMateriaPrima } = materiaPrimaDetalle

  // ESTADO PARA CONTROLAR EL FEEDBACK
  const [feedbackCreate, setfeedbackCreate] = useState(false)
  const [feedbackMessages, setfeedbackMessages] = useState({
    style_message: '',
    feedback_description_error: ''
  })
  const { style_message, feedback_description_error } = feedbackMessages

  // MANEJADORES DE FEEDBACK
  const handleClickFeeback = () => {
    setfeedbackCreate(true)
  }

  const handleCloseFeedback = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setfeedbackCreate(false)
  }

  // ESTADOS PARA LA NAVEGACION
  const navigate = useNavigate()
  const onNavigateBack = () => {
    navigate(-1)
  }

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

  /* Manejadores de detalles de requisicion y agregado de materia prima */

  // Añadir una materia prima
  const onMateriaPrimaId = ({ id }) => {
    setmateriaPrimaDetalle({
      ...materiaPrimaDetalle,
      idMateriaPrima: id
    })
  }

  // Añadir cantidad de la materia prima
  const handleCantidadMateriaPrima = ({ target }) => {
    const { name, value } = target
    setmateriaPrimaDetalle({
      ...materiaPrimaDetalle,
      [name]: value
    })
  }

  // Eliminar detalle de requisicion
  const deleteDetalleRequisicion = (idItem) => {
    // FILTRAMOS EL ELEMENTO ELIMINADO
    const nuevaDataDetalleRequisicion = detReqMat.filter((element) => {
      if (element.idMatPri !== idItem) {
        return element
      } else {
        return false
      }
    })

    // VOLVEMOS A SETEAR LA DATA
    setRequisicionMateriales({
      ...requisicionMateriales,
      detReqMat: nuevaDataDetalleRequisicion
    })
  }

  // Actualizacion el detalle de la requisicion
  const handleRequisicionDetalle = ({ target }, idItem) => {
    const { value } = target
    const editFormDetalle = detReqMat.map((element) => {
      if (element.idMatPri === idItem) {
        return {
          ...element,
          canMatPriFor: value
        }
      } else {
        return element
      }
    })

    setRequisicionMateriales({
      ...requisicionMateriales,
      detReqMat: editFormDetalle
    })
  }

  // Agregamos nueva materia prima al detalle
  const handleAddNewMateriPrimaDetalle = async (e) => {
    e.preventDefault()
    // PRIMERO VERIFICAMOS QUE LOS INPUTS TENGAN DATOS
    if (idMateriaPrima !== 0 && cantidadMateriaPrima > 0) {
      // PRIMERO VERIFICAMOS SI EXISTE ALGUNA COINCIDENCIA DE LO INGRESADO
      const itemFound = detReqMat.find(
        (elemento) => elemento.idMatPri === idMateriaPrima
      )
      if (itemFound) {
        setfeedbackMessages({
          style_message: 'warning',
          feedback_description_error: 'Ya se agrego esta materia prima'
        })
        handleClickFeeback()
      } else {
        // HACEMOS UNA CONSULTA A LA MATERIA PRIMA Y DESESTRUCTURAMOS
        const resultPeticion = await getMateriaPrimaById(idMateriaPrima)
        const { message_error, description_error, result } = resultPeticion

        if (message_error.length === 0) {
          const { id, codProd, codProd2, desCla, desSubCla, nomProd, simMed } =
            result[0]
          // GENERAMOS NUESTRO DETALLE DE FORMULA DE MATERIA PRIMA
          const detalleFormulaMateriaPrima = {
            idMatPri: id,
            codProd,
            codProd2,
            desCla,
            desSubCla,
            nomProd,
            simMed,
            canMatPriFor: cantidadMateriaPrima,
            canMatPriForCopy: cantidadMateriaPrima
          }
          console.log(detalleFormulaMateriaPrima)

          // SETEAMOS SU ESTADO PARA QUE PUEDA SER MOSTRADO EN LA TABLA DE DETALLE
          const dataMateriaPrimaDetalle = [
            ...detReqMat,
            detalleFormulaMateriaPrima
          ]
          setRequisicionMateriales({
            ...requisicionMateriales,
            detReqMat: dataMateriaPrimaDetalle
          })
        } else {
          setfeedbackMessages({
            style_message: 'error',
            feedback_description_error: description_error
          })
          handleClickFeeback()
        }
      }
    } else {
      setfeedbackMessages({
        style_message: 'warning',
        feedback_description_error: 'Asegurese de llenar los datos requeridos'
      })
      handleClickFeeback()
    }

    setmateriaPrimaDetalle({
      idMateriaPrima: 0,
      cantidadMateriaPrima: 0
    })
  }

  const handleSubmitRequisicion = (e) => {
    e.preventDefault()

    let handleErrors = []
    if (detReqMat.length === 0) {
      if (detReqMat.length === 0) {
        handleErrors += 'No has agregado ningun elemento al detalle\n'
      }
      setfeedbackMessages({
        style_message: 'warning',
        feedback_description_error: handleErrors
      })
      handleClickFeeback()
    } else {
      // crear requisicion
      crearRequisicion()
    }
  }

  // Funcion asyncrona para crear requisicion de molienda con su detalle
  const crearRequisicion = async () => {
    console.log(requisicionMateriales)
    const response = await createRequisicionMateriales(requisicionMateriales)

    const { message_error, description_error } = response

    if (message_error.length === 0) {
      onNavigateBack()
      setfeedbackMessages({
        style_message: 'success',
        feedback_description_error: 'Se creó con éxito'
      })
      handleClickFeeback()

      setTimeout(() => {
        window.close()
      }, '1000')
    } else {
      setfeedbackMessages({
        style_message: 'error',
        feedback_description_error: description_error
      })
      handleClickFeeback()
    }
  }

  return (
    <>
      <div className="container-fluid mx-3">
        <h1 className="mt-4 text-center">Agregar Requisicion Materiales</h1>

        {/* DATOS DE LA REQUISICION */}
        <div className="row mt-4 mx-4">
          <div className="card d-flex">
            <h6 className="card-header">Datos de requisicion</h6>
            <div className="card-body">
              <div className="mb-3 row">
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Área</b>
                  </label>
                  <input
                    type="text"
                    name="codLotProd"
                    value={'Producción'}
                    className="form-control"
                    readOnly
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Tipo de requisición</b>
                  </label>
                  <input
                    type="text"
                    name="codLotProd"
                    value={'Materiales de producción'}
                    className="form-control"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-4 mx-4">
          <div className="card d-flex">
            <h6 className="card-header">
              <b>Detalle de la requisicion</b>
            </h6>
            <div className="card-body">
              <form className="row mb-4 mt-4 d-flex flex-row justify-content-start align-items-end">
                {/* AGREGAR MATERIA PRIMA */}
                <div className="col-md-3">
                  <label htmlFor="inputPassword4" className="form-label">
                    Material
                  </label>
                  <FilterEnvaseEmbalaje
                    onNewInput={onMateriaPrimaId}
                    defaultValue={idMateriaPrima}
                  />
                </div>

                {/* AGREGAR CANTIDAD */}
                <div className="col-md-4">
                  <label htmlFor="inputPassword4" className="form-label">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    onChange={handleCantidadMateriaPrima}
                    value={cantidadMateriaPrima}
                    name="cantidadMateriaPrima"
                    className="form-control"
                  />
                </div>
                {/* BOTON AGREGAR MATERIA PRIMA */}
                <div className="col-md-3 d-flex justify-content-end ms-auto">
                  <button
                    onClick={handleAddNewMateriPrimaDetalle}
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
              {/* TABLA DE RESULTADOS */}
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
                        <TableCell align="left" width={100}>
                          <b>Codigo</b>
                        </TableCell>
                        <TableCell align="left" width={120}>
                          <b>Clase</b>
                        </TableCell>
                        <TableCell align="left" width={140}>
                          <b>Sub clase</b>
                        </TableCell>
                        <TableCell align="left" width={200}>
                          <b>Nombre</b>
                        </TableCell>
                        <TableCell align="left" width={150}>
                          <b>Cantidad</b>
                        </TableCell>
                        <TableCell align="left" width={150}>
                          <b>Acciones</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detReqMat
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((row, i) => (
                          <RowDetalleFormula
                            key={row.idMatPri}
                            detalle={row}
                            onDeleteDetalleFormula={deleteDetalleRequisicion}
                            onChangeFormulaDetalle={handleRequisicionDetalle}
                          />
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {/* PAGINACION DE LA TABLA */}
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={detReqMat.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Paper>
            </div>
          </div>
        </div>

        {/* BOTONES DE CANCELAR Y GUARDAR */}
        <div className="btn-toolbar mt-4">
          <button
            type="button"
            onClick={onNavigateBack}
            className="btn btn-secondary me-2"
          >
            Volver
          </button>
          <button
            type="submit"
            // disabled={disableButton}
            onClick={handleSubmitRequisicion}
            className="btn btn-primary"
          >
            Guardar
          </button>
        </div>
      </div>

      {/* FEEDBACK AGREGAR MATERIA PRIMA */}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={feedbackCreate}
        autoHideDuration={6000}
        onClose={handleCloseFeedback}
      >
        <Alert
          onClose={handleCloseFeedback}
          severity={style_message}
          sx={{ width: '100%' }}
        >
          <Typography whiteSpace={'pre-line'}>
            {feedback_description_error}
          </Typography>
        </Alert>
      </Snackbar>
    </>
  )
}
