import React, { useState } from 'react'
import { IconButton, TextField } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

export const SearchCompraContanet = ({ onSearchCompra }) => {
  const [datosCompra, setDatosCompra] = useState({
    serie: '',
    numero: ''
  })

  const onChangeValueSerie = (event) => {
    setDatosCompra({
      ...datosCompra,
      serie: event.target.value
    })
  }

  const onChangeValueNumero = (event) => {
    setDatosCompra({
      ...datosCompra,
      numero: event.target.value
    })
  }

  const handleSearchCompra = () => {
    onSearchCompra(datosCompra)
  }

  return (
    <div className='d-flex flex-row gap-2 justify-content-center'>
      <TextField
        type='text'
        label='Serie'
        size='small'
        onChange={onChangeValueSerie}
        inputProps={{ style: { textTransform: 'uppercase' } }}
      />
      <TextField
        type='number'
        onWheel={(e) => e.target.blur()}
        label='Número'
        size='small'
        onChange={onChangeValueNumero}
      />
      <IconButton color="primary" onClick={handleSearchCompra}>
        <SearchIcon fontSize="large" />
      </IconButton>
    </div>
  )
}
