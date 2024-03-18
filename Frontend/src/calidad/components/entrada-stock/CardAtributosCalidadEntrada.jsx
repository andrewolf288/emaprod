import React from 'react'
import { InputTypeAtributoCalidad } from './InputTypeAtributoCalidad'

export const CardAtributosCalidadEntrada = ({
  dataEntradaStockCalidad,
  onChangeValoresAlfanumericos
}) => {
  const { etiquetasCards, dataAtributosEntradaCalidad } =
    dataEntradaStockCalidad

  return (
    <>
      {etiquetasCards.map((etiqueta, index) => {
        const dataEtiqueta = dataAtributosEntradaCalidad.filter(
          (element) => element.labGruAtr === etiqueta
        )
        return (
          <ComponentCard
            key={index}
            etiqueta={etiqueta}
            data={dataEtiqueta}
            onChangeValoresAlfanumericos={onChangeValoresAlfanumericos}
          />
        )
      })}
    </>
  )
}

const ComponentCard = ({ etiqueta, data, onChangeValoresAlfanumericos }) => {
  const chunkedData = []
  const chunkSize = 3

  if (data.length === 0) {
    return
  }

  // Dividir data en grupos de 3 elementos
  for (let i = 0; i < data.length; i += chunkSize) {
    chunkedData.push(data.slice(i, i + chunkSize))
  }

  return (
    <>
      <div className="card d-flex mt-3">
        <h6 className="card-header text-bg-success">{etiqueta}</h6>
        <div className="card-body">
          {chunkedData.map((chunk, index) => (
            <div className="row mb-4" key={index}>
              {chunk.map((atributo) => (
                <div className="col" key={atributo.id}>
                  <InputTypeAtributoCalidad
                    atributo={atributo}
                    onChangeValoresAlfanumericos={onChangeValoresAlfanumericos}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
