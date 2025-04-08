import React, { useEffect, useState } from "react";

const OrdersPageMainContent = () => {
  const [orders, setOrders] = useState([]);
  const [currency, setCurrency] = useState(localStorage.getItem("currency") || "lev");
  const [sortOrder, setSortOrder] = useState("order_asc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:5000/orders");
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
      setOrders([]);
    }
  };

  const convertPrice = (price) => {
    const exchangeRates = { lev: 1, dollar: 0.55, euro: 0.51 };
    const symbols = { lev: "лв.", dollar: "$", euro: "€" };
    return `${(price * (exchangeRates[currency] || 1)).toFixed(2)} ${symbols[currency]}`;
  };

  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = new Date(a.OrderDate);
    const dateB = new Date(b.OrderDate);
    
    switch (sortOrder) {
      case "order_asc": return a.ID - b.ID;
      case "order_desc": return b.ID - a.ID;
      case "date_asc": return dateA - dateB;
      case "date_desc": return dateB - dateA;
      default: return 0;
    }
  });

  const filteredOrders = sortedOrders.filter(order => {
    const orderDate = new Date(order.OrderDate);
    if (startDate && orderDate < new Date(startDate)) return false;
    if (endDate && orderDate > new Date(endDate)) return false;
    return true;
  });

  return (
    <div className="center_content">
      <div className="center_title_bar">📦 Поръчки</div>
      <div className="center_title_bar">
        <form onSubmit={(e) => { e.preventDefault(); fetchOrders(); }}>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="order_asc">Номер на поръчката - възходящо</option>
            <option value="order_desc">Номер на поръчката - низходящо</option>
            <option value="date_asc">Дата на поръчката - възходящо</option>
            <option value="date_desc">Дата на поръчката - низходящо</option>
          </select>
          &nbsp;
          &nbsp;
          <label>От:</label>
          <input type="date" style={{height: 15}} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          &nbsp;
          &nbsp;
          <label>До:</label>
          <input type="date" style={{height: 15}} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </form>
      </div>

      {filteredOrders.length === 0 ? (
        <p>❌ Няма налични поръчки!</p>
      ) : (
        filteredOrders.map((order) => {
          let bookData = [];
          try {
            bookData = JSON.parse(order.Books) || [];
          } catch (error) {
            console.error("❌ Error parsing book data:", error);
          }

          const bookIds = bookData.map((b) => b.bookId).join(", ");
          const totalQuantity = bookData.reduce((sum, b) => sum + (b.quantity || 0), 0);

          return (
            <div key={order.ID} className="prod_box_big">
              <div className="center_prod_box_big">
                <div className="product_img_big">
                  <img src="https://www.freeiconspng.com/thumbs/cart-icon/blue-shopping-cart-icon-29.png" width="120" height="120" alt="Cart Icon" />
                </div>
                <div className="details_big_box">
                  <div className="product_title_big">Поръчка номер: {order.ID}</div>
                  <div className="specifications">
                    Поръчана от: <span className="blue">{order.Name}</span><br />
                    Дата на поръчката: {new Date(order.OrderDate).toLocaleDateString()}<br />
                    Номера на книги: {bookIds} <br />
                    Общо количество книги: {totalQuantity}<br />
                    Цена на поръчката: <span className="price">{convertPrice(order.TotalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default OrdersPageMainContent;
