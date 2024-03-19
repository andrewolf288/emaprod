import React, { useState, useEffect } from 'react'

import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import { getEstadoRequisicion } from '../../../helpers/Referenciales/estado_requisicion/getEstadoRequisicion'

export const FilterEstadoRequisicion = ({ onNewInput }) => {
  const [result, setResult] = useState([])

  const obtenerDataEstadoRequisicion = async () => {
    const resultPeticion = await getEstadoRequisicion()
    const formatSelect = resultPeticion.map((element) => {
      return {
        value: element.id,
        label: element.desReqEst,
        id: element.id
      }
    })
    setResult(formatSelect)
  }

  useEffect(() => {
    obtenerDataEstadoRequisicion()
  }, [])

  const handledChange = (event, value) => {
    onNewInput(value)
  }

  return (
    <>
      <Autocomplete
        options={result}
        disableClearable
        getOptionLabel={(option) => option.label}
        onChange={handledChange}
        renderInput={(params) => <TextField {...params} size="small" />}
      />
    </>
  )
}
