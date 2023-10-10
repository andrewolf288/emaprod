import { createContext, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "./useLocalStorage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useLocalStorage("user");
    const navigate = useNavigate();

    const login = async (data) => {
        setUser(data);
        const { idAre } = data;
        setTimeout(() => {
            switch (idAre) {
                case 1: navigate("/almacen", { replace: true });
                    break;
                case 2: navigate("/molienda", { replace: true });
                    break;
                case 3: navigate("/seleccion", { replace: true });
                    break;
                case 4: navigate("/produccion", { replace: true });
                    break;
                case 5: navigate("/envasado", { replace: true });
                    break;
                case 6: navigate("/encajonado", { replace: true });
                    break;
                case 7: navigate("/frescos", { replace: true });
                    break;
                case 0: navigate("/calidad", { replace: true });
                    break;
            };
        }, 100)
    };

    const logout = () => {
        setUser(null);
        navigate("/", { replace: true });
    };

    const value = useMemo(
        () => ({
            user,
            login,
            logout
        }),
        [user]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};
