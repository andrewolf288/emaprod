import { StyleSheet } from "@react-pdf/renderer";

export const stylesPDF = StyleSheet.create({
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
