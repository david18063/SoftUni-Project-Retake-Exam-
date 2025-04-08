import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate(); // For redirection

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert("✅ Входът е успешен!");
        localStorage.setItem("loggedUser", JSON.stringify(data.user));
        window.location.href = "/";
      } else {
        alert(`⚠️ Грешка: ${data.message}`);
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert("❌ Възникна грешка. Опитайте отново!");
    }
  };

  return (
    <div className="center_content">
      <div className="center_title_bar">Вход</div>
      <div className="prod_box_big">
        <div className="center_prod_box_big_contact">
          <div className="contact_form">
            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <label htmlFor="email">Имейл:</label>
                <input required type="email" id="email" name="email" value={formData.email} onChange={handleChange} />

                <label htmlFor="password">Парола:</label>
                <input required type="password" id="password" name="password" value={formData.password} onChange={handleChange} />
              </div>

              <div style={{ marginTop: "15px", textAlign: "center" }}>
                <input type="submit" value="Вход" />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
