import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { getRetornoLoteStock } from '../../helpers/retorno-venta/getRetornoLoteStock'
import { BootstrapDialog } from '../../../components/BootstrapDialog'

function parseFecha (fecha) {
  const splitFecha = fecha.split(' ')
  return splitFecha[0]
}

export const RowDetalleRetornosVentaDetalle = ({
  detalle,
  onDeleteSalidaStock,
  onUpdateSalidaStock,
  onAddSalidaStock,
  setfeedbackMessages,
  handleClickFeeback
}) => {
  const [disabledInput, setdisabledInput] = useState(true)
  const { detSal } = detalle

  return (
    <div className="mt-2">
      <p>
        <b>Detalle</b>
      </p>
      <TableContainer key={detalle.refProdc} component={Paper}>
        <Table>
          <TableHead style={{ backgroundColor: '#FEE7BC' }}>
            <TableRow>
              <TableCell>
                <b>Lote</b>
              </TableCell>
              <TableCell>
                <b>Cantidad</b>
              </TableCell>
              <TableCell>
                <b>Cantidad salida</b>
              </TableCell>
              <TableCell>
                <b>Fecha inicio</b>
              </TableCell>
              <TableCell>
                <b>Fecha vencimiento</b>
              </TableCell>
              <TableCell>
                <b>Acciones</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {detSal.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.codLotProd}</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    onChange={(e) => {
                      onUpdateSalidaStock(detalle.idProdt, item.refProdc, e)
                    }}
                    type="number"
                    name="canSalLotProd"
                    inputProps={{
                      style: {
                        color:
                          item.canSalLotProd > item.canSalLotProdSal
                            ? 'red'
                            : 'green'
                      }
                    }}
                    onWheel={(e) => e.target.blur()}
                    value={item.canSalLotProd}
                    disabled={disabledInput}
                  />
                </TableCell>
                <TableCell>{item.canSalLotProdSal}</TableCell>
                <TableCell>{parseFecha(item.fecProdIni)}</TableCell>
                <TableCell>{parseFecha(item.fecVenLotProd)}</TableCell>
                <TableCell>
                  {detalle.fueComDet === 0
                    ? (
                      <div className="btn-toolbar">
                        <IconButton
                          aria-label="edit"
                          size="large"
                          color="warning"
                          onClick={(e) => {
                            setdisabledInput(!disabledInput)
                          }}
                        >
                          <EditIcon fontSize="inherit" />
                        </IconButton>
                        <IconButton
                          aria-label="delete"
                          size="large"
                          color="error"
                          onClick={() => {
                            onDeleteSalidaStock(detalle.idProdt, item.refProdc)
                          }}
                        >
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>
                      </div>
                    )
                    : (
                      <p>Sin acciones</p>
                    )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* AÑADIMOS BOTON DE AÑADIR LOTE COMO SALIDA */}
      {detalle.fueComDet === 0 && (
        <div className="d-flex justify-content-center mt-3">
          <DialogSelectLoteRetorno
            detalle={detalle}
            onAddSalidaStock={onAddSalidaStock}
            setfeedbackMessages={setfeedbackMessages}
            handleClickFeeback={handleClickFeeback}
          />
        </div>
      )}
    </div>
  )
}

