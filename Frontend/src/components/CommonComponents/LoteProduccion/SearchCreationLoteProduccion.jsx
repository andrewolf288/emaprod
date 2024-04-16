import AddCircle from '@mui/icons-material/AddCircle'
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, Typography } from '@mui/material'
import { useState } from 'react'
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle'
import { searchLoteProduccion } from './searchLoteProduccion'
import FechaPickerYearAndMonthDynamic from '../../Fechas/FechaPickerYearAndMonthDynamic'
import { alertWarning } from '../../../utils/alerts/alertsCustoms'

// DIALOGO DE CREACION/BUSQUEDA DE LOTES DE PRODUCCION
export const SearchCreationLoteProduccion = ({ dataDetalle, handleConfirm }) => {
  // manejador de dialog
  const [open, setOpen] = useState(false)
  // manejador de datos
  const [dataProduccion, setDataProduccion] = useState({
    codLotProd: '',
    fecProdIni: '',
    fecVenLotProd: '',
    creacionAutomatica: false,
    sensibleMes: false
  })

  const {
    codLotProd,
    fecProdIni,
    fecVenLotProd,
    creacionAutomatica,
    sensibleMes
  } = dataProduccion

  const [flagDateChange, setFlagDateChange] = useState(true)

  const handleFlagDateChange = () => {
    console.log(dataProduccion)
    // hablamos de fecha de inicio
    setDataProduccion((prevData) => {
      if (flagDateChange) {
        return {
          ...prevData,
          fecProdIni: ''
        }
      } else {
        return {
          ...prevData,
          fecVenLotProd: ''
        }
      }
    })
    setFlagDateChange((prevFlag) => !prevFlag)
  }

  const handleClickOpen = () => {
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false)
  }

  // handle text lote
  const handleChangeLote = ({ target }) => {
    const { name, value } = target
    setDataProduccion({
      ...dataProduccion,
      [name]: value
    })
  }

  // handle fecha inicio produccion
  const handleChangeDateInicioProduccion = (newfec) => {
    setDataProduccion({
      ...dataProduccion,
      fecProdIni: newfec
    })
  }

  // handle fecha vencimiento produccion
  const handleChangeDateVencimientoProduccion = (newfec) => {
    setDataProduccion({
      ...dataProduccion,
      fecVenLotProd: newfec
    })
  }

  // handle check creacion automatica
  const handleChangeCheckCreacionAutomatica = ({ target }) => {
    const { name, checked } = target
    setDataProduccion({
      ...dataProduccion,
      [name]: checked
    })
  }

  // handle check sensible mes
  const handleChangeCheckSensibleMes = ({ target }) => {
    const { name, checked } = target
    setDataProduccion({
      ...dataProduccion,
      [name]: checked
    })
  }

  const handleFormSubmit = async () => {
    let handleErrors = ''
    if (
      codLotProd.length === 0 ||
        (fecProdIni.length === 0 && fecVenLotProd.length === 0) ||
        codLotProd.length > 3
    ) {
      if (codLotProd.length === 0) {
        handleErrors += 'No proporcionaste un lote\n'
      }

      if (codLotProd.length > 3) {
        handleErrors += 'El lote tiene más de 3 dígitos\n'
      }

      if (fecProdIni.length === 0 && fecVenLotProd.length === 0) {
        handleErrors +=
            'Debes proporcionar al menos una fecha (inicio o vencimiento)\n'
      }
      alertWarning(handleErrors)
    } else {
      const formatData = {
        idProdt: dataDetalle.idProdt,
        ...dataProduccion
      }
      const resultPeticion = await searchLoteProduccion(formatData)
      const { message_error, description_error, result } = resultPeticion
      if (message_error.length === 0) {
        console.log(result)
        // llamamos al handleConfirm
        handleConfirm(dataDetalle.index, result)
        // cerramos el dialogo
        handleClose()
      } else {
        alertWarning(description_error)
      }
    }
  }

  return (
    <>
      <IconButton color="primary" onClick={handleClickOpen}>
        <AddCircle fontSize="large" />
      </IconButton>
      <Dialog open={open} onClose={handleClose} maxWidth="xs">
        <DialogTitle>
          <Typography>Creación o busqueda de lotes</Typography>
        </DialogTitle>
        <DialogContent>
          <div className="row">
            <div className="d-flex">
              <label htmlFor="lote" className="col-form-label col-2">
                  Lote:
              </label>
              <div className="col-3">
                <input
                  type="number"
                  name="codLotProd"
                  className="form-control"
                  value={codLotProd}
                  onChange={handleChangeLote}
                  onWheel={(e) => e.target.blur()}
                />
              </div>
            </div>
            <div className="col mt-3">
              <div className="row d-flex align-items-center">
                <div className="col-md-4">
                  <label className="col-form-label">
                    {flagDateChange
                      ? 'Fecha de inicio producción'
                      : 'Fecha de vencimiento producción'}
                  </label>
                </div>
                {flagDateChange
                  ? (
                    <div className="col-md-6">
                      <FechaPickerYearAndMonthDynamic
                        dateValue={fecProdIni}
                        onNewfecEntSto={handleChangeDateInicioProduccion}
                      />
                    </div>
                  )
                  : (
                    <div className="col-md-6">
                      <FechaPickerYearAndMonthDynamic
                        dateValue={fecVenLotProd}
                        onNewfecEntSto={handleChangeDateVencimientoProduccion}
                      />
                    </div>
                  )}
                <div className="col-md-2">
                  <IconButton onClick={handleFlagDateChange} color="primary">
                    <ChangeCircleIcon />
                  </IconButton>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-start pe-0 ps-0 mt-2">
              <FormControlLabel
                labelPlacement="start"
                control={
                  <Checkbox
                    name="creacionAutomatica"
                    checked={creacionAutomatica}
                    onChange={handleChangeCheckCreacionAutomatica}
                  />
                }
                label="Crear si no se encuentra"
              />
            </div>
            <div className="d-flex justify-content-start pe-0 ps-0 mt-2">
              <FormControlLabel
                labelPlacement="start"
                control={
                  <Checkbox
                    name="sensibleMes"
                    checked={sensibleMes}
                    onChange={handleChangeCheckSensibleMes}
                  />
                }
                label="Sensible al mes"
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleClose} color="error">
              Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleFormSubmit}
            color="primary"
          >
              Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
