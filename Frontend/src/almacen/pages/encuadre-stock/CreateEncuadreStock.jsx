import React from 'react'
import { useCreateEncuadreStock } from '../../hooks/encuadre-stock/useCreateEncuadreStock'
import { CustomLoading } from '../../../components/CustomComponents/CustomLoading'
import { FilterAlmacenDynamic } from '../../../components/ReferencialesFilters/Almacen/FilterAlmacenDynamic'
import { CustomActionsView } from '../../../components/CustomComponents/CustomActionsView'
import example from '../../../assets/example.png'

export const CreateEncuadreStock = () => {
  const {
    loading,
    almacen,
    onChangeValueAlmacen,
    generateReporteStock,
    files,
    getInputProps,
    getRootProps,
    createEncuadreStock
  } = useCreateEncuadreStock()
  return (
    <>
      <div className='container'>
        {/* DESCARGAR PLANTILLA DE ENCUADRE */}
        <section className='card mt-4'>
          <p className='card-header'>
            <span className='fw-bold'>Primer paso: </span>
            Selecciona el almacén correspondiente y genera la plantilla de encuadre
          </p>
          <div className="card-body row justify-content-center align-items-end">
            <div className="col-3">
              {/* filter */}
              <label className="form-label fw-semibold">Almacen</label>
              <FilterAlmacenDynamic
                onNewInput={onChangeValueAlmacen}
                defaultValue={almacen}
              />
            </div>
            <div className='col-3'>
              <button
                className='btn btn-success'
                onClick={() => { generateReporteStock() }}
              >
              Generar plantilla
              </button>
            </div>
          </div>
        </section>
        {/* VISTA DE EJEMPLO */}
        <section className='card mt-4'>
          <p className='card-header'>
            <span className='fw-bold'>Segundo paso: </span>
            Modifica la columna H con el valor que deseas cuadrar. Si el valor es diferente a lo que se encuentra disponible, la celda se pintará de color rojo.
          </p>
          <div className='card-body text-center'>
            <img src={example}/>
          </div>
        </section>
        {/* SUBIDA DE ARCHIVO DE ENCUADRE */}
        <section className='card mt-4'>
          <p className='card-header'>
            <span className='fw-bold'>Tercer paso: </span>
            Una vez cuadrado el stock, sube el archivo en esta sección.
          </p>
          <div className="card-body">
            <div className="border border-2 border-dashed p-4 rounded" {...getRootProps()}>
              <input {...getInputProps()} />
              <p className='text-center'>Arrastra y suelta archivos aquí, o haz clic para seleccionar archivos</p>
            </div>
            <aside className="mt-3">
              <p className='fw-bold'>Archivo</p>
              <ul className="list-unstyled">{files}</ul>
            </aside>
          </div>
        </section>
        <CustomActionsView
          onSaveOperation={createEncuadreStock}
        />
      </div>
      <CustomLoading
        open={loading}
      />
    </>

  )
}
