import React, { useState } from "react";
import { getReporteEntradas } from "./../../../helpers/reportes/getReporteEntradas";
import { exportJSONtoExcel } from "../../../utils/exportJSONtoExcel";
import { FilterEstadoEntrada } from "./../../../../components/ReferencialesFilters/EstadoEntradaStock/FilterEstadoEntrada";
import { FilterProveedor } from "./../../../../components/ReferencialesFilters/Proveedor/FilterProveedor";
import { FilterMateriaPrima } from "./../../../../components/ReferencialesFilters/Producto/FilterMateriaPrima";
import FechaPicker2 from "./../../../../components/Fechas/FechaPicker2";

export const ReporteEntradas = () => {
  // ESTADO DE LOS FILTROS SUBMIT
  const [filterReporte, setfilterReporte] = useState({
    filterMateriaPrima: {},
    filterProveedor: [],
    filterFecha: {
      fechaInicio: "",
      fechaFin: "",
    },
    filterEntrada: {
      estado: 0,
    },
  });

  // DESESTRUCTURACION
  const { filterMateriaPrima, filterProveedor, filterFecha, filterEntrada } =
    filterReporte;
  const { fechaInicio, fechaFin } = filterFecha;
  const { estado } = filterEntrada;

  // ESTADOS DE LOS FILTROS MATERIA PRIMA
  const [materiaPrimaBadges, setmateriaPrimaBadges] = useState({
    materiaPrima: [],
    categoriaMateriaPrima: [],
  });

  const { materiaPrima, categoriaMateriaPrima } = materiaPrimaBadges;

  // <----------- PARA AÑADIR EL FILTRO ----------->

  // MANEJADOR DE ESTABLECER TIEMPO DESDE
  const handledTiempoDesde = (date) => {
    console.log("TIEMPO DESDE: ", date);
    let auxFecha = { ...filterFecha, fechaInicio: date };
    setfilterReporte({
      ...filterReporte,
      filterFecha: auxFecha,
    });
  };

  // MANEJADOR DE ESTABLECER TIEMPO HASTA
  const handledTiempoHasta = (date) => {
    console.log("TIEMPO HASTA: ", date);
    let auxFecha = { ...filterFecha, fechaFin: date };
    setfilterReporte({
      ...filterReporte,
      filterFecha: auxFecha,
    });
  };

  // MANEJADOR PARA OBTENER EL ESTADO
  const handledEstadoEntrada = (value) => {
    console.log(value);
    let auxEntrada = { ...filterEntrada, estado: value.id };
    setfilterReporte({
      ...filterReporte,
      filterEntrada: auxEntrada,
    });
  };

  // MANEJADOR DE AÑADIR FILTRO DE MATERIA PRIMA
  const handledMateriPrima = (value) => {
    // comprobamos que el item no exista
    let foundItem = materiaPrima.find((element) => element.id === value.id);

    let auxMateriaPrima = [...materiaPrima];
    if (!foundItem) {
      auxMateriaPrima.push(value);
      setmateriaPrimaBadges({
        ...materiaPrimaBadges,
        materiaPrima: auxMateriaPrima,
      });
    } else {
      console.log("Ya se agrego este filtro");
    }
  };

  // MANEJADOR DE AÑADIR CATEGORIA DE MATERIA PRIMA
  const handledCategoriaMateriaPrima = (value) => {
    let foundItem = categoriaMateriaPrima.find(
      (element) => element.id === value.id
    );
    let auxCategoriaMateriaPrima = [...categoriaMateriaPrima];
    if (!foundItem) {
      auxCategoriaMateriaPrima.push(value);
      setmateriaPrimaBadges({
        ...materiaPrimaBadges,
        categoriaMateriaPrima: auxCategoriaMateriaPrima,
      });
    } else {
      console.log("Ya se agrego este filtro");
    }
  };

  // MANEJADOR DE AÑADIR PROVEEDOR
  const handledProveedor = (value) => {
    let foundItem = filterProveedor.find((element) => element.id === value.id);
    let auxProveedores = [...filterProveedor];
    if (!foundItem) {
      auxProveedores.push(value);
      setfilterReporte({
        ...filterReporte,
        filterProveedor: auxProveedores,
      });
    } else {
      console.log("Ya se agrego este filtro");
    }
  };

  // <----------- PARA ELIMINAR EL FILTRO ----------->

  // MANEJADOR PARA ELIMINAR FILTRO DE MATERIA PRIMA
  const deleteFilterMateriaPrima = (value) => {
    let auxMateriaPrima = materiaPrima.filter((element) => {
      if (element.id === value.id) {
        return false;
      } else {
        return true;
      }
    });
    setmateriaPrimaBadges({
      ...materiaPrimaBadges,
      materiaPrima: auxMateriaPrima,
    });
  };

  // MANEJADOR PARA ELIMINAR FILTRO DE CATEGORIA DE MATERIA PRIMA
  const deleteFilterCategoriaMateriaPrima = (value) => {
    let auxCategoriaMateriaPrima = categoriaMateriaPrima.filter((element) => {
      if (element.id === value.id) {
        return false;
      } else {
        return true;
      }
    });
    setmateriaPrimaBadges({
      ...materiaPrimaBadges,
      categoriaMateriaPrima: auxCategoriaMateriaPrima,
    });
  };

  // MANEJADORES PARA ELIMINAR FILTRO DE PROVEEDOR
  const deleteFilterProveedorMateriaPrima = (value) => {
    let auxProveedor = filterProveedor.filter((element) => {
      if (element.id === value.id) {
        return false;
      } else {
        return true;
      }
    });
    setfilterReporte({
      ...filterReporte,
      filterProveedor: auxProveedor,
    });
  };

  //FUNCION PARA EXPORTAR EN EXCEL
  const exportExcel = (dataJSON, fileName) => {
    exportJSONtoExcel({ dataJSON, fileName });
  };

  // ENVIAMOS LA DATA DE LOS FILTERS PARA FILTRAR LA DATA
  const submitDataFilterToExcel = async () => {
    let dataFilter = {
      ...filterReporte,
      filterMateriaPrima: materiaPrimaBadges,
    };
    const { message_error, description_error, result } =
      await getReporteEntradas(dataFilter);
    if (message_error.length === 0) {
      exportExcel(result, "reporte-entrada");
    } else {
      console.log("No se pudo exportar");
    }
  };

  const submitDataFilterToPdf = () => {
    console.log("exportar data en pdf");
  };

  return (
    <>
      <div className="container-fluid mx-3">
        {/* filtro de entrada */}
        <div className="row mt-3">
          {/* filtro de fecha de la entrada */}
          <div className="col-8">
            <p className="text-bg-light p-1 fs-5 fw-semibold">
              Filtros de fecha
            </p>
            <div className="row">
              {/* fecha desde */}
              <div className="col-4 d-flex align-items-center">
                <label className="form-label me-2">Desde:</label>
                <FechaPicker2 onNewFechaEntrada={handledTiempoDesde} />
              </div>
              {/* fecha hasta */}
              <div className="col-4 d-flex align-items-center">
                <label className="form-label me-2">Hasta:</label>
                <FechaPicker2 onNewFechaEntrada={handledTiempoHasta} />
              </div>
            </div>
          </div>
          {/* filter por estado de la entrada */}
          <div className="col-4">
            <p className="text-bg-light p-1 fs-5 fw-semibold">
              Filtros de estado
            </p>
            {/* filter */}
            <label className="form-label">Estado</label>
            <FilterEstadoEntrada onNewInput={handledEstadoEntrada} />
          </div>
        </div>

        {/* filtro de claves foraneas */}
        <div className="row mt-3">
          {/* filtro de materia prima */}
          <div className="col-7">
            <p className="text-bg-light p-1 fs-5 fw-semibold">
              Filtros de materia prima
            </p>
            <div className="row">
              {/* materia prima */}
              <div className="col-6">
                {/* filter */}
                <label className="form-label">Materia prima</label>
                <FilterMateriaPrima onNewInput={handledMateriPrima} />
                {/* badges filters */}
                <div className="d-flex flex-wrap justify-content-start mt-3">
                  {materiaPrima.map((element) => (
                    <span
                      key={element.value}
                      className="badge text-bg-primary fs-5 me-2 mb-2 py-2 px-2"
                    >
                      {element.label}
                      <button
                        onClick={() => deleteFilterMateriaPrima(element)}
                        className="badge btn btn-primary ms-1 py-0"
                      >
                        X
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* filtro de proveedor */}
          <div className="col-5">
            {/* filtro por proveedor */}
            <p className="text-bg-light p-1 fs-5 fw-semibold">
              Filtros de proveedor
            </p>
            <div className="row">
              <div className="col">
                <label className="form-label">Proveedor</label>
                <FilterProveedor onNewInput={handledProveedor} />
                {/* badges filters */}
                <div className="d-flex flex-wrap justify-content-start mt-3">
                  {filterProveedor.map((element) => (
                    <span
                      key={element.id}
                      className="badge text-bg-primary fs-5 me-2 mb-2 py-2 px-2"
                    >
                      {element.label}
                      <button
                        onClick={() =>
                          deleteFilterProveedorMateriaPrima(element)
                        }
                        className="badge btn btn-primary ms-1 py-0"
                      >
                        X
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* filtro por caracteristicas de entrada
        <div className="row">
          <div className="col-5"></div>
          <div className="col-3"></div>
          <div className="col-4"></div>
        </div> */}

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
          <div className="col-1">
            <button onClick={submitDataFilterToPdf} className="btn btn-danger">
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
        </div>
      </div>
    </>
  );
};
