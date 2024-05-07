import React, { useState, useEffect } from 'react'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'

const defaultOption = {
  value: 0,
  label: 'Selecciona una categoria',
  id: 0
}

const result = [
  {
    id: 1,
    label: 'Bolsas PPP'
  },
  {
    id: 2,
    label: 'Cajas corrugadas'
  },
  {
    id: 3,
    label: 'Displays'
  },
  {
    id: 4,
    label: 'Envolturas códigos'
  },
  {
    id: 5,
    label: 'Etiquetas'
  },
  {
    id: 6,
    label: 'Frascos'
  },
  {
    id: 7,
    label: 'Tapas'
  }

]

export const FilterCategoriasReporteEmpaquesCalidad = ({ defaultValue = null, onNewInput }) => {
  const [options, setOptions] = useState([defaultOption])
  const [value, setValue] = useState(defaultOption)

  const obtenerDataProveedor = () => {
    const formatSelect = [
      defaultOption,
      ...result.map((element) => {
        return {
          value: element.id,
          label: element.label,
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
    obtenerDataProveedor()
    return () => controller.abort()
  }, [defaultValue])

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
