import type { Place } from "../types/place";
import "../styles/PlaceCard.css"
import { getPlaceImage } from "../utils/placeImages";
import { useNavigate } from "react-router-dom";

interface PlaceCardProps {
  place: Place;
  onGetRoute: (place: Place) => void;
  isRouteSelected: boolean;
  // onviewDetails:(place:Place)=>void;
}

function PlaceCard({ place, onGetRoute, isRouteSelected }: PlaceCardProps) {
  const navigate = useNavigate();
  return (
    <article className="place-card">
      <div className="place-image">
        <img
          src={getPlaceImage(place.name, place.category)}
          alt={place.name}
        />
        <button className="save-btn">♡</button>
        <div className="image-overlay" />
      </div>

      <div className="place-content">
        <div className="place-card-top">
          <div>
            <h2>{place.name}</h2>
            <p className="place-category">
              {place.category} · {place.city}
            </p>
          </div>

          <div className="rating">
            <span>
              {place.reviewCount > 0
                ? `⭐ ${place.averageRating.toFixed(1)}`
                : "New"}
            </span>

            <small>
              {place.reviewCount} reviews
            </small>
          </div>
        </div>

        <p className="place-address">
          📍 {place.address}
        </p>

        <div className="place-bottom">
          <span>
            {place.distance !== null
              ? `${place.distance.toFixed(2)} km away`
              : "Distance unavailable"}
          </span>

          <div className="place-actions">
            <button
              className={`route-btn ${isRouteSelected ? "selected" : ""}`}
              onClick={() => onGetRoute(place)}
            >
              {isRouteSelected ? (
                <>✓ Route selected</>
              ) : (
                <><span>↗</span> Get route</>
              )}
            </button>

            <button className="details-btn"
              onClick={() => navigate(`/places/${place.id}`)}
            >
              View details
            </button>
            <button
              className="details-btn"
              onClick={() => navigate(`/places/${place.id}#write-review`)}
            >
              Write a Review
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default PlaceCard;