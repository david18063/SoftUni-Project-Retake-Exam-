import React, { useEffect, useState } from "react";

const CartPageMainContent = () => {
  const [cartItems, setCartItems] = useState([]);
  const [currency, setCurrency] = useState(localStorage.getItem("currency") || "lev");
  const userData = JSON.parse(localStorage.getItem("loggedUser"));
  const userId = userData?.ID;

  // Function to convert the price based on the currency
  const convertPrice = (price) => {
    const exchangeRates = { lev: 1, dollar: 0.55, euro: 0.51 };
    const symbols = { lev: "лв.", dollar: "$", euro: "€" };

    return `${(price * (exchangeRates[currency] || 1)).toFixed(2)} ${symbols[currency]}`;
  };

  // Fetch the cart items when the component mounts
  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/cart/${userId}`)
      .then((response) => response.json())
      .then((data) =>
        setCartItems(
          data.map((item) => ({ ...item, Quantity: 1, Price: item.Price, OldPrice: item.OldPrice }))
        )
      )
      .catch((error) => console.error("❌ Error fetching cart items:", error));
  }, [userId]);

  // Handle removing an item from the cart
  const handleRemoveFromCart = async (bookId) => {
    try {
      const response = await fetch("http://localhost:5000/cart/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, bookId }),
      });

      if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

      setCartItems((prevItems) => prevItems.filter((item) => item.ID !== bookId));
      alert("✅ Книгата беше премахната от кошницата!");
    } catch (error) {
      console.error("❌ Error removing item from cart:", error);
      alert("❌ Грешка при премахването на книгата!");
    }
  };

  // Handle quantity change for each item
  const handleQuantityChange = (bookId, quantity) => {
    if (quantity < 1) return; // Prevent negative or zero quantities

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.ID === bookId
          ? {
              ...item,
              Quantity: quantity,
              Price: (item.Price / item.Quantity) * quantity, // Recalculate Price
              OldPrice: (item.OldPrice / item.Quantity) * quantity, // Recalculate Old Price
            }
          : item
      )
    );
  };

  const handleOrder = async () => {
    if (cartItems.length === 0) {
      alert("❌ Няма книги в кошницата!");
      return;
    }
  
    const booksData = cartItems.map((book) => ({
      bookId: book.ID,
      quantity: book.Quantity,
    }));
  
    try {
      const response = await fetch("http://localhost:5000/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          books: booksData,
          totalPrice: calculateTotal(),
        }),
      });
  
      const data = await response.json();
      if (data.success) {
        alert(`✅ Поръчката беше успешна! Номер на поръчката: ${data.orderId}`);
        setCartItems([]); // Clear the cart
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("❌ Error placing order:", error);
      alert("❌ Грешка при поръчката!");
    }
  };  

  // Handle clearing the cart
  const handleClearCart = async () => {
    try {
      const response = await fetch("http://localhost:5000/cart/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

      setCartItems([]);
      alert("✅ Кошницата беше изчистена!");
    } catch (error) {
      console.error("❌ Error clearing the cart:", error);
      alert("❌ Грешка при изчистването на кошницата!");
    }
  };

  // Calculate the total price of all the items in the cart
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.Price, 0);
  };

  if (!userId) {
    return <p>🔒 Моля, влезте в профила си, за да видите кошницата!</p>;
  }

  return (
    <div className="center_content">
      <div className="center_title_bar">🛒 Кошница</div>

      {cartItems.length === 0 ? (
        <p>❌ Няма добавени книги в кошницата!</p>
      ) : (
        <form>
          {cartItems.map((book) => (
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
                    Количество:
                    <input
                      style={{ width: "40px" }}
                      type="number"
                      name="quantity"
                      value={book.Quantity}
                      min="1"
                      onChange={(e) => handleQuantityChange(book.ID, parseInt(e.target.value))}
                    />
                  </div>
                  <div className="prod_price_big">
                    <span className="reduce">{convertPrice(book.OldPrice)}</span>
                    <span className="price">{convertPrice(book.Price)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFromCart(book.ID)}
                    style={{ marginTop: "10px", color: "red", cursor: "pointer" }}
                  >
                    ❌ Премахни
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div className="total_price">
            <p>
              <strong>Обща сума: {convertPrice(calculateTotal())}</strong>
            </p>
          </div>
          <div className="contact_form2">
            <button
            style={{ marginTop: "10px", marginLeft: "170px" }}
            className="btn btn-light"
            type="button"
            onClick={handleOrder}
            >
            ✅ Поръчай
            </button>
            <button
              style={{ marginTop: "10px", marginLeft: "20px" }}
              className="btn btn-light"
              type="button"
              onClick={handleClearCart}
            >
              🔄 Изчисти
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CartPageMainContent;
