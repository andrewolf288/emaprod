import React from 'react'
import { Text, View } from '@react-pdf/renderer'
import { stylesPDF } from '../stylePDF'

const styles = stylesPDF

export const PDFRequisicionDevolucionMaterialesDetalle = ({ requisicion, acumulado }) => {
  const { detDev: detReqDev } = requisicion

  return (
    <View>
      <Text
        style={{
          ...styles.title,
          fontWeight: 'bold',
          fontSize: 7,
          marginLeft: -440,
          marginTop: -12
        }}
      >
        Detalle de requisición
      </Text>
      <View style={{ ...styles.section, marginTop: -25 }}>
        <View style={styles.gridContainer}>
          <View style={[styles.gridHeader, styles.green_]}>
            <Text style={{ ...styles.gridTitle, flex: 0.7 }}> Cód Aso</Text>
            {/* <Text style={{ ...styles.gridTitle, flex: 0.7 }}>SIIGO</Text> */}
            <Text
              style={{
                flex: 1,
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 7,
                // border: "1px solid black",
                maxWidth: '40px'
              }}
            >
              EMAPROD
            </Text>
            <Text
              style={{
                flex: 3,
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 7,
                maxWidth: '40px'
              }}
            >
              Motivo
            </Text>
            <Text
              style={{
                ...styles.gridTitle,
                flex: 4,
                textAlign: 'center'
                // border: "1px solid black",
              }}
            >
              Descripción de Item
            </Text>
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: 7,
                maxWidth: '30px'
                // border: "1px solid black",
              }}
            >
              U.M
            </Text>
            <Text
              style={{
                flex: 1,
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 7,
                // border: "1px solid black",
                maxWidth: '40px'
              }}
            >
              Cantidad
            </Text>
          </View>
          {detReqDev.map((detalle, index) => (
            <View
              key={index}
              style={[
                styles.gridRow,
                index % 2 === 0 ? { backgroundColor: '#a4a8b0' } : {}
              ]}
            >
              <Text style={{ ...styles.gridContent_p, flex: 0.7 }}>
                {requisicion.idProdFin}
              </Text>
              {/* <Text style={{ ...styles.gridContent_p, flex: 0.7 }}>
                {detalle.codProd}
              </Text> */}
              <Text
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: 5.5,
                  maxWidth: '40px'
                }}
              >
                {detalle.codProd2}
              </Text>
              <Text
                style={{
                  flex: 3,
                  textAlign: 'center',
                  fontSize: 5.5,
                  maxWidth: '40px'
                }}
              >
                {detalle.desProdDevMot}
              </Text>
              <Text
                style={{
                  ...styles.gridContent_p,
                  flex: 4,
                  textAlign: 'left'
                  // border: "1px solid black",
                }}
              >
                {detalle.nomProd}
              </Text>
              <Text
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: 5.5,
                  maxWidth: '25px'
                  // border: "1px solid black",
                }}
              >
                {detalle.simMed}
              </Text>
              {/** <Text style={styles.gridContent_num}>{detalle.canReqDet}</Text> */}
              <Text
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: 6.5,
                  maxWidth: '40px'
                  // border: "1px solid black",
                }}
              >
                {/* {_parseInt(detalle, "canReqDet")} */}
                {detalle.canReqDevMatDet}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <Text
        style={{
          ...styles.title,
          fontWeight: 'bold',
          fontSize: 7,
          marginLeft: -440,
          marginTop: -12
        }}
      >
        Detalle acumulado
      </Text>

      <View style={{ ...styles.section, marginTop: -25 }}>
        <View style={styles.gridContainer}>
          <View style={[styles.gridHeader, styles.green_]}>
            <Text style={{ ...styles.gridTitle, flex: 0.7 }}> Cód Aso</Text>
            {/* <Text style={{ ...styles.gridTitle, flex: 0.7 }}>SIIGO</Text> */}
            <Text
              style={{
                flex: 1,
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 7,
                // border: "1px solid black",
                maxWidth: '40px'
              }}
            >
              EMAPROD
            </Text>
            <Text
              style={{
                ...styles.gridTitle,
                flex: 4,
                textAlign: 'center'
                // border: "1px solid black",
              }}
            >
              Descripción de Item
            </Text>
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: 7,
                maxWidth: '30px'
                // border: "1px solid black",
              }}
            >
              U.M
            </Text>
            <Text
              style={{
                flex: 1,
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 7,
                // border: "1px solid black",
                maxWidth: '40px'
              }}
            >
              Cantidad total
            </Text>
          </View>
          {acumulado.map((detalle, index) => (
            <View
              key={index}
              style={[
                styles.gridRow,
                index % 2 === 0 ? { backgroundColor: '#a4a8b0' } : {}
              ]}
            >
              <Text style={{ ...styles.gridContent_p, flex: 0.7 }}>
                {requisicion.idProdFin}
              </Text>
              {/* <Text style={{ ...styles.gridContent_p, flex: 0.7 }}>
                {detalle.codProd}
              </Text> */}
              <Text
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: 5.5,
                  maxWidth: '40px'
                }}
              >
                {detalle.codProd2}
              </Text>
              <Text
                style={{
                  ...styles.gridContent_p,
                  flex: 4,
                  textAlign: 'left'
                  // border: "1px solid black",
                }}
              >
                {detalle.nomProd}
              </Text>
              <Text
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: 5.5,
                  maxWidth: '25px'
                  // border: "1px solid black",
                }}
              >
                {detalle.simMed}
              </Text>
              {/** <Text style={styles.gridContent_num}>{detalle.canReqDet}</Text> */}
              <Text
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: 6.5,
                  maxWidth: '40px'
                  // border: "1px solid black",
                }}
              >
                {/* {_parseInt(detalle, "canReqDet")} */}
                {detalle.acu}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}