// componente dialog
const DialogSelectLoteRetorno = ({
  detalle,
  onAddSalidaStock,
  setfeedbackMessages,
  handleClickFeeback
}) => {
  const { idProdt, detSal } = detalle
  const [cantidadTotal, setCantidadTotal] = useState(0)
  const [dataLoteRetorno, setdataLoteRetorno] = useState({
    codLotProd: '',
    yearlot: '',
    canRetLotProd: 0
  })
  const { codLotProd, yearlot, canRetLotProd } = dataLoteRetorno

  // manejadores de dialogo
  const [open, setOpen] = React.useState(false)
  const handleClickOpen = () => {
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false)
  }

  // guardamos los lotes de salida
  const guardarLotesSalida = async () => {
    // primero debemos verificar que se ingrese un numero de lote y un año, ademas de una cantidad mayor a 0
    let handledErrors = ''
    if (codLotProd.length === 0 || yearlot.length === 0 || canRetLotProd <= 0) {
      if (codLotProd.length === 0) {
        handledErrors += 'No se proporciono el codigo de lote.\n'
      }

      if (yearlot.length === 0) {
        handledErrors += 'No se proporciono el año de creacion del lote.\n'
      }

      if (canRetLotProd <= 0) {
        handledErrors += 'Debes proporcionar una cantidad mayor a 0.\n'
      }

      setfeedbackMessages({
        style_message: 'warning',
        feedback_description_error: handledErrors
      })
      handleClickFeeback()
    } else {
      const body = {
        codLot: codLotProd, // codigo de lote
        anioCreLote: yearlot, // año creacion de lote
        idProdt // producto detalle
      }
      // nos comunicamos con el backend para comprobar la existencia
      const resultPeticion = await getRetornoLoteStock(body)
      const { message_error, description_error, result } = resultPeticion
      if (message_error.length === 0) {
        // ahora debemos comprobar que el lote traido no se encuentre en el detalle
        const findElementLote = detSal.find(
          (element) =>
            element.codLotProd === result.codLotProd &&
            element.fecProdIni === result.fecProdIni
        )

        if (findElementLote) {
          setfeedbackMessages({
            style_message: 'warning',
            feedback_description_error:
              'Este lote ya se encuentra en el detalle'
          })
          handleClickFeeback()
        } else {
          // llamamos a la funcion para agregar al detalle
          const formatResult = {
            ...result,
            canSalLotProd: parseInt(canRetLotProd),
            canSalLotProdSal: 0
          }

          onAddSalidaStock(detalle.idProdt, formatResult)

          setfeedbackMessages({
            style_message: 'success',
            feedback_description_error: 'Se agrego exitosamente'
          })
          handleClickFeeback()
        }
      } else {
        setfeedbackMessages({
          style_message: 'error',
          feedback_description_error: description_error
        })
        handleClickFeeback()
      }
    }
  }

  // const change cantidad
  const onChangeCantidadRetorno = ({ target }) => {
    const { value } = target
    setdataLoteRetorno({
      ...dataLoteRetorno,
      canRetLotProd: value
    })
  }

  useEffect(() => {
    const parseCantidadRetorno = parseInt(canRetLotProd)
    const total = isNaN(parseCantidadRetorno) ? 0 : parseCantidadRetorno
    setCantidadTotal(total + parseInt(detalle.canOpeFacDetAct))
  }, [canRetLotProd])

  return (
    <div className="d-flex justify-content-center mt-3">
      <button className="btn btn-primary" onClick={handleClickOpen}>
        Añadir lote
      </button>

      <BootstrapDialog
        maxWidth={'lg'}
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Lotes disponibles
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <div className="border p-2">
              <p>
                <strong>Cantidad requerida: </strong>
                <span className="text-success">{detalle.canOpeFacDet}</span>
              </p>
            </div>
            <div className="border p-2">
              <p>
                <strong>Cantidad actual: </strong>
                <span
                  className={
                    detalle.canOpeFacDetAct === detalle.canOpeFacDet
                      ? 'text-success'
                      : 'text-danger'
                  }
                >
                  {detalle.canOpeFacDetAct}
                </span>
              </p>
            </div>
            <div className="border p-2">
              <p>
                <strong>Cantidad total: </strong>
                <span
                  className={
                    cantidadTotal === detalle.canOpeFacDet
                      ? 'text-success'
                      : 'text-danger'
                  }
                >
                  {cantidadTotal}
                </span>
              </p>
            </div>
          </Box>
          {/* inputs de entrada */}
          <div className="row mt-4">
            <div className="col-md-3">
              <div className="form-group">
                <label htmlFor="campo1">Número Lote</label>
                <input
                  value={codLotProd}
                  onChange={({ target }) => {
                    const { value } = target
                    setdataLoteRetorno({
                      ...dataLoteRetorno,
                      codLotProd: value
                    })
                  }}
                  type="text"
                  size="small"
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-md-2">
              <div className="form-group">
                <label htmlFor="campo2">Año lote</label>
                <input
                  value={yearlot}
                  onChange={({ target }) => {
                    const { value } = target
                    setdataLoteRetorno({
                      ...dataLoteRetorno,
                      yearlot: value
                    })
                  }}
                  type="text"
                  size="small"
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label htmlFor="cantidad">Cantidad</label>
                <input
                  value={canRetLotProd}
                  onChange={onChangeCantidadRetorno}
                  type="number"
                  size="small"
                  className="form-control"
                />
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            onClick={guardarLotesSalida}
            color="primary"
            variant="contained"
          >
            Guardar
          </Button>
          <Button
            autoFocus
            onClick={handleClose}
            color="inherit"
            variant="contained"
          >
            Cerrar
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </div>
  )
}
