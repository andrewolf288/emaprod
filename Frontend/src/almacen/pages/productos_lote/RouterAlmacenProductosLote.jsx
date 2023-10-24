import { ListProductosLoteProduccion } from "./ListProductosLoteProduccion";
import { AgregarProductosLoteProduccionV2 } from "./AgregarProductosLoteProduccionV2";

export const RouterAlmacenProductosLote = [
  {
    path: "",
    element: <ListProductosLoteProduccion />,
  },
  {
    path: "crear",
    element: <AgregarProductosLoteProduccionV2 />,
  },
];
