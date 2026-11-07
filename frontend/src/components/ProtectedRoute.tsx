import {Navigate} from "react-router-dom";
import { useUser } from "../context/UserContext";

interface Props{
    children: React.ReactNode;
}
function  ProtectedRoute({children}:Props) {
    const {user}=useUser();

    if(!user){
        return <Navigate to="/login" replace/>
    }
    return children;
}

export default ProtectedRoute;
