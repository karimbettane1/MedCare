import React, { useMemo, useState } from "react";
import { customerReviews } from "../Scripts/reviews";
import "../Styles/Reviews.css";

function Reviews() {
  const reviewsLength = customerReviews.length;
  const [review, setReview] = useState(0);

  const currentReview = useMemo(() => {
    if (!reviewsLength) {
      return {
        name: "Anonyme",
        location: "—",
        message: "Aucun avis disponible pour le moment.",
      };
    }
    return customerReviews[review];
  }, [review, reviewsLength]);

  const backBtnClick = () => {
    if (!reviewsLength) return;
    setReview((prev) => (prev <= 0 ? reviewsLength - 1 : prev - 1));
  };

  const frontBtnClick = () => {
    if (!reviewsLength) return;
    setReview((prev) => (prev >= reviewsLength - 1 ? 0 : prev + 1));
  };

  return (
    <section className="review-section" id="reviews">
      <div className="rw-text-content">
        <p className="rw-text-title">
          Plus de <span className="rw-text-num">1500+ clients</span>
        </p>

        <p className="rw-text-desc">
          Ne nous croyez pas sur parole, vérifiez les avis des clients
        </p>

        <p className="rw-text-format">
          <span className="rw-text-quote1">“</span>
          <span className="rw-review">{currentReview.message}</span>
          <span className="rw-text-quote2">”</span>
        </p>

        <div className="rw-authors">
          <div className="rw-names">
            <p className="rw-reviewer-name">{currentReview.name}</p>
            <p className="rw-reviewer-place">{currentReview.location}</p>
          </div>

          <div className="rw-btns">
            <button
              className="rw-next-btn"
              type="button"
              onClick={backBtnClick}
              aria-label="Avis précédent"
            >
              ←
            </button>
            <button
              className="rw-next-btn"
              type="button"
              onClick={frontBtnClick}
              aria-label="Avis suivant"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Reviews;
