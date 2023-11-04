import React from "react";
import { Text, View } from "@react-pdf/renderer";
import { stylesPDF } from "../pdf-components/stylePDF";
import { _parseInt } from "../../../utils/functions/ParseInt";

export const PDFRequisicionAgregacion = ({ requisicion }) => {
  const styles = stylesPDF;
  const { detReqAgr } = requisicion;
  return (
    <View>
      <Text
        style={{
          ...styles.title,
          fontWeight: "bold",
          fontSize: 7,
          marginLeft: -450,
          marginTop: 10,
        }}
      >
        Presentación Final
      </Text>
      <View style={{ ...styles.section, marginTop: -25 }}>
        <View style={styles.gridContainer}>
          <View style={[styles.gridHeader, styles.greenBackground]}>
            <Text style={{ ...styles.gridTitle, flex: 0.7 }}> N°</Text>
            <Text style={{ ...styles.gridTitle, flex: 0.7 }}>SIIGO</Text>
            <Text style={{ ...styles.gridTitle, flex: 1 }}>EMAPROD</Text>
            <Text
              style={{
                ...styles.gridTitle,
                flex: 2,
                textAlign: "center",
              }}
            >
              Motivo agregación
            </Text>
            <Text
              style={{
                ...styles.gridTitle,
                flex: 4,
                textAlign: "center",
              }}
            >
              Presentación
            </Text>
            <Text style={styles.gridTitle}>U.M</Text>
            <Text style={styles.gridTitle}>Cantidad</Text>
          </View>
          <View
            // key={index}
            style={[styles.gridRow, { backgroundColor: "#a4a8b0" }]}
          >
            <Text style={{ ...styles.gridContent_p, flex: 0.7 }}>
              {requisicion.idProdFin}
            </Text>
            <Text style={{ ...styles.gridContent_p, flex: 0.7 }}>
              {requisicion.codProd}
            </Text>
            <Text style={{ ...styles.gridContent_p, flex: 1 }}>
              {requisicion.codProd2}
            </Text>
            <Text style={{ ...styles.gridContent_p, flex: 2 }}>
              {requisicion.desProdAgrMot}
            </Text>
            <Text
              style={{
                ...styles.gridContent_p,
                flex: 4,
                textAlign: "left",
              }}
            >
              {requisicion.nomProd}
            </Text>
            <Text style={styles.gridContent_p}>{requisicion.simMed}</Text>
            <Text style={styles.gridContent_num}>
              {requisicion.canTotUndReqAgr}
            </Text>
          </View>
        </View>
      </View>

      <Text
        style={{
          ...styles.title,
          fontWeight: "bold",
          fontSize: 7,
          marginLeft: -440,
          marginTop: -12,
        }}
      >
        Detalle de requisición
      </Text>
      <View style={{ ...styles.section, marginTop: -25 }}>
        <View style={styles.gridContainer}>
          <View style={[styles.gridHeader, styles.green_]}>
            <Text style={{ ...styles.gridTitle, flex: 0.7 }}> Cód Aso</Text>
            <Text style={{ ...styles.gridTitle, flex: 0.7 }}>SIIGO</Text>
            <Text
              style={{
                flex: 1,
                fontWeight: "bold",
                textAlign: "center",
                fontSize: 7,
                //border: "1px solid black",
                maxWidth: "40px",
              }}
            >
              EMAPROD
            </Text>
            <Text
              style={{
                ...styles.gridTitle,
                flex: 4,
                textAlign: "center",
                //border: "1px solid black",
              }}
            >
              Descripción de Item
            </Text>
            <Text
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: 7,
                maxWidth: "30px",
                //border: "1px solid black",
              }}
            >
              U.M
            </Text>
            <Text
              style={{
                flex: 1,
                fontWeight: "bold",
                textAlign: "center",
                fontSize: 7,
                //border: "1px solid black",
                maxWidth: "40px",
              }}
            >
              Cantidad
            </Text>
          </View>
          {detReqAgr.map((detalle, index) => (
            <View
              key={index}
              style={[
                styles.gridRow,
                index % 2 === 0 ? { backgroundColor: "#a4a8b0" } : {},
              ]}
            >
              <Text style={{ ...styles.gridContent_p, flex: 0.7 }}>
                {requisicion.idProdFin}
              </Text>
              <Text style={{ ...styles.gridContent_p, flex: 0.7 }}>
                {detalle.codProd}
              </Text>
              <Text
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: 5.5,
                  //border: "1px solid black",
                  maxWidth: "40px",
                }}
              >
                {detalle.codProd2}
              </Text>
              <Text
                style={{
                  ...styles.gridContent_p,
                  flex: 4,
                  textAlign: "left",
                  //border: "1px solid black",
                }}
              >
                {detalle.nomProd}
              </Text>
              <Text
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: 5.5,
                  maxWidth: "25px",
                  //border: "1px solid black",
                }}
              >
                {detalle.simMed}
              </Text>
              {/** <Text style={styles.gridContent_num}>{detalle.canReqDet}</Text> */}
              <Text
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: 6.5,
                  maxWidth: "40px",
                  //border: "1px solid black",
                }}
              >
                {/* {_parseInt(detalle, "canReqDet")} */}
                {detalle.canReqAgrDet}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};
