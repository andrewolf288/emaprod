import React, { useEffect, useState } from "react";
import { getSalidaVentaDetalleById } from "../../helpers/salida-venta/getSalidaVentaDetalleById";
import { CardSalidaVentaDetalle } from "../../components/componentes-salida-venta/CardSalidaVentaDetalle";

export const ViewSalidaVenta = () => {
  const [dataSalidaVenta, setdataSalidaVenta] = useState({
    id: 0,
    invSerFac: "",
    invNumFac: "",
    idOpeFacMot: 0,
    desOpeFacMot: "",
    fueAfePorDev: 0,
    fecCreOpeFac: "",
    detOpeFac: []
  });

  const {
    invSerFac,
    invNumFac,
    desOpeFacMot,
    fueAfePorDev,
    fecCreOpeFac,
    detOpeFac
  } = dataSalidaVenta;
  // obtenemos la data de la venta con su detalle de salidas por item
  const obtenerDataDetalleVenta = async () => {
    const formatData = {
      idOpeFac: 14
    };
    const resultPeticion = await getSalidaVentaDetalleById(formatData);
    const { result } = resultPeticion;
    console.log(result);
    setdataSalidaVenta(result[0]);
  };

  useEffect(() => {
    obtenerDataDetalleVenta();
  }, []);
  return (
    <>
      <div className="container-fluid px-4">
        <h1 className="mt-4 text-center">Detalle de Salida Venta</h1>
        <div className="row mt-4 mx-4">
          {/* SALIDA DE VENTA */}
          <div className="card d-flex">
            <h6 className="card-header">Datos de la Salida Venta</h6>
            <div className="card-body">
              <div className="mb-3 row">
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Correlativo</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={`${invSerFac}-${invNumFac}`}
                    className="form-control"
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Motivo operación</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={desOpeFacMot}
                    className="form-control"
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Fecha creación</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={fecCreOpeFac}
                    className="form-control"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* DETALLE DE SALIDA DE VENTA */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">Detalle salida venta</h6>
            {detOpeFac.map((detalle, index) => (
              <CardSalidaVentaDetalle
                detalle={detalle}
                key={detalle.id}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
