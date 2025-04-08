import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const SearchContent = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const [books, setBooks] = useState([]);
  const [sort, setSort] = useState("highest_price");
  const [bookStore, setBookStore] = useState("1");
  const [city, setCity] = useState("1");
  const [currency, setCurrency] = useState(localStorage.getItem("currency") || "lev");
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery) {
      fetchBooks();
    }
  }, [searchQuery, sort, bookStore, city]);

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

  const fetchBooks = async () => {
    const queryParams = new URLSearchParams({
      q: searchQuery, // Use the actual searchQuery from URL
      sort: sort,      // Use the selected sort option
      bookStore: bookStore,  // Use the selected bookStore
      city: city       // Use the selected city
    }).toString();
  
    try {
      console.log('Query Params:', queryParams.toString());

      const response = await fetch(`http://localhost:5000/search-books?${queryParams}`);
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log(data);  // Log the fetched books data
  
      setBooks(data); // Set books to state
    } catch (error) {
      console.error('❌ Грешка при заявката за търсене:', error);
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
  
  // 🔹 Handle Form Submit to Apply Filters
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page reload
    console.log("Applying filters:", { searchQuery, sort, bookStore, city }); // Debug log
    fetchBooks(); // Fetch books with selected filters
  };
  

  return (
    <div className="center_content">
      <div className="center_title_bar">
        {searchQuery ? `Резултати за: "${searchQuery}"` : "Моля, въведете дума за търсене"}
      </div>

      {/* 🔹 Filtering Form */}
      <div className="center_title_bar">
        <form onSubmit={handleSubmit}>
          Сортирай:
          &nbsp;
          <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="highest_price">Цена - най-висока</option>
            <option value="lowest_price">Цена - най-ниска</option>
            <option value="newest">Най - нови</option>
            <option value="name">Име</option>
          </select>
          &nbsp;
          Книжарница:
          &nbsp;
          <select id="book_store" value={bookStore} onChange={(e) => setBookStore(e.target.value)}>
            <option value="1">Всички</option>
            <option value="Хеликон">Хеликон</option>
            <option value="Ориндж">Ориндж</option>
            <option value="Сиела">Сиела</option>
          </select>
          &nbsp;
          Град:
          &nbsp;
          <select id="city" value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="1">Всички</option>
            <option value="София">София</option>
            <option value="Пловдив">Пловдив</option>
            <option value="Русе">Русе</option>
            <option value="Варна">Варна</option>
            <option value="Бургас">Бургас</option>
            <option value="Плевен">Плевен</option>
            <option value="Благоевград">Благоевград</option>
          </select>
        </form>
      </div>

      {/* 🔹 Book Results */}
      {books.length === 0 ? (
        <p style={{ textAlign: "center", marginTop: "20px" }}>❌ Няма намерени резултати.</p>
      ) : (
        <div>
          {books.map((book) => (
            <div className="prod_box_big" key={book.ID}>
              <div className="top_prod_box_big"></div>
              <div className="center_prod_box_big_search">
                <div className="product_img_big">
                  <a href="#">
                    <img src={book.ImagePath} alt={book.Name} width={"100px"} border="0" />
                  </a>
                </div>
                <div className="details_big_box">
                  <div className="product_title_big">{book.Name}</div>
                  <div className="specifications">
                    Автор: <span className="blue">{book.Author}</span>
                    <br />
                    Издателство: <span className="blue">{book.Publisher}</span>
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
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchContent;
