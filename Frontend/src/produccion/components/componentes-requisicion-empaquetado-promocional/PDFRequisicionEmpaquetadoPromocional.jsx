import React from 'react'
import {
  PDFViewer,
  Page,
  Text,
  View,
  Document,
  Image
} from '@react-pdf/renderer'
import logo from '../emaran.png'
import { stylesPDF } from '../pdf-components/stylePDF'
import { PDFRequisicionEmpaquetadoPromocionalDetalle } from './PDFRequisicionEmpaquetadoPromocionalDetalle'

const styles = stylesPDF

export const PDFRequisicionEmpaquetadoPromocional = ({ data }) => {
  const { requisicion, requisicionDetalle } = data
  return (
    <PDFViewer width="100%" height="100%">
      <Document>
        <Page
          size="A4"
          style={{
            ...styles.page,
            marginTop: 20,
            paddingTop: 20,
            paddingBottom: 40
          }}
        >
          <View style={styles.section}>
            {/* INSERTAMOS EL LOGO DE LA IMAGEN */}
            <View style={styles.container}>
              <Image
                src={logo}
                style={{ ...styles.logo, marginTop: -105, marginLeft: 20 }}
              />
            </View>
            {/* DATOS DE OPERACION */}
            <View style={{ ...styles.row, marginTop: -10 }}>
              {/* DETALLE DE PRODUCTOS TRANSFORMADOS */}
              <View style={styles.column}>
                <Text
                  style={{
                    ...styles.content,
                    fontWeight: 'bold',
                    fontSize: 9,
                    maxWidth: '50%',
                    marginBottom: 2,
                    marginLeft: 20
                  }}
                >
                  Producto promocional: {requisicion.nomProd}
                </Text>
                <Text
                  style={{
                    ...styles.content,
                    fontWeight: 'bold',
                    fontSize: 9,
                    maxWidth: '50%',
                    marginBottom: 2,
                    marginLeft: 20
                  }}
                >
                  Cantidad requerida: {`${requisicion.canReqEmpPro} ${requisicion.simMed}`}
                </Text>
              </View>
              {/* DETALLE DE LOTE */}
              <View style={{ ...styles.row, marginTop: -40 }}>
                <View style={styles.column}>
                  <Text
                    style={{
                      ...styles.content,
                      fontWeight: 'bold',
                      borderRadius: 5,
                      fontSize: 12,
                      marginBottom: 1,
                      backgroundColor: '#d8e86f',
                      padding: 5,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    Requisición Empaquetado Promocional
                  </Text>
                  <View
                    style={{
                      ...styles.row,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        marginLeft: 20,
                        marginTop: 10
                      }}
                    >
                      {requisicion.correlativo}
                    </Text>
                  </View>

                  <View
                    style={{
                      ...styles.sectionWithBorder,
                      marginTop: 10,
                      backgroundColor: '#d8dbe3',
                      width: 220,
                      height: 50,
                      borderRadius: 5
                    }}
                  >
                    <Text
                      style={{
                        ...styles.content,
                        marginLeft: 10,
                        marginTop: 7,
                        maxWidth: '100%'
                      }}
                    >
                      Fecha requisición: {requisicion.fecCreReqEmpProm}
                    </Text>
                    <Text
                      style={{
                        ...styles.content,
                        marginLeft: 10,
                        marginTop: 7,
                        maxWidth: '100%'
                      }}
                    >
                      Fecha actualización: {requisicion.fecActReqEmpProm}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            {/* REQUISICION DE MAERIALES */}
            <PDFRequisicionEmpaquetadoPromocionalDetalle
              requisicion={requisicionDetalle}
              styles={styles} />
          </View>
        </Page>
      </Document>
    </PDFViewer>
  )
}
