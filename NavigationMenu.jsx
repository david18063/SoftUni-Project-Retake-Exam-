import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const NavigationMenu = () => {
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
  const isLoggedIn = !!loggedUser;
  const userType = loggedUser ? loggedUser.UserType : null;

  // Load currency from localStorage or default to "lev"
  const [currency, setCurrency] = useState(localStorage.getItem("currency") || "lev");

  // Update currency in both state & localStorage
  const changeCurrency = (event) => {
    const newCurrency = event.target.value;
    setCurrency(newCurrency);
    localStorage.setItem("currency", newCurrency);
    window.location.reload(); // Reload to apply changes across the app
  };

  return (
    <div id="menu_tab">
      <ul className="menu">
        {!isLoggedIn ? (
          <>
            <li><Link to="/" className="nav1">Начало</Link></li>
            <li className="divider"></li>
            <li><Link to="/login" className="nav4">Вход</Link></li>
            <li className="divider"></li>
            <li><Link to="/register" className="nav4">Регистрация</Link></li>
          </>
        ) : (
          <>
            <li><Link to="/" className="nav1">Начало</Link></li>

            {userType === 1 && (
              <>
                <li className="divider"></li>
                <li><Link to="/addbook" className="nav2">Добави книга</Link></li>
                <li className="divider"></li>
                <li><Link to="/orderslist" className="nav5">Поръчки</Link></li>
              </>
            )}

            <li className="divider"></li>
            <li><Link to="/cart" className="nav5">Кошница</Link></li>
            <li className="divider"></li>
            <li><Link to="/favourites" className="nav3">Любими</Link></li>

            <li className="divider"></li>
            <li>
              <a href="#" className="nav6" onClick={() => handleLogout()}>Изход</a>
            </li>
            <li className="divider"></li>
            <li style={{ marginLeft: '10px' }}>
              Валута
              <select id="currency" value={currency} onChange={changeCurrency}>
                <option value="lev">Лев</option>
                <option value="dollar">Долар</option>
                <option value="euro">Евро</option>
              </select>
            </li>
          </>
        )}
      </ul>
    </div>
  );

  function handleLogout() {
    localStorage.removeItem("loggedUser");
    window.location.href = "/login";
  }
};

export default NavigationMenu;
