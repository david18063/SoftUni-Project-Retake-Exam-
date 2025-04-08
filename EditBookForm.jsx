import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EditBookForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    publisher: "",
    imageUrl: "",
    description: "",
    oldPrice: "",
    price: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/books/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setFormData({
          title: data.Name || "",
          author: data.Author || "",
          category: data.Category || "",
          publisher: data.Publisher || "",
          imageUrl: data.ImagePath || "",
          description: data.Description || "",
          oldPrice: data.OldPrice || "",
          price: data.Price || "",
        });
      })
      .catch((error) => console.error("❌ Error fetching book data:", error));
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch(`http://localhost:5000/books/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP Error! Status: ${response.status}`);
      }
  
      alert("✅ Книгата е успешно редактирана!");
  
      // ✅ Navigate back to the book details page after successful edit
      navigate(`/book/${id}`);
    } catch (error) {
      console.error("❌ Error updating book:", error);
      alert("❌ Неуспешна редакция на книгата! " + error.message);
    }
  };  

  return (
    <div className="center_content">
      <div className="center_title_bar">Редактиране на книга</div>
      <div className="container">
        <div className="card p-4 shadow">
          <div className="card-body">
            <form className="form" onSubmit={handleSubmit}>
              {/* Image Preview */}
              <div className="text-center mb-4">
                {formData.imageUrl ? (
                  <img src={formData.imageUrl} alt="Book" width="120px" height="180px" className="rounded shadow-sm" />
                ) : (
                  <p className="text-muted">Няма налично изображение</p>
                )}
              </div>

              {/* Title and Author */}
              <div className="row mb-4">
                <div className="col">
                  <label className="form-label fw-bold">Заглавие</label>
                  <input className="form-control" type="text" name="title" value={formData.title} onChange={handleChange} required />
                </div>

                <div className="col">
                  <label className="form-label fw-bold">Автор</label>
                  <input className="form-control" type="text" name="author" value={formData.author} onChange={handleChange} required />
                </div>
              </div>

              {/* Category and Publisher */}
              <div className="row mb-4">
                <div className="col">
                  <label className="form-label fw-bold">Категория</label>
                  <select className="form-control" name="category" value={formData.category} onChange={handleChange} required>
                    <option value="">-- Изберете категория --</option>
                    <option value="Компютърна литература">Компютърна литература</option>
                    <option value="Бизнес и икономика">Бизнес и икономика</option>
                    <option value="Художествена литература">Художествена литература</option>
                    <option value="Детски книги">Детски книги</option>
                  </select>
                </div>

                <div className="col">
                  <label className="form-label fw-bold">Издателство</label>
                  <select className="form-control" name="publisher" value={formData.publisher} onChange={handleChange} required>
                    <option value="">-- Изберете издателство --</option>
                    <option value="Асеневци">Асеневци</option>
                    <option value="Кръгозор">Кръгозор</option>
                    <option value="Сиела">Сиела</option>
                    <option value="Световна библиотека">Световна библиотека</option>
                  </select>
                </div>
              </div>

              {/* Image URL */}
              <div className="mb-4">
                <label className="form-label fw-bold">URL на изображението</label>
                <input className="form-control" type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="form-label fw-bold">Описание</label>
                <textarea className="form-control" rows="3" name="description" value={formData.description} onChange={handleChange}></textarea>
              </div>

              {/* Price Inputs */}
              <div className="row mb-4">
                <div className="col">
                  <label className="form-label fw-bold">Стара цена (лв.)</label>
                  <input className="form-control" type="number" step="0.01" name="oldPrice" value={formData.oldPrice} onChange={handleChange} required />
                </div>

                <div className="col">
                  <label className="form-label fw-bold">Цена (лв.)</label>
                  <input className="form-control" type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required />
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center mt-4">
                <button className="btn btn-primary px-4 py-2 fw-bold" type="submit" disabled={loading}>
                  {loading ? "Запазване..." : "Запази промените"}
                </button>
                &nbsp;
                &nbsp;
                <button className="btn btn-secondary ms-3 px-4 py-2 fw-bold" type="button" onClick={() => navigate(-1)}>
                  Отказ
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBookForm;
