import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [selectedVote, setSelectedVote] = useState(null);
  const [currency, setCurrency] = useState(localStorage.getItem("currency") || "lev");
  const [isFavorite, setIsFavorite] = useState(false); // To track if the book is already in favorites
  const loggedUser = localStorage.getItem("loggedUser");
  const userData = JSON.parse(localStorage.getItem("loggedUser"));
  const userId = userData?.ID; // Get user ID
  const userType = userData?.UserType;
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/editbook/${id}`);
  };

  useEffect(() => {
    fetch(`http://localhost:5000/books/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setBook(data);
        checkIfFavorite(data.ID); // Check if the book is already a favorite
      })
      .catch((error) => console.error("❌ Error fetching book details:", error));
  }, [id]);

  // Check if the book is already in the user's favorites
  const checkIfFavorite = async (bookId) => {
    if (!userId) return;

    try {
      const response = await fetch(`http://localhost:5000/favourites/check/${userId}/${bookId}`);
      const data = await response.json();
      setIsFavorite(data.isFavorite); // Update the state if the book is a favorite
    } catch (error) {
      console.error("❌ Error checking if book is a favorite:", error);
    }
  };

  // Function to handle adding/removing the book to/from favorites
  const handleFavoriteToggle = async () => {
    if (!userId) {
      alert("🔒 Трябва да сте влезли в системата, за да добавите книги в любими!");
      return;
    }

    const url = isFavorite
      ? "http://localhost:5000/favourites/remove"
      : "http://localhost:5000/favourites"; // The endpoint for adding/removing favorites

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, bookId: id }),
      });

      if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

      const data = await response.json();
      if (data.success) {
        setIsFavorite(!isFavorite); // Toggle favorite state
        alert(isFavorite ? "❌ Книгата беше премахната от любими!" : "✅ Книгата беше добавена в любими!");
      } else {
        alert("❌ Грешка при добавяне/премахване на книгата от любими!");
      }
    } catch (error) {
      console.error("❌ Error toggling favorite:", error);
      alert("❌ Грешка при добавяне/премахване на любимата книга!");
    }
  };

  const convertPrice = (price) => {
    const exchangeRates = { lev: 1, dollar: 0.55, euro: 0.51 };
    const symbols = { lev: "лв.", dollar: "$", euro: "€" };

    return `${(price * (exchangeRates[currency] || 1)).toFixed(2)} ${symbols[currency]}`;
  };

  const handleVoteChange = (event) => setSelectedVote(parseInt(event.target.value, 10));

  const handleVoteSubmit = async (event) => {
    event.preventDefault();

    if (!userId) {
      alert("🔒 Трябва да сте влезли в системата, за да гласувате!");
      return;
    }

    if (!selectedVote) {
      alert("❌ Моля, изберете оценка!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, bookId: id, vote: selectedVote }),
      });

      if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

      const data = await response.json();
      alert(data.success ? "✅ Гласуването е успешно!" : "❌ Грешка при гласуването!");
    } catch (error) {
      console.error("❌ Error submitting vote:", error);
      alert("❌ Грешка при изпращането на гласа!");
    }
  };

  const addToCart = async () => {
    if (!userId) {
      alert("🔒 Трябва да сте влезли в системата, за да добавите книги в кошницата!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, bookId: id }),
      });

      if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

      const data = await response.json();
      alert(data.success ? "✅ Книгата беше добавена в кошницата!" : "❌ Грешка при добавяне!");
    } catch (error) {
      console.error("❌ Error adding to cart:", error);
      alert("❌ Неуспешно добавяне в кошницата!");
    }
  };

  if (!book) return <p>⏳ Зареждане на детайлите за книгата...</p>;

  return (
    <div className="center_content">
      <div className="center_title_bar">Подробности</div>
      <div className="prod_box_big">
        <div className="center_prod_box_big">
          <div className="product_img_big">
            <img src={book.ImagePath} alt={book.Name} style={{ width: "110px", height: "165px" }} />
          </div>
          <div className="details_big_box">
            <div className="product_title_big">{book.Name}</div>
            <div className="specifications">
              <p>Автор: <span className="blue">{book.Author}</span></p>
              <p>Издателство: <span className="blue">{book.Publisher}</span></p>
            </div>

            {/* 🔹 Voting System */}
            <div>
              <form onSubmit={handleVoteSubmit}>
                <label>Оценка: </label>
                {[1, 2, 3, 4, 5].map((num) => (
                  <label key={num}>
                    <input
                      type="radio"
                      name="vote"
                      value={num}
                      checked={selectedVote === num}
                      onChange={handleVoteChange}
                    />
                    {num}
                  </label>
                ))}
                &nbsp;
                <button type="submit">Гласувай</button>
              </form>
            </div>

            <div className="prod_price_big">
              <label>Цена: </label>
              <div>
                <span className="reduce">{convertPrice(book.OldPrice)}</span>
                <span className="price">{convertPrice(book.Price)}</span>
              </div>
            </div>

            <div style={{ marginTop: "10px", marginBottom: "20px" }}>
              <button onClick={addToCart}>🛒 Добави в кошницата</button> &nbsp;
              <button onClick={handleFavoriteToggle}>
                {isFavorite ? "Премахни от любими" : "В любими"}
              </button> &nbsp;
              {userType === 1 && (
                <button onClick={handleEdit}>Редактиране</button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="prod_box_big">
        <label style={{ fontSize: 15 }} htmlFor="description"><strong>Описание:</strong></label>
        <p id="description" style={{ fontSize: 15 }}>{book.Description}</p>
      </div>
    </div>
  );
};

export default BookDetails;
