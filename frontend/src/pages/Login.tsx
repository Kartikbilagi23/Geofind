
import { useState, type FormEvent } from "react";
import { useMutation } from "@apollo/client/react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { LOGIN } from "../graphql/auth";
import "./Login.css";

type LoginData = {
  login: {
    token: string;
    user: {
      id: number;
      name?: string;
      email: string;
    };
  };
};

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const {refreshUser}=useUser();

  const [login, { loading, error }] =
    useMutation<LoginData>(LOGIN);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const { data } = await login({
        variables: {
          user: { email, password },
        },
      });

      const token = data?.login?.token;

      if (!token) {
        return;
      }

      localStorage.setItem("token", token);
      await refreshUser();
      navigate("/");
    } catch (err) {
      // Apollo exposes the error through the `error` state.
      console.error("Login failed:", err);
    }
  };

  return (
    <main className="login-page">
      <div className="login-glow login-glow-one" />
      <div className="login-glow login-glow-two" />

      <header className="login-navbar">
        <Link to="/" className="login-brand">
          <span className="brand-icon">G</span>
          <span>Geo<span className="brand-highlight">Find</span></span>
        </Link>

        <Link to="/" className="login-back-link">
          ← Back to exploring
        </Link>
      </header>

      <section className="login-layout">
        <div className="login-hero">
          <span className="login-eyebrow">
            <span className="eyebrow-dot" />
            YOUR WORLD, CLOSER
          </span>

          <h1>
            Find your
            <br />
            <span>next favourite</span>
            <br />
            place.
          </h1>

          <p className="login-hero-text">
            From hidden gems to iconic destinations,
            discover places worth remembering.
          </p>

          <div className="landmark-grid">
            <article className="landmark-card landmark-taj">
              <img
                src="https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=700&q=85"
                alt="Taj Mahal in Agra"
              />
              <div className="landmark-overlay" />
              <div className="landmark-info">
                <span>INDIA</span>
                <h3>Taj Mahal</h3>
              </div>
              <span className="landmark-pin">⌖</span>
            </article>

            <article className="landmark-card landmark-paris">
              <img
                src="https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=600&q=85"
                alt="Eiffel Tower in Paris"
              />
              <div className="landmark-overlay" />
              <div className="landmark-info">
                <span>FRANCE</span>
                <h3>Paris</h3>
              </div>
            </article>

            <article className="landmark-card landmark-dubai">
              <img
                src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=85"
                alt="Dubai skyline"
              />
              <div className="landmark-overlay" />
              <div className="landmark-info">
                <span>UAE</span>
                <h3>Dubai</h3>
              </div>
            </article>
          </div>

          <p className="landmark-caption">
            <span>✦</span> Iconic places. Local discoveries. One map.
          </p>
        </div>

        <div className="login-form-side">
          <div className="login-glass-card">
            <div className="login-card-icon">⌖</div>

            <p className="login-card-eyebrow">WELCOME BACK</p>
            <h2>Let's get you there.</h2>
            <p className="login-card-subtitle">
              Sign in to save places and plan your next visit.
            </p>

            <form onSubmit={handleSubmit} className="login-form">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />

              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />

              {error && (
                <p className="login-error" role="alert">
                  {error.message.includes("Invalid credentials")
                    ? "Email or password is incorrect."
                    : error.message}
                </p>
              )}

              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >
                {loading ? (
                  "Signing you in..."
                ) : (
                  <>
                    Explore GeoFind <span>↗</span>
                  </>
                )}
              </button>
            </form>

            <div className="login-divider">
              <span />
              <p>YOUR NEXT DISCOVERY AWAITS</p>
              <span />
            </div>

            <p className="login-security-note">
              <span>✦</span> Your saved places stay linked to your account.
            </p>
          </div>

          <p className="login-footer">
            Made for the places that bring us together.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;
