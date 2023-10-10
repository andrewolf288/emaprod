import React, { useState, useEffect } from "react";
// IMPORTACIONES PARA TABLE MUI
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
// IMPORTACIONES PARA EL FEEDBACK
import MuiAlert from "@mui/material/Alert";
import { useForm } from "./../../../../hooks/useForm";
import { TextField } from "@mui/material";
import { AccionesProduccionLote } from "./../../../components/AccionesProduccionLote";
import { updateFechasProduccion } from "./../../../helpers/produccion_lote/updateFechasProduccion";
import axios from "axios";
import {
  PDFViewer,
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import ReactDOM from "react-dom";
import logo from "../emaran.png";
import config from "../../../../config";
import { useLocation, useNavigate } from "react-router-dom";
import queryString from "query-string";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { FilterMotivoAgregacion } from "./../../../../components/ReferencialesFilters/MotivoAgregacion/FilterMotivoAgregacion";
import { FilterAlmacen } from "./../../../../components/ReferencialesFilters/Almacen/FilterAlmacen";
import { FilterAllProductos } from "./../../../../components/ReferencialesFilters/Producto/FilterAllProductos";

const domain = config.API_URL;

//***********************************************GENERATE PDF ********************************************* */

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "white",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  section_io: {
    margin: 1,
    padding: 1,
    flexGrow: 1,
  },
  title: {
    fontSize: 15, // Modifica el tamaño de letra del título
    marginBottom: 10,
    textAlign: "center",
  },
  content: {
    fontSize: 10, // Modifica el tamaño de letra del contenido
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  row: {
    flexDirection: "row",
  },
  column: {
    flexDirection: "column",
    flexGrow: 1,
    fontWeight: "bold",
  },
  rightAlign: {
    textAlign: "right",
  },
  grayBox: {
    backgroundColor: "#F0F0F0", // Color de fondo gris
    padding: 10,
    borderRadius: 5, // Bordes redondeados
    marginBottom: 10,
    width: "70%",
  },
  vertical: {
    flexDirection: "column",
    marginRight: 10,
  },
  grayBox_yellow: {
    backgroundColor: "#ecf7ab", // Color de fondo gris
    padding: 10,
    borderRadius: 5, // Bordes redondeados
    marginBottom: 10,
    width: "70%",
  },

  grayBox_blue: {
    backgroundColor: "#bef0f7", // Color de fondo gris
    padding: 10,
    borderRadius: 5, // Bordes redondeados
    marginBottom: 10,
    width: "70%",
  },

  gridContainer: {
    marginTop: 10,
    borderWidth: 0.7,
    borderColor: "#000",
    flexDirection: "column",
  },

  gridContainer_row: {
    marginTop: 10,
    //borderWidth: 0.7,
    borderColor: "#000",
    flexDirection: "row", // Cambiado a 'row' para alinear elementos horizontalmente
    justifyContent: "space-between", // Distribuye los elementos equitativamente en el eje X
    alignItems: "center", // Centra verticalmente los elementos en el eje Y
  },
  gridHeader: {
    flexDirection: "row",
    backgroundColor: "#E4E4E4",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderBottomWidth: 0.4,
    borderColor: "#000",
  },
  gridRow: {
    flexDirection: "row",
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderBottomWidth: 0.1,
    borderColor: "#000",
    fontSize: 15,
  },
  gridTitle: {
    flex: 1,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 7,
  },
  gridContent: {
    flex: 1,
    textAlign: "center",
  },
  gridContent_p: {
    flex: 1,
    textAlign: "center",
    fontSize: 5.5,
  },
  gridContent_num: {
    flex: 1,
    textAlign: "center",
    fontSize: 6.5,
  },

  container: {
    position: "relative", // Establece la posición del contenedor como relativa
  },
  logo: {
    position: "absolute", // Establece la posición del logo como absoluta
    top: 0, // Ajusta la posición vertical del logo (0 para estar en la parte superior)
    left: 0, // Ajusta la posición horizontal del logo (0 para estar en la parte izquierda)
    width: 150,
    height: 150,
  },
  greenBackground: {
    backgroundColor: "#baeaf7",
  },
  greenText: {
    color: "green",
  },
  green_: {
    backgroundColor: "#bdf0da",
  },
  yellow_: {
    backgroundColor: "#faf4b9",
  },
  sectionWithBorder: {
    backgroundColor: "#F0F0F0",
    borderRadius: 5,
    marginBottom: 10,
    borderColor: "#000", // Color del borde
    borderWidth: 0.1, // Ancho del borde
  },
});

