
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { Link } from "react-router-dom";
import "./MyPlaces.css";

const MY_SAVED_PLACES = gql`
  query MySavedPlaces {
    mySavedPlaces {
      id
      createdAt
      place {
        id
        name
        description
        category
        city
        address
        averageRating
      }
    }
  }
`;

const REMOVE_SAVED_PLACE = gql`
  mutation RemoveSavedPlace($placeId: Int!) {
    removeSavedPlace(placeId: $placeId)
  }
`;

type Place = {
    id: number;
    name: string;
    description: string;
    category: string;
    city: string;
    address: string;
    averageRating: number;
};

type SavedPlace = {
    id: number;
    createdAt: string | number;
    place: Place;
};

type MySavedPlacesData = {
    mySavedPlaces: SavedPlace[];
};

function MyPlaces() {
    const { data, loading, error } = useQuery<MySavedPlacesData>(
        MY_SAVED_PLACES,
        {
            fetchPolicy: "cache-and-network",
        }
    );

    const [removeSavedPlace, { loading: removing }] = useMutation(
        REMOVE_SAVED_PLACE,
        {
            refetchQueries: [{ query: MY_SAVED_PLACES }],
            awaitRefetchQueries: true,
        }
    );

    const handleRemove = async (placeId: number) => {
        try {
            await removeSavedPlace({
                variables: { placeId },
            });
        } catch (err) {
            console.error("Could not remove saved place:", err);
        }
    };

    if (loading && !data) {
        return <div className="myplaces-state">Loading your saved places...</div>;
    }

    if (error) {
        return (
            <div className="myplaces-state">
                <h2>Couldn't load your places</h2>
                <p>{error.message}</p>
                <Link to="/">Back to exploring</Link>
            </div>
        );
    }

    const places = data?.mySavedPlaces ?? [];

    return (
        <main className="myplaces-page">
            <section className="myplaces-header">
                <div>
                    <p className="myplaces-eyebrow">YOUR PERSONAL COLLECTION</p>
                    <h1>My <span>Places.</span></h1>
                    <p className="myplaces-subtitle">
                        All the places you've saved, together in one spot.
                    </p>
                </div>

                <Link to="/" className="myplaces-explore">
                    Explore places <span>↗</span>
                </Link>
            </section>

            <div className="myplaces-count">
                <span>{places.length}</span>
                {places.length === 1 ? " saved place" : " saved places"}
            </div>

            {places.length === 0 ? (
                <section className="myplaces-empty">
                    <div className="myplaces-empty-icon">⌖</div>
                    <h2>Your collection is waiting.</h2>
                    <p>
                        You haven't saved any places yet. Explore GeoFind and bookmark
                        places you'd like to visit.
                    </p>
                    <Link to="/" className="myplaces-explore">
                        Discover places <span>↗</span>
                    </Link>
                </section>
            ) : (
                <section className="myplaces-grid">
                    {places.map((saved) => (
                        <article className="myplace-card" key={saved.id}>
                            <div className="myplace-card-top">
                                <span className="myplace-category">
                                    {saved.place.category}
                                </span>

                                <button
                                    className="myplace-remove"
                                    onClick={() => handleRemove(saved.place.id)}
                                    disabled={removing}
                                    title="Remove from saved places"
                                >
                                    ♥
                                </button>
                            </div>

                            <h2>{saved.place.name}</h2>
                            <p className="myplace-description">
                                {saved.place.description}
                            </p>

                            <div className="myplace-details">
                                <p>⌖ {saved.place.address}</p>
                                <p>◈ {saved.place.city}</p>
                                <p>★ {saved.place.averageRating.toFixed(1)} rating</p>
                            </div>

                            <div className="myplace-card-footer">
                                {/* <span>
                                    Saved{" "}
                                    {saved.createdAt && !isNaN(Date.parse(saved.createdAt))
                                        ? new Date(saved.createdAt).toLocaleDateString("en-IN")
                                        : "Recently"}
                                </span> */}
                                <span>
                                    Saved {new Date(Number(saved.createdAt)).toLocaleDateString("en-IN")}
                                </span>                                <span className="myplace-saved-label">♥ SAVED</span>
                            </div>
                        </article>
                    ))}
                </section>
            )}
        </main>
    );
}

export default MyPlaces;
