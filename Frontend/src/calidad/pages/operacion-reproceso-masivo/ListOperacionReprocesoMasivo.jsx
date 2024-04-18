import React from 'react'
import { useListOperacionReprocesoMasivo } from '../../hooks/operacion-reproceso-masivo/useListOperacionReprocesoMasivo'

export const ListOperacionReprocesoMasivo = () => {
  const {
    operacionReprocesoMasivo,
    traerInformacionOperacionReprocesoMasivo
  } = useListOperacionReprocesoMasivo()
  return (
    <div>ListOperacionReprocesoMasivo</div>
  )
}
