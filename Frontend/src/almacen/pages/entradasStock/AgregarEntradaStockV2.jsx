import React from 'react'
// IMPORT DE EFECHA PICKER
import FechaPicker from './../../../components/Fechas/FechaPicker'
// FUNCIONES UTILES
import { FilterAlmacenDynamic } from '../../../components/ReferencialesFilters/Almacen/FilterAlmacenDynamic'
import { FilterProveedorDynamic } from '../../../components/ReferencialesFilters/Proveedor/FilterProveedorDynamic'
import { FilterAllProductosDynamic } from '../../../components/ReferencialesFilters/Producto/FilterAllProductosDynamic'
import { useCreateEntradaStock } from '../../hooks/entrada-stock/useCreateEntradaStock'
import { SearchCompraContanet } from '../../components/componentes-entradasStock/SearchCompraContanet'

export const AgregarEntradaStockV2 = () => {
  const {
    entrada,
    onInputChange,
    disableButton,
    onAddCodAlm,
    onAddCodProd,
    onAddCodProv,
    onAddFecEntSto,
    onNavigateBack,
    onSubmitEntradaStock,
    onSearchRegistroCompraContanet
  } = useCreateEntradaStock()
  return (
    <>
      <div
        className="w"
        style={{
          // border: "1px solid black",
          paddingLeft: '70px',
          paddingRight: '100px'
        }}
      >
        <h1 className="mt-4 text-center">Registrar Entrada de stock</h1>

        <div
          className="row mt-4"
          // style={{ border: "1px solid black" }}
        >
          <div className="card d-flex">
            <h6 className="card-header">Sección de Almacén</h6>
            <div className="card-body">
              {/* CODIGO MATERIA PRIMA */}
              <div className="mb-3 row">
                <label className="col-md-2 col-form-label">Producto</label>
                <div className="col-md-2">
                  <input
                    value={entrada.codProd}
                    readOnly
                    type="text"
                    className="form-control"
                  />
                </div>
                {/* SEARCH NAME PRODUCTO */}
                <div className="col-md-8">
                  <FilterAllProductosDynamic
                    onNewInput={onAddCodProd}
                    defaultValue={entrada.idProd}
                  />
                </div>
              </div>

              {/* CODIGO ALMACEN */}
              <div className="mb-3 row">
                <label className="col-md-2 col-form-label">Almacén</label>
                <div className="col-md-2">
                  <input
                    value={entrada.codAlm}
                    readOnly
                    type="text"
                    className="form-control"
                  />
                </div>
                {/* SEARCH NAME PROVEEDOR */}
                <div className="col-md-6">
                  <FilterAlmacenDynamic
                    onNewInput={onAddCodAlm}
                    defaultValue={entrada.idAlm}
                  />
                </div>
              </div>

              {/* CODIGO PROVEEDOR */}
              <div className="mb-3 row">
                <label className="col-md-2 col-form-label">Proveedor</label>
                <div className="col-md-2">
                  <input
                    value={entrada.codProv}
                    readOnly
                    type="text"
                    className="form-control"
                  />
                </div>
                {/* SEARCH NAME PROVEEDOR */}
                <div className="col-md-8">
                  <FilterProveedorDynamic
                    onNewInput={onAddCodProv}
                    defaultValue={entrada.idProv}
                  />
                </div>
              </div>

              {/* COMPRA */}
              {entrada.idAlm === 1 && (<div className="mb-3 row">
                <label className="col-sm-2 col-form-label">
                  Compra
                </label>
                <div className="col-md-3">
                  <input
                    value={entrada.Cd_Com.length !== 0 ? `${entrada.Cd_Com} - ${entrada.FecED}` : ''}
                    readOnly
                    type="text"
                    className="form-control"
                  />
                </div>
                <div className="col-md-5">
                  <SearchCompraContanet
                    onSearchCompra={onSearchRegistroCompraContanet}
                  />
                </div>
              </div>)}

              {/* FECHA DE LA formState */}
              <div className="mb-3 row">
                <label className="col-sm-2 col-form-label">
                  Fecha de Entrada
                </label>
                <div className="col-md-4">
                  <FechaPicker onNewfecEntSto={onAddFecEntSto} />
                </div>
              </div>

              {/* INPUT DOCUMENTO formState */}
              <div className="mb-3 row">
                <label
                  htmlFor={'documento-formState'}
                  className="col-sm-2 col-form-label"
                >
                  Documento
                </label>
                <div className="col-md-3">
                  <input
                    onChange={onInputChange}
                    value={entrada.docEntSto}
                    type="text"
                    name="docEntSto"
                    className="form-control"
                  />
                </div>
              </div>

              {/* GUIA DE REMISION */}
              <div className="mb-3 row">
                <label
                  htmlFor={'documento-formState'}
                  className="col-sm-2 col-form-label"
                >
                  Guia de remisión
                </label>
                <div className="col-md-3">
                  <input
                    onChange={onInputChange}
                    value={entrada.guiRem}
                    type="text"
                    name="guiRem"
                    className="form-control"
                  />
                </div>
              </div>

              {/* INPUT CANTIDAD COMPRA */}
              <div className="mb-3 row">
                <label
                  htmlFor={'cantidad-ingresada'}
                  className="col-sm-2 col-form-label"
                >
                  Cantidad total compra
                </label>
                <div className="col-md-2">
                  <input
                    onChange={onInputChange}
                    value={entrada.canTotCom}
                    type="number"
                    name="canTotCom"
                    className="form-control"
                    onWheel={(e) => e.target.blur()}
                  />
                </div>
              </div>

              {/* INPUT CANTIDAD formState */}
              <div className="mb-3 row">
                <label
                  htmlFor={'cantidad-ingresada'}
                  className="col-sm-2 col-form-label"
                >
                  Cantidad ingresada
                </label>
                <div className="col-md-2">
                  <input
                    onChange={onInputChange}
                    value={entrada.canTotEnt}
                    type="number"
                    name="canTotEnt"
                    className="form-control"
                    onWheel={(e) => e.target.blur()}
                  />
                </div>
              </div>

              {/* INPUT CANTIDAD EXEDIDA */}
              <div className="mb-3 row">
                <label
                  htmlFor={'cantidad-ingresada'}
                  className="col-sm-2 col-form-label"
                >
                  Cantidad variación
                </label>
                <div className="col-md-2">
                  <input
                    disabled={true}
                    onChange={onInputChange}
                    value={entrada.canVar}
                    type="number"
                    name="canVar"
                    className={`form-control ${
                      parseFloat(entrada.canVar) < 0 ? 'text-danger' : 'text-success'
                    }`}
                  />
                </div>
              </div>
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
            disabled={disableButton}
            onClick={onSubmitEntradaStock}
            className="btn btn-primary"
          >
            Guardar
          </button>
        </div>
      </div>
    </>
  )
}
