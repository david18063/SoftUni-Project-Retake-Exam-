import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const HomePageMainContent = () => {
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
  const [currency, setCurrency] = useState(localStorage.getItem("currency") || "lev");

  useEffect(() => {
    fetch("http://localhost:5000/books")
      .then((response) => response.json())
      .then((data) => setBooks(data))
      .catch((error) => console.error("❌ Грешка при зареждане на книгите:", error));
  }, []);

  const handleBookClick = (event, bookId) => {
    const loggedUser = localStorage.getItem("loggedUser"); // Check if user is logged in
  
    if (!loggedUser) {
      event.preventDefault();
      alert("🔒 Трябва да сте влезли в системата, за да видите подробности за книгата!");
    } else {
      // First, increment the VisitedCount on the backend
      fetch(`http://localhost:5000/increment-visited-count/${bookId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // If the increment was successful, navigate to the book detail page
            navigate(`/book/${bookId}`);
          } else {
            console.error("Failed to increment visited count.");
          }
        })
        .catch((error) => {
          console.error('❌ Error updating visited count:', error);
        });
    }
  };

  const convertPrice = (price) => {
    const exchangeRates = { 
      lev: 1, 
      dollar: 0.55, 
      euro: 0.51 
    };

    const symbols = {
      lev: "лв.",
      dollar: "$",
      euro: "€"
    };

    if (!exchangeRates[currency]) return `${price} лв.`; // Fallback

    return `${(price * exchangeRates[currency]).toFixed(2)} ${symbols[currency]}`;
  };

  return (
    <div className="center_content">
      <div className="center_title_bar">📚 Най-нови книги</div>

      {books.length === 0 ? (
        <p>⏳ Зареждане на книгите...</p>
      ) : (
        books.map((book) => (
          <div className="prod_box" key={book.ID}>
            <div className="top_prod_box"></div>
            <div className="center_prod_box">
              <div className="product_title">
                <a href="#" onClick={(e) => handleBookClick(e, book.ID)}>
                  {book.Name}
                </a>
              </div>
              <div className="product_img">
                <a href="#" onClick={(e) => handleBookClick(e, book.ID)}>
                  <img width="90px" height="130px" src={book.ImagePath} alt={book.Name} />
                </a>
              </div>
              <div className="prod_price_main">
                Цена: <span className="reduce">{convertPrice(book.OldPrice)}</span>  
                &nbsp;
                <span className="price">{convertPrice(book.Price)}</span>  
              </div>
              <div className="prod_price_main">Автор: {book.Author}</div>
            </div>
            <div className="bottom_prod_box"></div>
          </div>
        ))
      )}
    </div>
  );
};

export default HomePageMainContent;
