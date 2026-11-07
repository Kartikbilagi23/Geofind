import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import { useQuery, useLazyQuery } from "@apollo/client/react";
import { GET_ROUTE } from "../graphql/queries";
import type { RouteData, RouteVariables, Coordinate } from "../types/route";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { NEARBY_PLACES, type NearbyPlacesData } from "../graphql/queries";
import PlaceCard from "../components/PlaceCard";
import CategorySection from "../components/CategorySection";
import GeoFindLoader from "../components/GeoFindLoader";
import Mapview from "../components/MapView";
import "leaflet/dist/leaflet.css"
import "../index.css";
import type { Place } from "../types/place";
import Footer from "../components/Footer";

function Home() {
  const [query, setquery] = useState("");
  const [places, setplaces] = useState<Place[]>([]);
  const [category, setcategory] = useState<string | null>(null);
  const [userLocation] = useState<Coordinate>({
    latitude: 18.5204,
    longitude: 73.8567,
  })
  const [selectedPlace, setselectedPlace] = useState<Place | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [getRoute, {
    data: routeData,
    loading: routeLoading,
  }] = useLazyQuery<RouteData, RouteVariables>(GET_ROUTE, {
    fetchPolicy: "network-only",
  });
  function handleSelectPlace(place: Place) {
    setselectedPlace(place);

    getRoute({
      variables: {
        origin: userLocation,
        destination: {
          latitude: place.latitude,
          longitude: place.longitude,
        },
      },
    });
  }

function slideRight() {
  carouselRef.current?.scrollBy({
    left: 450,
    behavior: "smooth"
  });
}

function slideLeft() {
  carouselRef.current?.scrollBy({
    left: -450,
    behavior: "smooth"
  });
}

  const { data, loading, error } = useQuery<NearbyPlacesData>(
    NEARBY_PLACES,
    {
      variables: {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        radius: 5,
        query: query || null,
        category: category
      },
    }
  );
  const [showLoader, setshowLoader] = useState(loading);
  const selectedCategoryLabel = category
  ? category
      .toLowerCase()
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  : null;
  useEffect(() => {
    if (loading) {
      setshowLoader(true);
      return;
    }
    const timer = window.setTimeout(() => {
      setshowLoader(false);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [loading]);
  useEffect(() => {
    if (data?.nearbyPlaces) {
      setplaces(data.nearbyPlaces)
    }
  }, [data])
  useEffect(()=>{
    setselectedPlace(null);
  },[category])
  if (showLoader) {
    return <GeoFindLoader message="Finding nearby places"
      subtitle="Discovering your next favourite spot"
    />
  }
  if (error) {
    console.log(error);
    return <h2>Failed to load places</h2>
  }
  return (
    <div className="home">

      <Navbar />

      <main>

        <section className="hero">

          <h1>
            Find the <span>best places</span>
            <br />
            near you, right now.
          </h1>

          <p>
            Restaurants, bars, cafés — rated by your city,
            filtered for you.
          </p>

          <SearchBar onSearch={setquery} />

          <div className="stats">

            <div>
              <strong>2,400+</strong>
              <span>Places</span>
            </div>

            <div>
              <strong>48k</strong>
              <span>Reviews</span>
            </div>

            <div>
              <strong>1.2 mi</strong>
              <span>Avg radius</span>
            </div>

          </div>

        </section>
        {/* <section className="results">
          <h2>{query ? `Results for ${query}`:`Places near you`}</h2>
          <div className="places-grid">
          {data?.nearbyPlaces.map((place)=>(
            <PlaceCard key={place.id} place={place}/>
          ))}
          </div>
        </section> */}
        <section className="results-section">
          <div className="results-header">
            <div>
              <p className="section-label">NEARBY</p>
              <h2>
                {selectedCategoryLabel
                  ? `${selectedCategoryLabel} near you`
                  : query
                    ? `Results for "${query}"`
                    : "Places near you"}
              </h2>            </div>
            <div className="carousel-buttons">
              <button onClick={slideLeft}>←</button>
              <button onClick={slideRight}>→</button>
            </div>
          </div>
          <div className="places-carousel" ref={carouselRef}>
            {data?.nearbyPlaces.map((place) => (
              <div key={place.id}>
              <PlaceCard
                place={place}
                isRouteSelected={selectedPlace?.id===place.id}
                onGetRoute={handleSelectPlace}
              />
              {/* <button onClick={()=>handleSelectPlace(place)}>Get Route</button> */}
              </div>
            ))}
          </div>
        </section>
        <CategorySection
          selectedCategory={category}
          onCategorySelect={setcategory}
        />
        <div className="map-section">
          <div className="map-header">
            <div>
              <span className="map-tag">LIVE LOCATION SYSTEM</span>
              <h2>Explore nearby places</h2>
              <p>Discover location around you</p>
            </div>
            <div className="map-status">
              <span className="status-dot"></span>
              MAP ACTIVE
            </div>
          </div>
          <div className="map-container">
            <Mapview places={places}
            route={routeLoading? []:routeData?.route.routes??[]}
            selectedPlace={selectedPlace}
            />
          </div>
          <div className="map-footer">
            <span>
              <span className="legend-dot red-dot"></span>
              Nearby locations
            </span>
            <span>{places.length} places found</span>
          </div>
        </div>
        {/* <div className="map-section">
        <Mapview places={places}/>
        </div> */}
      </main>
      <Footer />
    </div>
  );
}

export default Home;