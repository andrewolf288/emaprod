import React, { useState, useEffect } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { getProductosDisponiblesProduccion } from "./../helpers/producto-produccion/getProductosDisponiblesProduccion";
import { getClaseByProduccion } from "../helpers/producto-produccion/getClaseByProduccion";
import { getSubClaseByProduccion } from "./../helpers/producto-produccion/getSubClaseByProducción";
import { getSubClaseByClase } from "./../helpers/producto-produccion/getSubClaseByClase";
import { getProductoByClaseAndSubClase } from "./../helpers/producto-produccion/getProductoByClaseAndSubClase";
import { getProductoByClase } from "./../helpers/producto-produccion/getPorductoByClase";

export const PackAsyncFilterProductosProduccionLote = ({ onAddProducto }) => {
  const [clase, setclase] = useState([]);
  const [subclase, setsubclase] = useState([]);
  const [producto, setproducto] = useState([]);

  const [productoSelected, setproductoSelected] = useState(null);

  // FUNCIONES PARA TRAER LA DATA
  // clases
  const obtenerListClases = async () => {
    const resultPeticion = await getClaseByProduccion();
    const { message_error, result } = resultPeticion;
    if (message_error.length === 0) {
      const formatSelect = result.map((element) => {
        return {
          value: element.id,
          label: element.desCla,
          id: element.id,
        };
      });
      setclase(formatSelect);
    }
  };

  // subclases
  const obtenerListSubClases = async () => {
    const resultPeticion = await getSubClaseByProduccion();
    const { message_error, result } = resultPeticion;
    if (message_error.length === 0) {
      const formatSelect = result.map((element) => {
        return {
          value: element.id,
          label: element.desSubCla,
          idCla: element.idCla,
          id: element.id,
        };
      });
      setsubclase(formatSelect);
    }
  };

  const obtenerListSubClasesByClase = async (idCla) => {
    const resultPeticion = await getSubClaseByClase(idCla);
    const { message_error, result } = resultPeticion;
    if (message_error.length === 0) {
      const formatSelect = result.map((element) => {
        return {
          value: element.id,
          label: element.desSubCla,
          idCla: element.idCla,
          id: element.id,
        };
      });
      setsubclase(formatSelect);
    }
  };

  //productos
  const obtenerProductos = async () => {
    const resultPeticion = await getProductosDisponiblesProduccion();
    const { message_error, result } = resultPeticion;
    if (message_error.length === 0) {
      const formatSelect = result.map((element) => {
        return {
          ...element,
          value: element.id,
          label: element.nomProd,
        };
      });
      setproducto(formatSelect);
    }
  };

  const obtenerProductosByClase = async (idCla) => {
    const resultPeticion = await getProductoByClase(idCla);
    const { message_error, result } = resultPeticion;
    if (message_error.length === 0) {
      const formatSelect = result.map((element) => {
        return {
          ...element,
          value: element.id,
          label: element.nomProd,
        };
      });
      setproducto(formatSelect);
    }
  };

  const obtenerProductosByClaseAndSubClase = async (idCla, idSubCla) => {
    const resultPeticion = await getProductoByClaseAndSubClase(idCla, idSubCla);
    const { message_error, result } = resultPeticion;
    if (message_error.length === 0) {
      const formatSelect = result.map((element) => {
        return {
          ...element,
          value: element.id,
          label: element.nomProd,
        };
      });
      setproducto(formatSelect);
    }
  };

  // EVENTOS DE CAMBIO

  // cambio de clase
  const handleChangeClase = (event, value) => {
    // hacemos una nueva peticion
    obtenerListSubClasesByClase(value.id);
    // hacemos una nueva peticion
    obtenerProductosByClase(value.id);
  };

  // cambio de sub clase
  const handleChangeSubClase = (event, value) => {
    // hacemos una nueva peticion
    obtenerProductosByClaseAndSubClase(value.idCla, value.id);
  };

  // cambio de producto
  const handleChangeProducto = (event, value) => {
    // seteamos el producto
    setproductoSelected(value);
  };

  // boton de agregar
  const onAddProductoFinal = () => {
    // llamamos a la funcion dle padre
    if (productoSelected !== null) {
      onAddProducto(productoSelected);
    }
  };

  // DATOS QUE SE CARGAN
  useEffect(() => {
    obtenerListClases();
    obtenerListSubClases();
    obtenerProductos();
  }, []);

  return (
    <div className="mb-3 row">
      <div className="col-md-2">
        <label htmlFor="nombre" className="form-label">
          Clase
        </label>
        <Autocomplete
          options={clase}
          disableClearable
          getOptionLabel={(option) => option.label}
          onChange={handleChangeClase}
          renderInput={(params) => <TextField {...params} size="small" />}
        />
      </div>
      <div className="col-md-2">
        <label htmlFor="nombre" className="form-label">
          Sub clase
        </label>
        <Autocomplete
          options={subclase}
          disableClearable
          getOptionLabel={(option) => option.label}
          onChange={handleChangeSubClase}
          renderInput={(params) => <TextField {...params} size="small" />}
        />
      </div>
      <div className="col-md-6">
        <label htmlFor="nombre" className="form-label">
          Producto
        </label>
        <Autocomplete
          options={producto}
          disableClearable
          getOptionLabel={(option) => option.label}
          onChange={handleChangeProducto}
          renderInput={(params) => <TextField {...params} size="small" />}
        />
      </div>
      <div className="col-md-2 d-flex justify-content-center">
        <button onClick={onAddProductoFinal} className="btn btn-primary">
          Agregar
        </button>
      </div>
    </div>
  );
};
