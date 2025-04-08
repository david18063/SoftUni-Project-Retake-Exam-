import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

const RightContent = () => {
  const [topBooks, setTopBooks] = useState([]);
  const [currency, setCurrency] = useState(localStorage.getItem("currency") || "lev"); // Default to lev
  const navigate = useNavigate(); // Initialize navigate hook

  // Fetch the top 5 most visited books
  useEffect(() => {
    fetch('http://localhost:5000/top-visited-books')
      .then((response) => response.json())
      .then((data) => setTopBooks(data))
      .catch((error) => console.error('❌ Error fetching top visited books:', error));
  }, []);

  // Handle currency change
  const handleCurrencyChange = (event) => {
    const selectedCurrency = event.target.value;
    setCurrency(selectedCurrency);
    localStorage.setItem("currency", selectedCurrency); // Save selected currency in localStorage
  };

  const handlePublisherClick = (publisher) => {
    navigate(`/publisher?name=${encodeURIComponent(publisher)}`);
  };

  // Handle book click
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

  // Function to convert price based on selected currency
  const convertPrice = (price) => {
    const exchangeRates = {
      lev: 1,
      dollar: 0.55, // 1 лв = $0.55
      euro: 0.51, // 1 лв = €0.51
    };
    const symbols = {
      lev: "лв.",
      dollar: "$",
      euro: "€",
    };

    const convertedPrice = (price * exchangeRates[currency]).toFixed(2);
    return `${convertedPrice} ${symbols[currency]}`;
  };

  return (
    <div className="right_content">
      {/* Top Visited Books Section */}
      <div className="title_box">Популярни</div>
      <div className="border_box">
        {topBooks.length > 0 ? (
          <Swiper
            modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
            spaceBetween={50}
            slidesPerView={1}
            autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            navigation
            pagination={{ clickable: true }}
          >
            {topBooks.map((book) => (
              <SwiperSlide key={book.ID}>
                <div>
                  <div className="product_title" style={{ marginTop: "10px" }}>
                    <a href="#" onClick={(e) => handleBookClick(e, book.ID)}>{book.Name}</a>
                  </div>

                  <div className="product_img">
                    <a href="#" onClick={(e) => handleBookClick(e, book.ID)}>
                      <img
                        src={book.ImagePath}
                        alt={book.Name}
                      />
                    </a>
                  </div>

                  <div className="prod_price">
                    <span className="reduce">{convertPrice(book.OldPrice)}</span>&nbsp;
                    <span className="price">{convertPrice(book.Price)}</span>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div>Няма популярни книги в момента.</div>
        )}
      </div>

      {/* Publishers Section */}
      <div className="title_box">Издателства</div>
      <ul className="left_menu">
        <li className="odd"><a href="#" onClick={() => handlePublisherClick("Асеневци")}>Асеневци</a></li>
        <li className="even"><a href="#" onClick={() => handlePublisherClick("Кръгозор")}>Кръгозор</a></li>
        <li className="odd"><a href="#" onClick={() => handlePublisherClick("Сиела")}>Сиела</a></li>
        <li className="even"><a href="#" onClick={() => handlePublisherClick("Световна библиотека")}>Световна библиотека</a></li>
      </ul>
    </div>
  );
};

export default RightContent;
