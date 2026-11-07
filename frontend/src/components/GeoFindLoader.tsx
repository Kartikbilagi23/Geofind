
import "./GeoFindLoader.css";

interface GeoFindLoaderProps {
  message?: string;
  subtitle?: string;
}

function GeoFindLoader({
  message = "Finding nearby places",
  subtitle = "Discovering your next favourite spot",
}: GeoFindLoaderProps) {
  return (
    <div className="geofind-loader" role="status" aria-live="polite">
      <div className="geofind-loader-glow">
        <div className="geofind-loader-icon">⌖</div>
      </div>

      <h2 className="geofind-loader-title">{message}</h2>

      <p className="geofind-loader-subtitle">{subtitle}</p>

      <div className="geofind-loader-track">
        <div className="geofind-loader-progress" />
      </div>

      <span className="geofind-loader-label">
        LOADING GEO FIND
      </span>
    </div>
  );
}

export default GeoFindLoader;
