import React from "react";
import "./Card.scss";

function Card(props) {
  const { card } = props;
  console.log(card.cover);

  return (
    <li className="card-item">
      {card.cover && (
        <img className="card-cover" src={card.cover} alt="tiendndev-img" />
      )}
      {card.title}
    </li>
  );
}

export default Card;
