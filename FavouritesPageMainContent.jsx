import React, { useEffect, useState } from "react";

const FavouritesPageMainContent = () => {
  const [favouriteBooks, setFavouriteBooks] = useState([]);
  const [currency, setCurrency] = useState(localStorage.getItem("currency") || "lev");
  const userData = JSON.parse(localStorage.getItem("loggedUser"));
  const userId = userData?.ID;

  // Function to convert the price based on the currency
  const convertPrice = (price) => {
    const exchangeRates = { lev: 1, dollar: 0.55, euro: 0.51 };
    const symbols = { lev: "лв.", dollar: "$", euro: "€" };

    return `${(price * (exchangeRates[currency] || 1)).toFixed(2)} ${symbols[currency]}`;
  };

  // Fetch the favorite books when the component mounts
  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/favourites/${userId}`)
      .then((response) => response.json())
      .then((data) => setFavouriteBooks(data))
      .catch((error) => console.error("❌ Error fetching favourite books:", error));
  }, [userId]);

  // Handle removing a book from favorites
  const handleRemoveFromFavourites = async (bookId) => {
    try {
      const response = await fetch("http://localhost:5000/favourites/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, bookId }),
      });

      if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

      setFavouriteBooks((prevBooks) => prevBooks.filter((book) => book.ID !== bookId));
      alert("✅ Книгата беше премахната от любими!");
    } catch (error) {
      console.error("❌ Error removing book from favourites:", error);
      alert("❌ Грешка при премахването на книгата!");
    }
  };

  // Handle clearing all favourite books
  const handleClearFavourites = async () => {
    try {
      const response = await fetch("http://localhost:5000/favourites/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

      setFavouriteBooks([]);
      alert("✅ Любимите книги бяха изчистени!");
    } catch (error) {
      console.error("❌ Error clearing favourites:", error);
      alert("❌ Грешка при изчистването на любимите книги!");
    }
  };

  if (!userId) {
    return <p>🔒 Моля, влезте в профила си, за да видите любимите си книги!</p>;
  }

  return (
    <div className="center_content">
      <div className="center_title_bar">❤️ Любими Книги</div>

      {favouriteBooks.length === 0 ? (
        <p>❌ Няма добавени книги в любими!</p>
      ) : (
        <form>
          {favouriteBooks.map((book) => (
            <div key={book.ID} className="prod_box_big">
              <div className="top_prod_box_big"></div>
              <div className="center_prod_box_big">
                <div className="product_img_big">
                  <a href={`/book/${book.ID}`}>
                    <img src={book.ImagePath} alt={book.Name} style={{ width: "110px", height: "165px" }} />
                  </a>
                </div>
                <div className="details_big_box">
                  <div className="product_title_big">{book.Name}</div>
                  <div className="specifications">
                    Автор: <span className="blue">{book.Author}</span><br />
                    Издателство: {book.Publisher}<br />
                  </div>
                  <div className="prod_price_big">
                    <span className="reduce">{convertPrice(book.OldPrice)}</span>
                    <span className="price">{convertPrice(book.Price)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFromFavourites(book.ID)}
                    style={{ marginTop: "10px", color: "red", cursor: "pointer" }}
                  >
                    ❌ Премахни от любими
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div className="contact_form2">
            <button
              style={{ marginTop: "10px", marginLeft: "170px" }}
              className="btn btn-light"
              type="button"
              onClick={handleClearFavourites}
            >
              🔄 Изчисти любими
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default FavouritesPageMainContent;
