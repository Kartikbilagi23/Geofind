import { useState } from "react";
function SearchBar({onSearch}:{onSearch:(query:string)=>void}){
    const [search, setsearch] = useState("");
    const [location, setlocation] = useState("");

return (
    <div className="search-wrapper">
        <div className="search-input">
            <span>⌕</span>
            <input type="text"
            value={search}
            onChange={(e)=>setsearch(e.target.value)}
            placeholder="Tacos,wine bar,ramen..." />
        </div>
        <div className="location-input">
            <span>⌖</span>
            <input type="text" value={location}
            placeholder="Pune,Maharashtra"
            onChange={(e)=>setlocation(e.target.value)}/>
        </div>
        <button onClick={()=>onSearch(search)} className="search-btn">Search</button>
    </div>
)

}
export default SearchBar;