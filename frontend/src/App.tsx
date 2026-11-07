import Login from "./pages/Login.tsx";
import Home from "./pages/Home.tsx"
import {BrowserRouter,Route,Routes} from "react-router-dom";
import { UserProvider } from "./context/UserContext.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import SearchResults from "./components/SearchResults.tsx";
import MyPlaces from "./pages/MyPlaces.tsx";
import PlaceDetails from "../src/components/PlaceDetails.tsx";

function App() {
  return(
    <>
    <BrowserRouter>
    <UserProvider>
    <Routes>
    <Route path="/" element={<ProtectedRoute><Home/></ProtectedRoute>}/>
    <Route path="/login" element={<Login/>}/>
    <Route path="/search" element={<SearchResults/>}/>
    <Route path="/my-places" element={<ProtectedRoute><MyPlaces/></ProtectedRoute>}></Route>
    <Route
    path="/places/:id"
    element={<ProtectedRoute><PlaceDetails/></ProtectedRoute>}
    />
    </Routes>
    </UserProvider>
    </BrowserRouter>
    </>
  )
}

export default App;