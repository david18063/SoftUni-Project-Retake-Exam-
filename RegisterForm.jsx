import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    middle_name: "",
    email: "",
    password: "",
    address: "",
    city: "",
    telephone: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Регистрацията е успешна!");
        
        // Reset form fields after successful registration
        setFormData({
          first_name: "",
          last_name: "",
          middle_name: "",
          email: "",
          password: "",
          address: "",
          city: "",
          telephone: "",
        });

        // Redirect to the login page
        navigate("/login");
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
      <div className="center_title_bar">Регистрация</div>
      <div className="prod_box_big">
        <div className="center_prod_box_big_contact">
          <div className="contact_form">
            <form onSubmit={handleSubmit}>
              <table>
                <tbody>
                  <tr>
                    <td align="right"><label>Име:</label></td>
                    <td align="left">
                      <input
                        required
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                      />
                    </td>
                    <td align="right"><label>Парола:</label></td>
                    <td align="left">
                      <input
                        required
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td align="right"><label>Презиме:</label></td>
                    <td align="left">
                      <input
                        type="text"
                        name="middle_name"
                        value={formData.middle_name}
                        onChange={handleChange}
                      />
                    </td>
                    <td align="right"><label>Телефон:</label></td>
                    <td align="left">
                      <input
                        required
                        type="tel"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td align="right"><label>Фамилия:</label></td>
                    <td align="left">
                      <input
                        required
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                      />
                    </td>
                    <td align="right"><label>Град:</label></td>
                    <td align="left">
                      <input
                        required
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td align="right"><label>Имейл:</label></td>
                    <td align="left">
                      <input
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </td>
                    <td align="right"><label>Адрес:</label></td>
                    <td align="left">
                      <input
                        required
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              <input className="registration" type="submit" value="Регистрация" />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
