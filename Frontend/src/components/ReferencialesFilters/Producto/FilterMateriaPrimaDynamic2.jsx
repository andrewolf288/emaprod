import { Autocomplete, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { getMateriaPrima } from '../../../helpers/Referenciales/producto/getMateriasPrimas'

const defaultOption = {
  value: 0,
  label: 'Selecciona una materia prima',
  id: 0
}

export const FilterMateriaPrimaDynamic2 = ({
  defaultValue = null,
  onNewInput
}) => {
  const [options, setOptions] = useState([defaultOption])
  const [value, setValue] = useState(defaultOption)

  const obtenerDataMateriaPrima = async () => {
    let result = await getMateriaPrima()
    result = result.filter(
      (element) => element.idCla !== 2 && element.idCla !== 4
    )
    const formatSelect = [
      defaultOption,
      ...result.map((element) => {
        return {
          value: element.codProd2,
          label: element.nomProd,
          id: element.id
        }
      })
    ]
    setOptions(formatSelect)
    // verficar si defualtvalue coincide
    const defaultValueOption = formatSelect.find(
      (option) => option.id === defaultValue
    )
    if (defaultValueOption) {
      setValue(defaultValueOption)
    }
  }

  const handleChange = (event, value) => {
    onNewInput(value)
    setValue(value)
  }

  useEffect(() => {
    const controller = new AbortController()
    obtenerDataMateriaPrima()
    return () => controller.abort()
  }, [])

  return (
    <Autocomplete
      options={options}
      value={value}
      disableClearable
      getOptionLabel={(option) => option.label}
      onChange={handleChange}
      isOptionEqualToValue={(option, value) => option.id == value.id}
      renderInput={(params) => <TextField {...params} size="small" />}
    />
  )
}
