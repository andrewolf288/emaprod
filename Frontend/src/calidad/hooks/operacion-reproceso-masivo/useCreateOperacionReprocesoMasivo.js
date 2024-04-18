import { useState } from 'react'

export function useCreateOperacionReprocesoMasivo () {
  const [informacionLoteProduccion, setInformacionLoteProduccion] = useState(
    {
      idProdc: null,
      codLotProd: '',
      fecVenLotProd: '',
      fecProdIni: ''
    }
  )

  const [detalleReprocesoMasivo, setDetalleReprocesoMasivo] = useState([])

  const buscarLoteProduccion = async (result) => {
    console.log(result)
    setInformacionLoteProduccion(result)
  }

  const quitarLoteProduccion = () => {
    setInformacionLoteProduccion({
      idProdc: null,
      codLotProd: '',
      fecVenLotProd: '',
      fecProdIni: ''
    })
  }

  return {
    informacionLoteProduccion,
    detalleReprocesoMasivo,
    buscarLoteProduccion,
    quitarLoteProduccion
  }
}
