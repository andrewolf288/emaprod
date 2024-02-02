import React, { useState } from "react";
import { FilterProductosDynamic } from "../../../components/ReferencialesFilters/Producto/FilterProductosDynamic";
import { FilterAlmacenDynamic } from "../../../components/ReferencialesFilters/Almacen/FilterAlmacenDynamic";
import config from "../../../config";
import axios from "axios";

export const ReporteProductoFinalLotes = () => {
  const [filterData, setFilterData] = useState({
    producto: 0,
    almacen: 0
  });

  const { producto, almacen } = filterData;

  // controlador de producto
  const handleProducto = ({ id }) => {
    setFilterData({
      ...filterData,
      producto: id
    });
  };

  // controlador de almacne
  const handleAlmacen = ({ id }) => {
    setFilterData({
      ...filterData,
      almacen: id
    });
  };

  // ENVIAMOS LA DATA DE LOS FILTERS PARA FILTRAR LA DATA
  const submitDataFilterToExcel = async () => {
    let errors = [];
    // seleccion de almacen
    if (almacen === 0) {
      errors.push("Debes seleccionar un almacen");
    }

    if (errors.length === 0) {
      // hacemos una peticion
      console.log(filterData);
      exportarReporte();
    } else {
      const handleErrors = errors.join("\n");
      alert(handleErrors);
    }
  };

  //FUNCION PARA EXPORTAR EN EXCEL
  const exportarReporte = () => {
    const domain = config.API_URL;
    const path = "/almacen/reportes/reporte-producto-final-lote.php";
    axios({
      url: domain + path,
      data: filterData,
      method: "POST",
      responseType: "blob" // Importante para recibir datos binarios (Blob)
    })
      .then((response) => {
        // Crear un enlace temporal para descargar el archivo
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const a = document.createElement("a");
        a.href = url;
        a.download = "reporte-stock-total.xlsx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => alert("Error al descargar el archivo", error));
  };

  return (
    <>
      <div className="container-fluid mx-3">
        <div className="row mt-3">
          <div className="col-6">
            {/* filter */}
            <label className="form-label">Producto</label>
            <FilterProductosDynamic
              onNewInput={handleProducto}
              defaultValue={producto}
            />
          </div>
          <div className="col-3">
            {/* filter */}
            <label className="form-label">Almacen</label>
            <FilterAlmacenDynamic
              onNewInput={handleAlmacen}
              defaultValue={almacen}
            />
          </div>
        </div>
        {/* opciones de formato de reporte */}
        <div className="row d-flex flex-row justify-content-center mt-4">
          <p className="text-bg-light p-3 fs-4 fw-bold">
            Formatos para exportar
          </p>
          <div className="col-1">
            <button
              onClick={submitDataFilterToExcel}
              className="btn btn-success"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-file-earmark-excel-fill"
                viewBox="0 0 16 16"
              >
                <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM5.884 6.68 8 9.219l2.116-2.54a.5.5 0 1 1 .768.641L8.651 10l2.233 2.68a.5.5 0 0 1-.768.64L8 10.781l-2.116 2.54a.5.5 0 0 1-.768-.641L7.349 10 5.116 7.32a.5.5 0 1 1 .768-.64z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
