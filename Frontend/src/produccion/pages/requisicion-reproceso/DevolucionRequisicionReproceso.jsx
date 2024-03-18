import React, { useEffect, useState } from "react";
import { getDevolucionOperacionDevolucionCalidadDetalleById } from "../../helpers/requisicion-reproceso/getDevolucionOperacionDevolucionCalidadDetalleById";
import { useParams } from "react-router-dom";

export const DevolucionRequisicionReproceso = () => {
  const { idOpeDevCalDet } = useParams();
  const [devolucionOperacionDevolucionCalidadDetalle, setDevolucionOperacionDevolucionDetalle] = useState(
    {
      nomProd: "",
      idProdc: 0,
      codLotProd: "",
      fecVenLotProd: "",
      fueComOpeRep: 0,
      fecCreOpeDevCalDet: "",
      reqDev: []
    }
  )

  const {
    nomProd,
    codLotProd,
    fecVenLotProd,
    fueComOpeRep,
    fecCreOpeDevCalDet,
    reqDev } = devolucionOperacionDevolucionCalidadDetalle;

  const traerDevolucionesOperacionDevolucionCalidadDetalle = async () => {
    console.log(idOpeDevCalDet)
    const resultPeticion = await getDevolucionOperacionDevolucionCalidadDetalleById(idOpeDevCalDet)
    console.log(resultPeticion)
    const { message_error, description_error, result } = resultPeticion

    if (message_error.length === 0) {
      console.log(result)
      setDevolucionOperacionDevolucionDetalle(result)
    } else {
      alert(description_error)
    }

  }

  useEffect(() => {
    traerDevolucionesOperacionDevolucionCalidadDetalle()
  }, [])

  return <div>ViewRequisicionReproceso</div>
}
