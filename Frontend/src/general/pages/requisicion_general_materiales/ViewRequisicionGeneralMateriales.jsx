import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getRequisicionGeneralMaterialById } from '../../helpers/requisicion-materiales/getRequisicionGeneralMaterialById'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'

export const ViewRequisicionGeneralMateriales = () => {
  const { idReqMat } = useParams()
  const [requisicionMaterial, setRequisicionMaterial] = useState({
    idReqEst: 0,
    desReqEst: '',
    desMotReqMat: '',
    idAre: '',
    desAre: '',
    codReqMat: '',
    notReqMat: '',
    fecCreReqMat: '',
    detReq: []
  })

  const {
    desReqEst,
    desMotReqMat,
    desAre,
    codReqMat,
    notReqMat,
    fecCreReqMat,
    detReq
  } = requisicionMaterial

  // ESTADOS PARA LA NAVEGACION
  const navigate = useNavigate()
  const onNavigateBack = () => {
    navigate(-1)
  }

  const traerInformacionRequisicionMaterial = async () => {
    const resultPeticion = await getRequisicionGeneralMaterialById(idReqMat)
    console.log(resultPeticion)
    const { message_error, description_error, result } = resultPeticion
    if (message_error.length === 0) {
      setRequisicionMaterial(result)
    } else {
      alert(description_error)
    }
  }

  useEffect(() => {
    traerInformacionRequisicionMaterial()
  }, [])

  return (
    <>
      <div className="container-fluid mx-3">
        <h1 className="mt-4 text-center">Detalle requisicion materiales</h1>
        {/* DATOS DE LA REQUISICION */}
        <div className="row mt-4 mx-4">
          <div className="card d-flex">
            <h6 className="card-header">Datos de requisicion: <strong>{codReqMat}</strong></h6>
            <div className="card-body">
              <div className="mb-3 row">
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Área</b>
                  </label>
                  <input
                    type="text"
                    name="desAre"
                    value={desAre}
                    className="form-control"
                    readOnly
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Estado requisición</b>
                  </label>
                  <input
                    type="text"
                    name="desReqEst"
                    value={desReqEst}
                    className="form-control"
                    readOnly
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Motivo Requisición</b>
                  </label>
                  <input
                    type="text"
                    name="desMotReqMat"
                    value={desMotReqMat}
                    className="form-control"
                    readOnly
                  />
                </div>
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Fecha requisición</b>
                  </label>
                  <input
                    type="text"
                    name="fecCreReqMat"
                    value={fecCreReqMat}
                    className="form-control"
                    readOnly
                  />
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="nombre" className="form-label">
                  <b>Nota requisición</b>
                </label>
                <textarea className="form-control" name="notReqMat" rows="2" disabled readOnly>{notReqMat}</textarea>
              </div>
            </div>
          </div>
        </div>
        {/* DETALLE DE REQUISICION */}
        <div className="row mt-4 mx-4">
          <div className="card d-flex">
            <h6 className="card-header">
            Detalle de la requisicion
            </h6>
            <div className="card-body">
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
                        <TableCell align="left" width={70}>
                          <b>Codigo</b>
                        </TableCell>
                        <TableCell align="left" width={120}>
                          <b>Clase</b>
                        </TableCell>
                        <TableCell align="left" width={120}>
                          <b>Sub clase</b>
                        </TableCell>
                        <TableCell align="left" width={200}>
                          <b>Nombre</b>
                        </TableCell>
                        <TableCell align="center" width={100}>
                          <b>Cantidad</b>
                        </TableCell>
                        <TableCell align="left" width={50}>
                          <b>Medida</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detReq.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.codProd2}</TableCell>
                          <TableCell>{row.desCla}</TableCell>
                          <TableCell>{row.desSubCla}</TableCell>
                          <TableCell>{row.nomProd}</TableCell>
                          <TableCell align='center'>{row.canReqMatDet}</TableCell>
                          <TableCell>{row.simMed}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </div>
          </div>
        </div>
        <div className="btn-toolbar ms-4 mt-2">
          <button
            type="button"
            onClick={onNavigateBack}
            className="btn btn-secondary"
          >
            Volver
          </button>
        </div>
      </div>
    </>
  )
}