function _parseInt(str) {
  // console.log(str)
  if (str.canProdAgr) {
    str.canReqDet = str.canProdAgr;
  }
  if (str.canTotProgProdFin) {
    str.canReqDet = str.canTotProgProdFin;
  }
  str.canReqDet = parseFloat(str.canReqDet).toFixed(2);
  let index = str.canReqDet.toString().indexOf(".");
  let result = str.canReqDet.toString().substring(index + 1);
  //console.log("index: ",index, "result: ", result)
  let val =
    parseInt(result) >= 1 && str.simMed !== "KGM"
      ? Math.trunc(str.canReqDet) + 1
      : str.canReqDet;
  return val;
}

const PDFExample = ({ data }) => {
  var agregaciones = data.result.agregaciones.detAgr;
  var prodsFinal = data.result.agregaciones.prodsFinal;
  //console.log(prodsFinal)
  var fecCreProdAgr = data.result.agregaciones.detAgr[0]?.fecCreProdAgr;
  var fechaInicio = data.result.agregaciones.detAgr[0]?.fechaInicio;
  var fechaFin = data.result.agregaciones.detAgr[0]?.fechaFin;
  var flag = data.result.agregaciones.detAgr[0]?.flag;

  //console.log(data.result.agregaciones.detAgr);

  return (
    <PDFViewer width="100%" height="100%">
      <Document>
        <Page
          size="A4"
          style={{
            ...styles.page,
            marginTop: 20,
            paddingTop: 20,
            paddingBottom: 40,
          }}
        >
          <View style={styles.section}>
            <View style={styles.container}>
              <Image
                src={logo}
                style={{ ...styles.logo, marginTop: -105, marginLeft: 20 }}
              />
            </View>

            <View style={{ ...styles.row, marginTop: -10 }}>
              <View style={styles.column}>
                <Text
                  style={{
                    ...styles.content,
                    fontWeight: "bold",
                    fontSize: 9,
                    maxWidth: "50%",
                    marginBottom: 2,
                    marginLeft: 20,
                  }}
                >
                  Producto Intermedio: {data.result.produccion.nomProd}
                </Text>
                <Text
                  style={{
                    ...styles.content,
                    fontWeight: "bold",
                    fontSize: 9,
                    maxWidth: "50%",
                    marginBottom: 2,
                    marginLeft: 20,
                  }}
                >
                  Fecha de Inicio Programado: {fechaInicio}
                </Text>
                ,
                <Text
                  style={{
                    ...styles.content,
                    fontWeight: "bold",
                    fontSize: 9,
                    maxWidth: "50%",
                    marginBottom: 2,
                    marginLeft: 20,
                  }}
                >
                  Fecha de Fin Programado: {fechaFin}
                </Text>
                <Text
                  style={{
                    ...styles.content,
                    fontSize: 9,
                    maxWidth: "50%",
                    marginBottom: 2,
                    marginTop: 2,
                    marginLeft: 20,
                  }}
                >
                  Observaciones
                </Text>
                <View
                  style={{
                    padding: 1,
                    fontWeight: "bold",
                    maxWidth: "90%",
                    borderRadius: 5,
                    borderWidth: 1,
                    borderColor: "#000",
                    height: 25,
                    marginTop: 2,
                    marginLeft: 20,
                  }}
                >
                  <Text
                    style={{
                      ...styles.content,
                      fontSize: 9,
                      marginLeft: 10,
                      marginRight: 0,
                      paddingRight: 0,
                      inlineSize: "50px",
                      overflowWrap: "break-word",
                      maxWidth: 275,
                      maxHeight: 275,
                    }}
                  >
                    {data.result.produccion.obsProd}
                  </Text>
                </View>
              </View>

              <View style={{ ...styles.row, marginTop: -40 }}>
                <View style={styles.column}>
                  <Text
                    style={{
                      ...styles.content,
                      fontWeight: "bold",
                      borderRadius: 5,
                      fontSize: 16,
                      marginBottom: 1,
                      backgroundColor: "#d8dbe3",
                      padding: 5,
                      marginRight: 20,
                    }}
                  >
                    ORDEN DE AGREGACION
                  </Text>
                  <View
                    style={{
                      ...styles.row,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        //flex: 1,
                        textAlign: "center",
                        //marginLeft: 10,
                        marginRight: 40,
                        marginTop: 10,
                      }}
                    >
                      {data.result.produccion.numop + " - " + flag}
                    </Text>
                  </View>

                  <View
                    style={{
                      ...styles.sectionWithBorder,
                      marginTop: 10,
                      backgroundColor: "#d8dbe3",
                      width: 220,
                      height: 60,
                      borderRadius: 5,
                      marginRight: 20,
                    }}
                  >
                    <Text
                      style={{
                        ...styles.content,
                        marginLeft: 10,
                        marginTop: 7,
                      }}
                    >
                      Número de Lote: {data.result.produccion.codLotProd}
                    </Text>
                    <Text
                      style={{
                        ...styles.content,
                        marginLeft: 10,
                        marginTop: 4,
                      }}
                    >
                      Peso Total de Lote:{" "}
                      {data.result.produccion.canLotProd + " KG"}
                    </Text>
                    <Text
                      style={{
                        ...styles.content,
                        marginLeft: 10,
                        marginTop: 4,
                        maxWidth: "100%",
                      }}
                    >
                      Tipo de Producción: {data.result.produccion.desProdTip}
                    </Text>
                  </View>

                  <Text
                    style={{
                      ...styles.content,
                      marginLeft: 130,
                      marginTop: -10,
                      maxWidth: "100%",
                      fontSize: 5,
                    }}
                  >
                    Fecha de Creación: {fecCreProdAgr}
                  </Text>
                </View>
              </View>
            </View>
            {prodsFinal.length && <ProdsFinal rows={prodsFinal} />}
            <Text
              style={{
                ...styles.title,
                fontWeight: "bold",
                fontSize: 7,
                marginLeft: -440,
                marginTop: 12,
              }}
            >
              Agregaciones
            </Text>
            <View style={{ ...styles.section, marginTop: -25 }}>
              <View style={styles.gridContainer}>
                <View style={[styles.gridHeader, styles.green_]}>
                  <Text style={{ ...styles.gridTitle, flex: 0.4 }}>
                    Cod Aso
                  </Text>
                  <Text style={{ ...styles.gridTitle, flex: 0.4 }}>Codigo</Text>
                  <Text style={{ ...styles.gridTitle, flex: 2 }}>Nombre</Text>
                  <Text
                    style={{
                      ...styles.gridTitle,
                      flex: 1,
                      textAlign: "center",
                    }}
                  >
                    Motivo
                  </Text>
                  <Text
                    style={{
                      ...styles.gridTitle,
                      flex: 1,
                      textAlign: "center",
                    }}
                  >
                    Almecen destino
                  </Text>
                  <Text style={{ ...styles.gridTitle, flex: 1 }}>Fecha</Text>
                  <Text style={{ ...styles.gridTitle, flex: 1 }}>Cantidad</Text>
                </View>
                {data.result?.agregaciones.detAgr?.map((detalle, index) => (
                  <View
                    key={index}
                    style={[
                      styles.gridRow,
                      index % 2 === 0 ? { backgroundColor: "#a4a8b0" } : {},
                    ]}
                  >
                    <Text style={{ ...styles.gridContent_p, flex: 0.4 }}>
                      {detalle.idProdFin}
                    </Text>
                    <Text style={{ ...styles.gridContent_p, flex: 0.4 }}>
                      {detalle.codProd2}
                    </Text>
                    <Text style={{ ...styles.gridContent_p, flex: 2 }}>
                      {detalle.nomProd}
                    </Text>
                    <Text style={{ ...styles.gridContent_p, flex: 1 }}>
                      {detalle.desProdAgrMot}
                    </Text>
                    <Text
                      style={{
                        ...styles.gridContent_p,
                        flex: 1,
                        textAlign: "center",
                      }}
                    >
                      {detalle.nomAlm}
                    </Text>
                    <Text style={styles.gridContent_p}>
                      {detalle.fecCreProdAgr}
                    </Text>
                    <Text style={styles.gridContent_num}>
                      {_parseInt(detalle)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

const ProdsFinal = ({ rows }) => {
  return (
    <>
      <View>
        <Text
          style={{
            ...styles.title,
            fontWeight: "bold",
            fontSize: 7,
            marginLeft: -450,
            marginTop: -2,
          }}
        >
          Producto Final
        </Text>
        <View style={{ ...styles.section, marginTop: -25 }}>
          <View style={styles.gridContainer}>
            <View style={[styles.gridHeader, styles.greenBackground]}>
              <Text style={{ ...styles.gridTitle, flex: 0.7 }}> N°</Text>
              <Text style={{ ...styles.gridTitle, flex: 0.7 }}>Cód Ref</Text>
              <Text style={{ ...styles.gridTitle, flex: 1 }}>Código</Text>
              <Text
                style={{
                  ...styles.gridTitle,
                  flex: 4,
                  textAlign: "center",
                }}
              >
                Descripción de Item
              </Text>
              <Text style={styles.gridTitle}>U.M</Text>
              <Text style={styles.gridTitle}>Cantidad</Text>
            </View>
            {rows?.map((producto, index) => (
              <View
                key={index}
                style={[
                  styles.gridRow,
                  index % 2 === 0 ? { backgroundColor: "#a4a8b0" } : {},
                ]}
              >
                <Text style={{ ...styles.gridContent_p, flex: 0.7 }}>
                  {producto.id}
                </Text>
                <Text style={{ ...styles.gridContent_p, flex: 0.7 }}>
                  {producto.codProd}
                </Text>
                <Text style={{ ...styles.gridContent_p, flex: 1 }}>
                  {producto.codProd2}
                </Text>
                <Text
                  style={{
                    ...styles.gridContent_p,
                    flex: 4,
                    textAlign: "left",
                  }}
                >
                  {producto.nomProd}
                </Text>
                <Text style={styles.gridContent_p}>{producto.simMed}</Text>
                <Text style={styles.gridContent_num}>
                  {_parseInt(producto)}
                </Text>
                {/** producto.canTotProgProdFin */}
              </View>
            ))}
          </View>
        </View>
      </View>
    </>
  );
};

const generatePDF = (data, show) => {
  const windowName = data.result.produccion.numop;

  const newWindow = window.open("", windowName, "fullscreen=yes");
  ReactDOM.render(
    <PDFExample data={data} show={show} />,
    newWindow.document.body
  );
};

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const ListAgregacion = () => {
  const location = useLocation();
  const { idLotProdc = "" } = queryString.parse(location.search);
  const [ordenProduccion, setOrdenProduccion] = useState({});

  const [inputs, setInputs] = useState({
    producto: { label: "" },
    motivo: { label: "" },
    almacen: { label: "" },
    codigoAgregacion: "",
    cantidad: "",
  });

  // ESTADOS PARA LOS FILTROS PERSONALIZADOS
  const [dataProduccionLote, setdataProduccionLote] = useState([]);
  const [dataProduccionLoteTemp, setdataProduccionLoteTemp] = useState([]);

  // ESTADOS PARA EL MODAL
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [produccionSeleccionado, setProduccionSeleccionado] = useState(null);
  //-------------my modal windows----------------
  //const [modalIsOpen, setModalIsOpen] = useState(false);

  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);

  //FUNCION PARA TRAER LA DATA DE REQUISICION MOLIENDA
  const obtenerDataSummary = async (id) => {
    try {
      let url;

      //console.log(window.location.hostname)
      if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname === "192.168.1.136"
      ) {
        url = `${domain}/produccion/produccion-lote/get_produccion_data.php?id=${id}`;
      } else {
        url = `https://emaprod.emaransac.com/produccion/produccion-lote/get_produccion_data.php?id=${id}`;
      }

      const response = await axios.get(url);
      //console.log('Datos de la API:', response.data);
      setData(response.data); // Guardar los datos en el estado
      setOpen(true); // Abrir la ventana modal
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  };

  //----------------------------------------------

  // filtros
  const {
    fecProdLotIni,
    fecProdLotFin,
    formState,
    setFormState,
    onInputChange,
  } = useForm({
    fecProdLotIni: "",
    fecProdLotFin: "",
  });

  // ESTADOS PARA LA PAGINACIÓN
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // ESTADO PARA CONTROLAR EL FEEDBACK
  const [feedbackDelete, setfeedbackDelete] = useState(false);
  const [feedbackMessages, setfeedbackMessages] = useState({
    style_message: "",
    feedback_description_error: "",
  });
  const { style_message, feedback_description_error } = feedbackMessages;

  // MANEJADORES DE FEEDBACK
  const handleClickFeeback = () => {
    setfeedbackDelete(true);
  };

  // MANEJADORES DE LA PAGINACION
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Manejadores de cambios
  const handleFormFilter = ({ target }) => {
    const { name, value } = target;
    setInputs({
      ...inputs,
      [name]: value,
    });
  };

  // Manejadores de cambios
  const handleFormFilterop = (event, name) => {
    const inputValue = event.target.value.toUpperCase(); // Convertir a mayúsculas
    filter(inputValue, name);
  };

  const onChangeProducto = (obj) => {
    setInputs({
      ...inputs,
      producto: obj,
    });
  };

  const onChangeAlmacen = (obj) => {
    setInputs({
      ...inputs,
      almacen: obj,
    });
  };

  const handleDetalleChangeMotivoAgregacion = (obj) => {
    setInputs({
      ...inputs,
      motivo: obj,
    });
  };

  const onChangeTipoProduccion = ({ label }) => {
    filter(label, "filterTipoProduccion");
  };

  const onChangeEstadoInicioProduccion = ({ label }) => {
    filter(label, "filterEstadoInicioProgramado");
  };

  const onChangeDateFechaIniciado = (newDate) => {
    const dateFilter = newDate.split(" ");
    filter(dateFilter[0], "filterFechaInicioProduccion");
  };

  const onChangeDateFechaIniciadoProgramado = (newDate) => {
    const dateFilter = newDate.split(" ");
    filter(dateFilter[0], "filterFechaInicioProgramadoProduccion");
  };

  // Filtros generales que hacen nuevas consultas
  const onChangeDateStartData = (newDate) => {
    let dateFormat = newDate.split(" ")[0];
    setFormState({ ...formState, fecProdLotIni: dateFormat });
    // realizamos una promesa
    let body = {
      ...formState,
      fecProdLotIni: dateFormat,
    };
    obtenerDataProduccionLote(body);
  };

  const onChangeDateEndData = (newDate) => {
    let dateFormat = newDate.split(" ")[0];
    setFormState({ ...formState, fecProdLotFin: dateFormat });
    // realizamos una promesa
    let body = {
      ...formState,
      fecProdLotFin: dateFormat,
    };
    obtenerDataProduccionLote(body);
  };

  // Funcion para filtrar la data
  const filter = (terminoBusqueda, name) => {};

  // ******** ACTUALIZACION DE FECHAS ********
  const onUpdateDatesProduccion = async (id, body) => {
    const resultPeticion = await updateFechasProduccion(id, body);
    const { message_error, description_error } = resultPeticion;
    if (message_error.length === 0) {
      // cerramos el modal
      closeOpcionesProduccionLote();
      // Actualizamos la data
      obtenerDataProduccionLote();
    } else {
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
      });
      handleClickFeeback();
    }
  };

  const getAgregationsByOrderProduccion = async (idLotProdc) => {
    try {
      let url;
      if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname === "192.168.1.136"
      ) {
        url = `${domain}/produccion/produccion-lote/get_produccion_data.php?id=${idLotProdc}`;
      } else {
        url = `https://emaprod.emaransac.com/produccion/produccion-lote/get_produccion_data.php?id=${idLotProdc}`;
      }

      const response = await axios.get(url);
      //console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      return error;
    }
  };

  //FUNCION PARA TRAER LA DATA DE REQUISICION MOLIENDA
  const obtenerDataProduccionLote = async (body = {}) => {
    //console.log(idLotProdc)
    if (idLotProdc.length !== 0) {
      var resultPeticion = await getAgregationsByOrderProduccion(idLotProdc);
      const { result } = resultPeticion;
      const { agregaciones, produccion } = result;

      //console.log(agregaciones.detAgr)
      agregaciones.detAgr.sort(function (a, b) {
        return a.id - b.id;
      });
      setOrdenProduccion(produccion);
      setdataProduccionLote(agregaciones.detAgr);
      setdataProduccionLoteTemp(agregaciones.detAgr);
    }
  };

  // ******* REQUISICION MOLIENDA DETALLE ********

  const closeOpcionesProduccionLote = () => {
    // ocultamos el modal
    setMostrarOpciones(false);
    // dejamos el null la data del detalle
    setProduccionSeleccionado(null);
  };

  // MOSTRAR Y OCULTAR DETALLE DE REQUISICION MOLIENDA
  const showOpcionesProduccionLote = (idPosElement) => {
    const requisicionMoliendaDetalle = dataProduccionLoteTemp[idPosElement];
    // seteamos la data de la requisicion seleccionada
    setProduccionSeleccionado(requisicionMoliendaDetalle);
    // mostramos el modal
    setMostrarOpciones(true);
  };

  // ****** TRAEMOS LA DATA DE REQUISICION MOLIENDA ******
  useEffect(() => {
    obtenerDataProduccionLote();
  }, []);

  const handleButtonClick = async (id, show, flag) => {
    try {
      let url;
      if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname === "192.168.1.136"
      ) {
        url = `${domain}/produccion/produccion-lote/get_produccion_data.php?id=${id}`;
      } else {
        url = `https://emaprod.emaransac.com/produccion/produccion-lote/get_produccion_data.php?id=${id}`;
      }

      const response = await axios.get(url);
      response.data.result.agregaciones.prodsFinal = [];

      response.data.result.agregaciones.detAgr =
        response.data.result?.agregaciones?.detAgr.filter(
          (obj) => obj.flag == flag
        );

      response.data.result.agregaciones.detAgr.map((obj) => {
        var dd = response.data.result?.prodFinalWithAgreg?.detAgr.find(
          (v) => v.id == obj.id
        );
        if (dd) {
          obj.idProdFin = dd.idProdFin;
        }
      });

      var ids = response.data.result.agregaciones.detAgr.map(
        (obj) => obj.idProdFin
      );

      response.data.result.agregaciones.prodsFinal =
        response.data.result.productos_finales.filter((obj) =>
          ids.includes(obj.id)
        );

      generatePDF(response.data, show);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  };

  useEffect(() => {
    let resultSearch = [];
    dataProduccionLote.map((data) => {
      if (
        (inputs.almacen.label.includes(data.nomAlm) ||
          inputs.almacen.label.length == 0) &&
        (inputs.motivo.label.includes(data.desProdAgrMot) ||
          inputs.motivo.label.length == 0) &&
        (inputs.producto.label.includes(data.nomProd) ||
          inputs.producto.label.length == 0) &&
        (data.canProdAgr.includes(inputs.cantidad) ||
          inputs.cantidad.length == 0) &&
        (data.flag
          .toLowerCase()
          .includes(inputs.codigoAgregacion.toLowerCase()) ||
          inputs.codigoAgregacion.length == 0)
      ) {
        resultSearch.push({ ...data });
      }
    });
    setdataProduccionLoteTemp(resultSearch);
  }, [inputs, dataProduccionLote]);

  return (
    <>
      <div className="container-fluid">
        {/* FILTROS Y EXPORTACION */}
        <div className="row d-flex mt-4">
          <div className="col-6">
            {/**
             <div className="row">
              <div className="col-4">
                Desde
                <FechaPickerMonth onNewfecEntSto={onChangeDateStartData} />
              </div>
              <div className="col-4">
                Hasta
                <FechaPickerMonth onNewfecEntSto={onChangeDateEndData} />
              </div>
            </div>
             */}
          </div>

          <div className="col-6 d-flex justify-content-end align-items-center">
            <div className="row">
              {/**
                 <div className="col-6">
                <Link
                  to={"/produccion/produccion-lote/crear"}
                  className="btn btn-primary d-inline-flex justify-content-end align-items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-plus-circle-fill me-2"
                    viewBox="0 0 16 16"
                  >
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z" />
                  </svg>
                  Agregar
                </Link>
              </div>
               */}
              {/*
                <div className="col-3">
                <button className="btn btn-success">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-file-earmark-excel-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM5.884 6.68 8 9.219l2.116-2.54a.5.5 0 1 1 .768.641L8.651 10l2.233 2.68a.5.5 0 0 1-.768.64L8 10.781l-2.116 2.54a.5.5 0 0 1-.768-.641L7.349 10 5.116 7.32a.5.5 0 1 1 .768-.64z" />
                  </svg>
                </button>
              </div>
              <div className="col-3">
                <button className="btn btn-danger">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-file-earmark-pdf-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M5.523 12.424c.14-.082.293-.162.459-.238a7.878 7.878 0 0 1-.45.606c-.28.337-.498.516-.635.572a.266.266 0 0 1-.035.012.282.282 0 0 1-.026-.044c-.056-.11-.054-.216.04-.36.106-.165.319-.354.647-.548zm2.455-1.647c-.119.025-.237.05-.356.078a21.148 21.148 0 0 0 .5-1.05 12.045 12.045 0 0 0 .51.858c-.217.032-.436.07-.654.114zm2.525.939a3.881 3.881 0 0 1-.435-.41c.228.005.434.022.612.054.317.057.466.147.518.209a.095.095 0 0 1 .026.064.436.436 0 0 1-.06.2.307.307 0 0 1-.094.124.107.107 0 0 1-.069.015c-.09-.003-.258-.066-.498-.256zM8.278 6.97c-.04.244-.108.524-.2.829a4.86 4.86 0 0 1-.089-.346c-.076-.353-.087-.63-.046-.822.038-.177.11-.248.196-.283a.517.517 0 0 1 .145-.04c.013.03.028.092.032.198.005.122-.007.277-.038.465z" />
                    <path
                      fillRule="evenodd"
                      d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5.5 1.5v2a1 1 0 0 0 1 1h2l-3-3zM4.165 13.668c.09.18.23.343.438.419.207.075.412.04.58-.03.318-.13.635-.436.926-.786.333-.401.683-.927 1.021-1.51a11.651 11.651 0 0 1 1.997-.406c.3.383.61.713.91.95.28.22.603.403.934.417a.856.856 0 0 0 .51-.138c.155-.101.27-.247.354-.416.09-.181.145-.37.138-.563a.844.844 0 0 0-.2-.518c-.226-.27-.596-.4-.96-.465a5.76 5.76 0 0 0-1.335-.05 10.954 10.954 0 0 1-.98-1.686c.25-.66.437-1.284.52-1.794.036-.218.055-.426.048-.614a1.238 1.238 0 0 0-.127-.538.7.7 0 0 0-.477-.365c-.202-.043-.41 0-.601.077-.377.15-.576.47-.651.823-.073.34-.04.736.046 1.136.088.406.238.848.43 1.295a19.697 19.697 0 0 1-1.062 2.227 7.662 7.662 0 0 0-1.482.645c-.37.22-.699.48-.897.787-.21.326-.275.714-.08 1.103z"
                    />
                  </svg>
                </button>
              </div>
              */}
            </div>
          </div>
        </div>
        {/* TABLA DE RESULTADOS */}
        <div className="mt-4">
          <Paper>
            <TableContainer>
              <Table sx={{ minWidth: 500 }} aria-label="customized table">
                <TableHead>
                  <TableRow
                    sx={{
                      "& th": {
                        color: "rgba(96, 96, 96)",
                        backgroundColor: "#f5f5f5",
                        //border:"1px solid black",
                        width: "100%",
                      },
                    }}
                  >
                    <TableCell align="left" sx={{ width: "10% !important" }}>
                      <b>Codigo</b>
                      <TextField
                        name="codigoAgregacion"
                        onChange={handleFormFilter}
                        size="small"
                        value={inputs.codigoAgregacion}
                        autoComplete="off"
                        InputProps={{
                          style: {
                            color: "black",
                            background: "white",
                          },
                        }}
                      />
                    </TableCell>

                    <TableCell align="left" sx={{ width: "30% !important" }}>
                      <b>Producto</b>
                      {/*
                        <FilterProductoProduccion onNewInput={onChangeProducto} 
                      inputs={inputs}/>
                        */}

                      <FilterAllProductos
                        onNewInput={onChangeProducto}
                        inputs={inputs}
                      />
                    </TableCell>

                    <TableCell align="left" sx={{ width: "15% !important" }}>
                      <b>Motivo</b>
                      {/**
                       <FilterEstadoProduccion
                        onNewInput={onChangeEstadoProduccion}
                         inputs={inputs}
                      />
                     */}
                      <FilterMotivoAgregacion
                        onNewInput={handleDetalleChangeMotivoAgregacion}
                        inputs={inputs}
                      />
                    </TableCell>
                    <TableCell align="left" sx={{ width: "15% !important" }}>
                      <b>Almacen destino</b>
                      <FilterAlmacen
                        onNewInput={onChangeAlmacen}
                        inputs={inputs}
                      />
                    </TableCell>
                    <TableCell align="left" sx={{ width: "15% !important" }}>
                      <b>Fecha inicio</b>
                      {/**
                         <FechaPickerDay
                        onNewfecEntSto={onChangeDateFechaIniciado}
                      />
                         */}
                    </TableCell>
                    <TableCell align="left" sx={{ width: "15% !important" }}>
                      <b>Fecha Finalización</b>
                      {/**
                       <FechaPickerDay
                        onNewfecEntSto={onChangeDateFechaIniciadoProgramado}
                      />
                      */}
                    </TableCell>
                    <TableCell align="left" sx={{ width: "20% !important" }}>
                      <b>Cantidad</b>
                      <TextField
                        name="cantidad"
                        onChange={handleFormFilter}
                        size="small"
                        value={inputs.cantidad}
                        autoComplete="off"
                        InputProps={{
                          style: {
                            color: "black",
                            background: "white",
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="left" width={120}>
                      <b>Acciones</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataProduccionLoteTemp.map((row, i) => (
                    <TableRow
                      key={row.id}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                        //border:"1px solid black"
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {ordenProduccion.numop + " - " + row.flag}
                      </TableCell>
                      {/* Empty cell for "Número OP" */}
                      <TableCell align="left">{row.nomProd}</TableCell>
                      <TableCell align="left">{row.desProdAgrMot}</TableCell>
                      <TableCell align="left">{row.nomAlm}</TableCell>
                      <TableCell align="center">{row.fechaInicio}</TableCell>
                      <TableCell align="center">{row.fechaFin}</TableCell>
                      <TableCell align="center">{row.canProdAgr}</TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                        }}
                      >
                        <div>
                          <div className="btn-toolbar">
                            ´
                            {/**
                               <ButtonPdf
                                id={row.id}
                                handleButtonClick={handleButtonClick}
                              />
                               */}
                            <button
                              onClick={() => {
                                handleButtonClick(
                                  idLotProdc,
                                  "agregaciones",
                                  row.flag
                                );
                              }}
                              className="btn btn-primary me-2 btn"
                            >
                              <PictureAsPdfIcon />
                            </button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          {mostrarOpciones && (
            <AccionesProduccionLote
              detalle={produccionSeleccionado}
              onClose={closeOpcionesProduccionLote}
              onUpdateDatesProduccion={onUpdateDatesProduccion}
            />
          )}
        </div>
      </div>
    </>
  );
};
