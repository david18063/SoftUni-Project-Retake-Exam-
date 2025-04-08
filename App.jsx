import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import './style.css';
import './swiperStyles.css';

// Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

// Pages
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import BookDetailsPage from "./BookDetailsPage";
import SearchPage from "./SearchPage";
import AddBookPage from "./AddBookPage";
import CartPage from "./CartPage";
import OrdersPage from "./OrdersPage";
import EditBookPage from "./EditBookPage";
import FavouritesPage from "./FavouritesPage";
import CategoryPage from "./CategoryPage";
import PublisherPage from "./PublisherPage";

// Route guard
import ProtectedRoute from "./ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/book/:id" element={<BookDetailsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/category" element={<CategoryPage />} />
        <Route path="/publisher" element={<PublisherPage />} />
        
        {/* Protected routes */}
        <Route
          path="/addbook"
          element={
            <ProtectedRoute>
              <AddBookPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editbook/:id"
          element={
            <ProtectedRoute>
              <EditBookPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favourites"
          element={
            <ProtectedRoute>
              <FavouritesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orderslist"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
