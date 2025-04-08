import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const PublisherContent = () => {
  const [searchParams] = useSearchParams();
  const publisher = searchParams.get("name") || "";
  const [books, setBooks] = useState([]);
  const [currency, setCurrency] = useState(localStorage.getItem("currency") || "lev");
  const navigate = useNavigate();

  useEffect(() => {
    if (publisher) {
      fetchBooks();
    }
  }, [publisher]);

  const fetchBooks = async () => {
    try {
      const response = await fetch(`http://localhost:5000/books/publisher/${encodeURIComponent(publisher)}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error("❌ Грешка при зареждане на книги по издателство:", error);
    }
  };

  const handleBookClick = (event, bookId) => {
    const loggedUser = localStorage.getItem("loggedUser");

    if (!loggedUser) {
      event.preventDefault();
      alert("🔒 Трябва да сте влезли в системата, за да видите подробности за книгата!");
    } else {
      fetch(`http://localhost:5000/increment-visited-count/${bookId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) navigate(`/book/${bookId}`);
          else console.error("Failed to increment visited count.");
        })
        .catch((error) => console.error("❌ Error updating visited count:", error));
    }
  };

  const convertPrice = (price) => {
    const exchangeRates = { lev: 1, dollar: 0.55, euro: 0.51 };
    const symbols = { lev: "лв.", dollar: "$", euro: "€" };
    return `${(price * exchangeRates[currency]).toFixed(2)} ${symbols[currency]}`;
  };

  return (
    <div className="center_content">
      <div className="center_title_bar">Книги от издателство: {publisher}</div>

      {books.length === 0 ? (
        <p style={{ textAlign: "center", marginTop: "20px" }}>❌ Няма намерени резултати.</p>
      ) : (
        books.map((book) => (
          <div className="prod_box_big" key={book.ID}>
            <div className="top_prod_box_big"></div>
            <div className="center_prod_box_big_search">
              <div className="product_img_big">
                <a href="#">
                  <img src={book.ImagePath} alt={book.Name} width="100px" />
                </a>
              </div>
              <div className="details_big_box">
                <div className="product_title_big">{book.Name}</div>
                <div className="specifications">
                  Автор: <span className="blue">{book.Author}</span>
                  <br />
                  Книжарница: <span className="blue">{book.BookStore}</span>
                  <br />
                  Град: <span className="blue">{book.City}</span>
                  <br />
                  Адрес: <span className="blue">{book.Address}</span>
                </div>
                <div className="prod_price_big">
                  Цена: <span className="reduce">{convertPrice(book.OldPrice)}</span>
                  <span className="price">{convertPrice(book.Price)}</span>
                </div>
                <a href="#" onClick={(e) => handleBookClick(e, book.ID)}>Подробности</a>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PublisherContent;
