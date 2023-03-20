import React from "react";
import "./Card.scss";

function Card(props) {
  const { card } = props;

  return (
    <div className="card-item">
      {card.cover && (
        <img
          className="card-cover"
          src={card.cover}
          alt="tiendndev-img"
          onMouseDown={(e) => e.preventDefault}
        />
      )}
      {card.title}
    </div>
  );
}

export default Card;
