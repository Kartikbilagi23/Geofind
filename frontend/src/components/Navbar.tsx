import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import {MapPin} from "lucide-react";
import "../index.css";

function Navbar(){
    const {user,logout}=useUser();

return (
    <nav className="navbar">
<Link to="/" className="nav-logo">
  <span className="logo-box">
    <MapPin size={25} strokeWidth={2.5} />
  </span>
  <span className="logo-text">GeoFind</span>
</Link>
    <div className="nav-links">
        <Link to="/">Explore</Link>
        <Link to="/my-places">Lists</Link>
        {
            user? (
                <button onClick={logout}>Sign out</button>
            ):(
                <Link className="login-btn" to="/login">Log in</Link>
            )
        }
    </div>
    </nav>
)


}
export default Navbar;
