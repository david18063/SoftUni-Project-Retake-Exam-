import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const TopBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

  const handleSearch = (event) => {
    event.preventDefault();

    if (!loggedUser) {
      alert("🔒 Трябва да сте влезли в системата, за да търсите книги!");
      return;
    }

    if (!searchQuery.trim()) {
      alert("❗ Моля, въведете дума за търсене.");
      return;
    }

    // Redirect to the search page with the query parameter
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="top_bar">
      <div className="top_search">
        <div className="search_text">Търсене на книга</div>
        <input
          type="text"
          className="search_input"
          name="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={!loggedUser}
        />
        &nbsp; &nbsp;
        <input
          style={{
            marginTop: "7px",
            background: "none",
            color: "inherit",
            border: "none",
            padding: "0",
            font: "inherit",
            cursor: "pointer",
            outline: "inherit",
          }}
          type="submit"
          value="Търси"
          onClick={handleSearch}
          disabled={!loggedUser}
        />
      </div>
    </div>
  );
};

export default TopBar;
