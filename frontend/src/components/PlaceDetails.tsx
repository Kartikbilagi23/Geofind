
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client/react";
import Navbar from "../components/Navbar";
import {
  GET_PLACE_DETAILS,
  GET_REVIEWS,
  GET_MY_REVIEW,
  ADD_REVIEW,
  DELETE_REVIEW,
} from "../graphql/queries";
import "./PlaceDetails.css"

type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
  };
};

type PlaceDetailsData = {
  place: {
    id: number;
    name: string;
    description: string;
    address: string;
    city: string;
    country: string;
    category: string;
    averageRating: number;
    reviewCount: number;
    createdAt: string;
  } | null;
};

type ReviewsData = {
  reviews: Review[];
};

type MyReviewData = {
  myReview: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
  } | null;
};

function PlaceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const placeId = Number(id);
  const validPlaceId = Number.isInteger(placeId) && placeId > 0;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    data: placeData,
    loading: placeLoading,
    error: placeError,
    refetch: refetchPlace,
  } = useQuery<PlaceDetailsData>(GET_PLACE_DETAILS, {
    variables: { id: placeId },
    skip: !validPlaceId,
    fetchPolicy: "network-only",
  });

  const {
    data: reviewsData,
    loading: reviewsLoading,
    refetch: refetchReviews,
  } = useQuery<ReviewsData>(GET_REVIEWS, {
    variables: { placeId },
    skip: !validPlaceId,
    fetchPolicy: "network-only",
  });

  const {
    data: myReviewData,
    refetch: refetchMyReview,
  } = useQuery<MyReviewData>(GET_MY_REVIEW, {
    variables: { placeId },
    skip: !validPlaceId,
    fetchPolicy: "network-only",
  });

  const [addReview, { loading: submitting }] = useMutation(ADD_REVIEW);
  const [deleteReview, { loading: deleting }] = useMutation(DELETE_REVIEW);

  const place = placeData?.place;
  const reviews = reviewsData?.reviews ?? [];
  const myReview = myReviewData?.myReview;

  // Populate the form when the user's existing review is loaded.
  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment);
    } else {
      setRating(0);
      setComment("");
    }
  }, [myReview]);

  async function refreshReviewData() {
    await Promise.all([
      refetchPlace(),
      refetchReviews(),
      refetchMyReview(),
    ]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");

    const trimmedComment = comment.trim();

    if (rating < 1 || rating > 5) {
      setFormError("Please select a rating between 1 and 5.");
      return;
    }

    if (!trimmedComment || trimmedComment.length > 1000) {
      setFormError("Comment must be between 1 and 1000 characters.");
      return;
    }

    try {
      await addReview({
        variables: {
          placeId,
          rating,
          comment: trimmedComment,
        },
      });

      await refreshReviewData();

      setSuccessMessage(
        myReview ? "Your review has been updated!" : "Review submitted successfully!"
      );
    } catch (error) {
      console.error("Failed to submit review:", error);
      setFormError("Could not submit your review. Please try again.");
    }
  }

  async function handleDeleteReview() {
    if (!myReview) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete your review?"
    );

    if (!confirmed) return;

    setFormError("");
    setSuccessMessage("");

    try {
      await deleteReview({
        variables: {
          reviewId: Number(myReview.id),
        },
      });

      await refreshReviewData();

      setRating(0);
      setComment("");
      setSuccessMessage("Your review has been deleted.");
    } catch (error) {
      console.error("Failed to delete review:", error);
      setFormError("Could not delete your review. Please try again.");
    }
  }

  if (!validPlaceId) {
    return <h2>Invalid place ID.</h2>;
  }

  if (placeLoading) {
    return <div className="place-details-loading">Loading place details...</div>;
  }

  if (placeError) {
    return <div className="place-details-loading">Failed to load place details.</div>;
  }

  if (!place) {
    return <div className="place-details-loading">Place not found.</div>;
  }

  return (
    <div className="place-details-page">
      <Navbar />

      <main className="place-details-container">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back to Explore
        </button>

        <section className="place-details-header">
          <div>
            <span className="details-category">{place.category}</span>
            <h1>{place.name}</h1>
            <p className="details-address">
              📍 {place.address}, {place.city}, {place.country}
            </p>
            <p className="details-description">{place.description}</p>
          </div>

          <div className="details-rating">
            <strong>
              {place.reviewCount > 0
                ? `⭐ ${place.averageRating.toFixed(1)}`
                : "New"}
            </strong>
            <span>{place.reviewCount} reviews</span>
          </div>
        </section>

        <section className="reviews-section">
          <div className="reviews-heading">
            <div>
              <span className="details-category">COMMUNITY FEEDBACK</span>
              <h2>Reviews</h2>
            </div>

            <button
              className="write-review-btn"
              onClick={() =>
                document.getElementById("write-review")?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                })
              }
            >
              ✍ Write a Review
            </button>
          </div>

          {reviewsLoading ? (
            <p>Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <div className="no-reviews">
              <h3>No reviews yet</h3>
              <p>Be the first person to share your experience!</p>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <article className="review-card" key={review.id}>
                  <div className="review-card-header">
                    <div>
                      <h3>{review.user.name}</h3>
                      <span>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <strong>{"⭐".repeat(review.rating)}</strong>
                  </div>

                  <p>{review.comment}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="write-review-section" id="write-review">
          <span className="details-category">YOUR EXPERIENCE</span>
          <h2>{myReview ? "Edit Your Review" : "Write a Review"}</h2>

          <p>
            Share your experience at {place.name} with the GeoFind community.
          </p>

          <form className="review-form" onSubmit={handleSubmit}>
            <label>Your rating</label>

            <div className="star-selector">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={star <= rating ? "star active" : "star"}
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} out of 5`}
                >
                  ★
                </button>
              ))}
              <span>{rating > 0 ? `${rating}/5` : "Select a rating"}</span>
            </div>

            <label htmlFor="review-comment">Your review</label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="What was your experience like?"
              rows={5}
              maxLength={1000}
            />

            <div className="review-form-footer">
              <small>{comment.length}/1000 characters</small>

              <div className="review-form-actions">
                {myReview && (
                  <button
                    type="button"
                    className="delete-review-btn"
                    onClick={handleDeleteReview}
                    disabled={deleting || submitting}
                  >
                    {deleting ? "Deleting..." : "Delete Review"}
                  </button>
                )}

                <button
                  type="submit"
                  className="submit-review-btn"
                  disabled={submitting || deleting}
                >
                  {submitting
                    ? "Submitting..."
                    : myReview
                      ? "Update Review"
                      : "Post Review"}
                </button>
              </div>
            </div>

            {formError && <p className="review-error">{formError}</p>}
            {successMessage && (
              <p className="review-success">{successMessage}</p>
            )}
          </form>
        </section>
      </main>
    </div>
  );
}

export default PlaceDetails;
