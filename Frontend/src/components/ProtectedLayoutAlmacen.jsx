import { Navigate, useOutlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import NavAlmacen from "../almacen/components/NavAlmacen";
import NavProduccion from "../produccion/components/NavProduccion";

export const ProtectedLayoutAlmacen = () => {
  // OBTENEMOS INFORMACION DEL LOCALSTORAGE
  const { user } = useAuth();
  const outlet = useOutlet();
  if (!user) {
    return <Navigate to={"/login"} />;
  } else {
    const { idAre } = user;
    //console.log(user)
    if (idAre === 1 || idAre === 4) {
      return (
        <>
          {idAre === 4 ? <NavProduccion /> : <NavAlmacen />}
          <main>{outlet}</main>
          <footer></footer>
        </>
      );
    } else {
      return <Navigate to={"/login"} />;
    }
  }
};
