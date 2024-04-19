import { useState } from 'react'

export function useCreateTransferenciaAlmacenes () {
  const [transferenciaAlmacen, setTransferenciaAlmacen] = useState(
    {
      idAlmOri: 0,
      idAlmDes: 0,
      idMotTranAlm: 0,
      obsTranAlm: '',
      detTranAlm: []
    }
  )

  return {
    transferenciaAlmacen
  }
}
