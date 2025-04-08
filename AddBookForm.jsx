import React, { useState } from "react";

const AddBookForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    publisher: "",
    imageUrl: "",
    description: "",
    city: "",
    address: "",
    oldPrice: "",
    price: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch("http://localhost:5000/add-book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
      if (response.ok) {
        alert("✅ Книгата е добавена успешно!");
        setFormData({
          title: "",
          author: "",
          category: "",
          publisher: "",
          imageUrl: "",
          description: "",
          city: "",
          address: "",
          oldPrice: "",
          price: "",
        });
      } else {
        alert("❌ Грешка: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Възникна грешка при добавянето на книгата.");
    }
  };

  return (
    <div className="center_content">
      <div className="center_title_bar">📚 Добавяне на книга</div>
      <div className="container">
        <div className="row flex-lg-nowrap">
          <div className="col">
            <div className="card">
              <div className="card-body">
                <div className="e-profile">
                  <div className="row">
                    <div className="mx-auto" style={{ width: "140px" }}>
                      <div
                        className="d-flex justify-content-center align-items-center rounded"
                        style={{ height: "140px" }}
                      >
                        <img
                          width="150px"
                          height="150px"
                          src="https://images.freeimages.com/fic/images/icons/2799/flat_icons/256/book_add.png"
                          alt="Add Book Image"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="tab-content pt-3">
                    <div className="tab-pane active">
                      <form className="form" onSubmit={handleSubmit}>
                        {/* Title and Author */}
                        <div className="row">
                          <div className="col mb-3">
                            <div className="form-group">
                              <label>Заглавие</label>
                              <input
                                className="form-control"
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                              />
                            </div>
                          </div>

                          <div className="col mb-3">
                            <div className="form-group">
                              <label>Автор</label>
                              <input
                                className="form-control"
                                type="text"
                                name="author"
                                value={formData.author}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Category and Publisher */}
                        <div className="row">
                          <div className="col mb-3">
                            <div className="form-group">
                              <label>Категория</label>
                              <select
                                className="form-control"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                              >
                                <option value="">-- Изберете категория --</option>
                                <option value="Компютърна литература">
                                  Компютърна литература
                                </option>
                                <option value="Бизнес и икономика">
                                  Бизнес и икономика
                                </option>
                                <option value="Художествена литература">
                                  Художествена литература
                                </option>
                                <option value="Детски книги">Детски книги</option>
                              </select>
                            </div>
                          </div>

                          <div className="col mb-3">
                            <div className="form-group">
                              <label>Издателство</label>
                              <select
                                className="form-control"
                                name="publisher"
                                value={formData.publisher}
                                onChange={handleChange}
                              >
                                <option value="">-- Изберете издателство --</option>
                                <option value="Асеневци">Асеневци</option>
                                <option value="Кръгозор">Кръгозор</option>
                                <option value="Сиела">Сиела</option>
                                <option value="Световна библиотека">
                                  Световна библиотека
                                </option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Image URL */}
                        <div className="row">
                          <div className="col mb-3">
                            <div className="form-group">
                              <label>URL на изображението</label>
                                <textarea
                                    className="form-control"
                                    rows={1}
                                    type="text"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                />
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="row">
                          <div className="col mb-3">
                            <div className="form-group">
                              <label>Описание</label>
                              <textarea
                                style={{ width: "95% !important;" }}
                                rows={3}
                                className="form-control"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                              ></textarea>
                            </div>
                          </div>
                        </div>

                        {/* City and Address */}
                        <div className="row">
                          <div className="col mb-3">
                            <div className="form-group">
                              <label>Град</label>
                              <input
                                className="form-control"
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                              />
                            </div>
                          </div>

                          <div className="col mb-3">
                            <div className="form-group">
                              <label>Адрес</label>
                              <input
                                className="form-control"
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Old Price and Price */}
                        <div className="row">
                          <div className="col mb-3">
                            <div className="form-group">
                              <label>Стара цена (лв.)</label>
                              <input
                                className="form-control"
                                type="text"
                                name="oldPrice"
                                value={formData.oldPrice}
                                onChange={handleChange}
                              />
                            </div>
                          </div>

                          <div className="col mb-3">
                            <div className="form-group">
                              <label>Цена (лв.)</label>
                              <input
                                className="form-control"
                                type="text"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="text-center">
                          <button className="btn btn-light" type="submit">
                            Добавяне
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBookForm;
