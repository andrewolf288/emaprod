import React, { useState, useEffect } from 'react'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import { getSubClases } from '../../../helpers/Referenciales/subclase/getSubClases'

export const FilterSubClase = ({ onNewInput }) => {
  const [result, setResult] = useState([])

  const obtenerDataClases = async () => {
    const resultPeticion = await getSubClases()
    let formatSelect = resultPeticion.filter(
      (item, index) =>
        resultPeticion.findIndex((obj) => obj.desSubCla === item.desSubCla) ===
        index
    )

    formatSelect = formatSelect.map((element) => {
      return {
        value: element.id,
        label: `${element.desSubCla}`
      }
    })
    setResult(formatSelect)
  }

  useEffect(() => {
    obtenerDataClases()
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
