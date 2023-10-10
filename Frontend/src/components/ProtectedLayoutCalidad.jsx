import { Navigate, useOutlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import NavCalidad from "../calidad/components/NavCalidad";
import NavProduccion from "../produccion/components/NavProduccion";

export const ProtectedLayoutCalidad = () => {
  // OBTENEMOS INFORMACION DEL LOCALSTORAGE
  const { user } = useAuth();
  const outlet = useOutlet();

  if (!user) {
    return <Navigate to={"/login"} />;
  } else {
    return (
      <>
        <NavCalidad />
        <main>{outlet}</main>
        <footer></footer>
      </>
    );
  }
};
