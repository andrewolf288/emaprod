<?php
/*
AUTOR: Andrew Jacobo
EMAIL: pold.jacobo89@gmail.com

- Correlativo: numero secuencial relacionado al numero de filas (se inicia en 1)
- Relacionado: numero del registro (se inicia en 1)
- Ejercicio: año de ejercicio (que se ingrese o si no se proporciona se obtenga segun el año actual)
- Periodo: mes del año (Enero: 01, etc), CONTANET maneja 00, 12 y 14 (ver documentación para ello)
- Cod. Modulo: Definir uno por defecto (Se propone código del modulo contable, inventario o compras)
- Modulo: Nombre corto del módulo (Revisar documentación de formato de importacion)
- Fuente: Es el libro contable al cual ira dirigido (LD, RC, RV, CB)
- Nro. Cuenta: Numero de cuenta
- Cod. Mda. Origen: Codigo de moneda de origen de la cuenta
- Cod. Mda. Registro: Moneda en la cual queremos registrar los comprobantes
- Cod. Centro C: Código de Centro de Costos (Consultar con contabilidad)
- Cod. Sub. Centro C: Código de Subcentro de Costos (Consultar con contabilidad)
- Cod. Sub. Sub. Centro C: Código de Sub Subcentro de Costos (Consultar con contabilidad)
- Cod. Forma Provision: (por defectto 1 siempre)
- Cod. Forma: Forma de pago (contado: 01, credito: 02, letra:03)
- Cod. Area: Area (ponerse de acuerdo con contabilidad que área debe ir)
- Identificador Ctr Mda: Identificador control de moneda (en que manera se quiere visualizar el comprobante) siempre ponerla en a (ambos)
- Identificador Tip. Afecto (Preguntar a contabilidad)
- Fecha Emision Doc: Fecha de emision del documento
- Fecha de Vencimiento Doc: Fecha de vencimiento del documento
- Fecha Movimiento: Fecha de movimiento
- Fecha de Registro: Fecha de registro
    Condiciones: 
        * Emision y Vencimiento es lo mismo si el pago es al contado
        * Emision y Vencimiento es diferente si el pago no es al contado
        * Movimiento y Registro es la fecha en la que se realiza la importacion

- Monto debe: monto del debe (redondeado a los 2 digitos)
- Monto haber: monto del haber (redondeado a los 2 digitos)
- Monto Debe ME: monto del debe pero su correspondiente en dolares
- Monto Haber ME: monto del haber pero su correspondiente en dolares
- Cambio Moneda: el cambio de moneda en la cual se realizo la operación

DESCRIPCION GENERAL DEL PROCESO:
1. Cada mes se suben los asientos de ingreso a almacen correspondientes a las diferentes compras que se consignan mensualmente
2. El programa consultara todas las ordenes de compras que se realizaron en el mes para obtener la información de las cuales ya se generaron
sus respectivas entradas y su registro de gastos de otros servicios (fletes)
3. El programa extraerá la información necesaria para formar los asientos contables
4. Se sumara el costo de gasto en materia prima + flete
5. Dependiendo del tipo de materia prima ingresada se le asignara la cuenta destino: 24 (materia prima), 25(envases y embalajes), etc
6. De un registro minimo debe haber 2 operaciones. Casos:
    * El caso cuando no hay flete y la compra solo tiene como detalle 1 item: 2 operaciones (D-C)
    * El caso cuando hay flete y solo se tiene como detalle 1 item: 3 operaciones (D-D-C)
    * El caso cuando hay flete y hay más de 1 item como detalle: se hacen un registro por cada item y el flete se clona en los registros
    * El caso cuando hay muchos fletes y hay más de 1 item como detalle: se hace un registro por cada item y ek flete acumulado se clona en los registros
    * Cabe destacar que se cargaran en el C (Credito) siempre la suma del costo del acumulado del flete con el costo de la materia prima.
7. Se forma un excel en base a la plantilla proporcionada por CONTANET
8. Se importa en CONTANET
9. Fin del proceso

*/

$message_error = "";
$description_error = "";
$result = [];

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // Condicion de conexion
    if ($pdo) {

        // preparamos el sql para la consulta a integracion_orden_compra
        $fecha_inicio = ""; // FECHA DE INICIO
        $fecha_fin = ""; // FECHA DE FIN

        if (empty($fecha_inicio)) {
            // obtenemos el mes actual con php
            // completamos la fecha fin con el dia de termino de dicho mes
        }

        $sql_orden_compra =
            "SELECT * 
        FROM integracion_orden_compra
        WHERE DATE(fecha) BETWEEN '$fecha_inicio' AND DATE_ADD('$fecha_fin', INTERVAL 1 DAY)";

        // preparamos la consulta
        $stmt_orden_compra = $pdo->prepare();
        // ejecutamos la consulta
        $stmt_orden_compra->execute();

        while ($row = $stmt_orden_compra->fetch(PDO::FETCH_ASSOC)) {
            // Aqui adentro iteramos cada compra realizada
            // primero obtenemos el flete total de dicha compra, la misma que sera replicada en el acumulativo del detalle de compra de cada item
            // preparamos la consulta

            // primero obtenemos el codigo de la orden de compra que es utilizado como unico identificador
            $Cod_OC = $row["Cod_OC"];
            // otra forma seria obtenerlo con el id de la misma tabla integracion
            $idIntOrdCom = $row["id"];

            $sql_otros_servicios_orden_compra =
                "SELECT *
            FROM integracion_orden_compra_otros_servicios
            WHERE idIntOrdCom = ?";
            $stmt_otros_servicios_orden_compra = $pdo->prepare($sql_otros_servicios_orden_compra);
            $stmt_otros_servicios_orden_compra->bindParam(1, $idIntOrdCom, PDO::PARAM_INT);
            $stmt_otros_servicios_orden_compra->execute();

            // Ahora creamos una variable donde se encontrara el acumulativo
        }
    } else {
        $message_error = "Error con la conexion a la base de datos";
        $description_error = "Error con la conexion a la base de datos a traves de PDO";
    }

    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
