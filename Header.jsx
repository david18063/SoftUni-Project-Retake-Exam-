import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const [highestRatedBook, setHighestRatedBook] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the highest-rated book from the backend
    fetch("http://localhost:5000/highest-rated-book")
      .then((response) => response.json())
      .then((data) => setHighestRatedBook(data))
      .catch((error) => console.error("Error fetching highest-rated book:", error));
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

  if (!highestRatedBook) {
    return (
      <div id="header">
        <p>⏳ Зареждане на най-високо оценената книга...</p>
      </div>
    );
  }

  return (
    <div id="header">
      <div style={{ marginTop: "-5px" }} id="logo">
        <a href="#">
          <img src={"/images/book_logo.png"} alt="Book Logo" width="150" height="150" />
        </a>
      </div>

      {/* Book Offer */}
      <div className="oferte_content">
        <div className="top_divider">
          <img src="/images/header_divider.png" alt="" width="1" height="164" />
        </div>
        <div className="oferta">
          <div className="oferta_content">
            <img
              onClick={(e) => handleBookClick(e, highestRatedBook.ID)}
              width="90px"
              height="130px"
              src={highestRatedBook.ImagePath}
              alt={highestRatedBook.Name}
              className="oferta_img"
              style={{cursor: "pointer"}}
            />
            <div className="oferta_details">
              <div className="oferta_title">
                {highestRatedBook.Name} &nbsp; &#9733; Оценка: {highestRatedBook.AverageVote.toFixed(1)}
              </div>
              <div className="oferta_text">
                {highestRatedBook.Description}
              </div>
              <Link 
                to="#" 
                onClick={(e) => handleBookClick(e, highestRatedBook.ID)} 
                style={{ color: "red" }}
              >
                Прочети повече
              </Link>
            </div>
          </div>
        </div>
        <div className="top_divider">
          <img src="/images/header_divider.png" alt="" width="1" height="164" />
        </div>
      </div>

      <div style={{ marginTop: "-5px" }} id="logo">
        <a href="#">
          <img src={"/images/book_logo.png"} alt="Book Logo" width="150" height="150" />
        </a>
      </div>
    </div>
  );
};

export default Header;
