
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { useSearchParams, Link } from "react-router-dom";
import GeoFindLoader from "../components/GeoFindLoader";
import "./SearchResults.css";

const NEARBY_PLACES = gql`
  query NearbyPlaces(
    $latitude: Float!
    $longitude: Float!
    $radius: Float!
    $category: String
    $query: String
  ) {
    nearbyPlaces(
      latitude: $latitude
      longitude: $longitude
      radius: $radius
      category: $category
      query: $query
    ) {
      id
      name
      description
      category
      city
      address
      averageRating
      distance
    }
  }
`;

const MY_SAVED_PLACES = gql`
  query MySavedPlaces {
    mySavedPlaces {
      id
      createdAt
      place {
        id
      }
    }
  }
`;

const SAVE_PLACE = gql`
  mutation SavePlace($placeId: Int!) {
    savePlace(placeId: $placeId) {
      id
      createdAt
      place {
        id
      }
    }
  }
`;

const REMOVE_SAVED_PLACE = gql`
  mutation RemoveSavedPlace($placeId: Int!) {
    removeSavedPlace(placeId: $placeId)
  }
`;

interface Place {
  id: number;
  name: string;
  description: string;
  category: string;
  city: string;
  address: string;
  averageRating: number;
  distance: number | null;
}

interface NearbyPlacesData {
  nearbyPlaces: Place[];
}

interface NearbyPlacesVariables {
  latitude: number;
  longitude: number;
  radius: number;
  category: string | null;
  query: string | null;
}

interface SavedPlace {
  id: number;
  createdAt: string;
  place: {
    id: number;
  };
}

interface MySavedPlacesData {
  mySavedPlaces: SavedPlace[];
}

interface SavePlaceData {
  savePlace: SavedPlace;
}

interface SavePlaceVariables {
  placeId: number;
}

interface RemoveSavedPlaceData {
  removeSavedPlace: boolean;
}

const categoryMap: Record<string, string> = {
  restaurants: "RESTAURANT",
  cafes: "CAFE",
  hospitals: "HOSPITAL",
  gyms: "GYM",
  atms: "ATM",
  pharmacies: "PHARMACY",
  hotels: "HOTEL",
};

function SearchResults() {
  const [params] = useSearchParams();

  const city = params.get("city") || "Pune";
  const categorySlug = (params.get("category") || "").toLowerCase();
  const category = categoryMap[categorySlug] || "";

  const coordinates: Record<string, [number, number]> = {
    pune: [18.5204, 73.8567],
    mumbai: [19.076, 72.8777],
  };

  const [latitude, longitude] =
    coordinates[city.toLowerCase()] || coordinates.pune;

  const {
    data,
    loading,
    error,
  } = useQuery<NearbyPlacesData, NearbyPlacesVariables>(
    NEARBY_PLACES,
    {
      variables: {
        latitude,
        longitude,
        radius: 15,
        category: category || null,
        query: city,
      },
      fetchPolicy: "cache-and-network",
    }
  );

  const {
    data: savedData,
    loading: savedLoading,
    error: savedError,
  } = useQuery<MySavedPlacesData>(MY_SAVED_PLACES, {
    fetchPolicy: "cache-and-network",
  });

  const [savePlace, { loading: saving }] = useMutation<
    SavePlaceData,
    SavePlaceVariables
  >(SAVE_PLACE, {
    refetchQueries: [{ query: MY_SAVED_PLACES }],
    awaitRefetchQueries: true,
  });

  const [removeSavedPlace, { loading: removing }] = useMutation<
    RemoveSavedPlaceData,
    SavePlaceVariables
  >(REMOVE_SAVED_PLACE, {
    refetchQueries: [{ query: MY_SAVED_PLACES }],
    awaitRefetchQueries: true,
  });

  const places: Place[] = data?.nearbyPlaces ?? [];
  const savedPlaces = savedData?.mySavedPlaces ?? [];

  const savedPlaceIds = new Set(
    savedPlaces.map((saved) => saved.place.id)
  );

  const handleBookmark = async (placeId: number) => {
    try {
      if (savedPlaceIds.has(placeId)) {
        await removeSavedPlace({
          variables: { placeId },
        });
      } else {
        await savePlace({
          variables: { placeId },
        });
      }
    } catch (err) {
      console.error("Failed to update saved place:", err);
    }
  };

  return (
    <main className="search-results-page">
      <div className="search-results-header">
        <Link to="/" className="back-link">
          ← Back to GeoFind
        </Link>

        <p className="results-eyebrow">EXPLORE YOUR CITY</p>

        <h1>
          {category
            ? `${category} in ${city}`
            : `Places in ${city}`}
        </h1>

        <p className="results-subtitle">
          Discover places around {city}.
        </p>
      </div>

        {loading&& (
            <GeoFindLoader message="Finding nearby places"
            subtitle="Discovering your next favourite spot"
            />
        )}

      {error && (
        <p className="results-message error-message">
          Unable to load places. Please try again.
          <pre>{error.message}</pre>
        </p>
      )}

      {savedError && (
        <p className="results-message error-message">
          Could not load saved locations. Please check your login.
        </p>
      )}

      {!loading && !error && places.length === 0 && (
        <div className="empty-results">
          <h2>No places found</h2>
          <p>Try another category or expand your search area.</p>
        </div>
      )}

      {!error && places.length > 0 && (
        <>
          <div className="results-count">
            <span>{places.length} places found</span>
            <span>{city}</span>
          </div>

          <div className="places-grid">
            {places.map((place) => {
              const isSaved = savedPlaceIds.has(place.id);

              return (
                <article className="place-card" key={place.id}>
                  <div className="place-card-top">
                    <span className="place-category">
                      {place.category.charAt(0) +
                        place.category.slice(1).toLowerCase()}
                    </span>

                    <div className="place-card-actions">
                      <span className="place-rating">
                        ★ {place.averageRating.toFixed(1)}
                      </span>

                      <button
                        type="button"
                        className={`bookmark-button ${
                          isSaved ? "is-saved" : ""
                        }`}
                        aria-label={
                          isSaved
                            ? `Remove ${place.name} from saved places`
                            : `Save ${place.name}`
                        }
                        title={
                          isSaved ? "Remove saved place" : "Save place"
                        }
                        disabled={
                          savedLoading || saving || removing
                        }
                        onClick={() => handleBookmark(place.id)}
                      >
                        {savedLoading
                          ? "…"
                          : isSaved
                            ? "♥"
                            : "♡"}
                      </button>
                    </div>
                  </div>

                  <h2>{place.name}</h2>

                  <p className="place-description">
                    {place.description}
                  </p>

                  <p className="place-address">
                    <span>⌖</span> {place.address}
                  </p>

                  <div className="place-card-bottom">
                    <span className="place-city">
                      {place.city}
                    </span>

                    <span className="place-distance">
                      {place.distance != null
                        ? `${place.distance.toFixed(2)} km away`
                        : "Distance unavailable"}
                    </span>
                  </div>

                  <p
                    className={`bookmark-status ${
                      isSaved ? "saved" : ""
                    }`}
                  >
                    {isSaved ? "♥ Saved to My Places" : ""}
                  </p>
                </article>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}

export default SearchResults;
