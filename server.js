import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Get current directory (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Log current directory for debugging
console.log("Current directory:", __dirname);

// Use absolute path for database (located in the 'db' folder)
const dbPath = resolve(__dirname, "db", "database.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("✅ Connected to the SQLite database at", dbPath);
  }
});

app.use(cors());
app.use(bodyParser.json());

// Create users table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS Users (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    FirstName TEXT NOT NULL,
    LastName TEXT NOT NULL,
    MiddleName TEXT,
    Email TEXT UNIQUE NOT NULL,
    Password TEXT NOT NULL,
    Address TEXT,
    City TEXT,
    Telephone TEXT,
    RegisterDate DATE DEFAULT (datetime('now')),
    LastActivity DATETIME DEFAULT (datetime('now')),
    UserType INTEGER DEFAULT 1
  )
`);

// ✅ Register User (Password Not Hashed)
app.post("/register", (req, res) => {
  const { first_name, last_name, middle_name, email, password, address, city, telephone } = req.body;

  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ message: "⚠️ Всички полета са задължителни!" });
  }

  const sql = `
    INSERT INTO Users (FirstName, LastName, MiddleName, Email, Password, Address, City, Telephone) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [first_name, last_name, middle_name || "", email, password, address || "", city || "", telephone || ""], function (err) {
    if (err) {
      if (err.message.includes("UNIQUE constraint failed")) {
        return res.status(400).json({ message: "⚠️ Този имейл вече съществува!" });
      }
      return res.status(500).json({ message: "❌ Грешка в базата данни!", error: err.message });
    }
    res.status(201).json({ message: "✅ Регистрацията е успешна!", userId: this.lastID });
  });
});

// ✅ Login User (Password Not Hashed)
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "⚠️ Всички полета са задължителни!" });
  }

  const sql = `SELECT * FROM Users WHERE Email = ?`;

  db.get(sql, [email], (err, user) => {
    if (err) {
      return res.status(500).json({ message: "❌ Грешка в базата данни!", error: err.message });
    }
    if (!user) {
      return res.status(401).json({ message: "⚠️ Невалиден имейл или парола!" });
    }

    // Compare entered password with the stored one
    if (password !== user.Password) {
      return res.status(401).json({ message: "⚠️ Невалиден имейл или парола!" });
    }

    res.status(200).json({ message: "✅ Входът е успешен!", user });
  });
});

app.get("/books", (req, res) => {
    const sql = "SELECT * FROM Books ORDER BY DateAdded DESC LIMIT 6";
    db.all(sql, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ message: "❌ Грешка в базата данни!", error: err.message });
      }
      res.status(200).json(rows);
    });
});

app.get("/books/:id", (req, res) => {
    const bookId = req.params.id;
    const sql = "SELECT * FROM Books WHERE ID = ?";
    db.get(sql, [bookId], (err, row) => {
      if (err) {
        return res.status(500).json({ message: "❌ Грешка в базата данни!", error: err.message });
      }
      if (!row) {
        return res.status(404).json({ message: "❌ Книгата не е намерена!" });
      }
      res.status(200).json(row);
    });
  });

  app.get('/special-books', (req, res) => {
    const query = `
      SELECT * FROM Books
      ORDER BY (OldPrice - Price) DESC
      LIMIT 5;
    `;
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error("❌ Error fetching special books:", err);
        res.status(500).send('Error fetching data');
        return;
      }
      res.json(rows);
    });
  });

  app.get('/top-visited-books', (req, res) => {
    const query = `
      SELECT * FROM Books
      ORDER BY VisitedCount DESC
      LIMIT 5;
    `;
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error("❌ Error fetching top visited books:", err);
        res.status(500).send('Error fetching data');
        return;
      }
      res.json(rows);
    });
  });

  app.post('/increment-visited-count/:bookId', (req, res) => {
    const { bookId } = req.params;
  
    // Assuming you are using a database like SQLite
    const query = `UPDATE Books SET VisitedCount = VisitedCount + 1 WHERE ID = ?`;
    
    db.run(query, [bookId], function (err) {
      if (err) {
        console.error("Error updating visited count:", err);
        return res.status(500).json({ success: false, message: "Failed to update visited count" });
      }
  
      // Send a success response
      return res.status(200).json({ success: true, message: "Visited count updated" });
    });
  });

  app.get('/search-books', (req, res) => {
    const { q, sort, bookStore, city } = req.query;
    
    // Start constructing the SQL query
    let query = `SELECT * FROM Books WHERE 1=1`;
    const queryParams = [];
  
    if (q) {
      query += ` AND (Name LIKE ? OR Description LIKE ?)`;
      queryParams.push(`%${q}%`, `%${q}%`);
    }
  
    if (bookStore && bookStore !== '1') {
      query += ` AND BookStore = ?`;
      queryParams.push(bookStore);
    }
  
    if (city && city !== '1') {
      query += ` AND City = ?`;
      queryParams.push(city);
    }
  
    if (sort) {
      switch (sort) {
        case 'highest_price':
          query += ` ORDER BY Price DESC`;
          break;
        case 'lowest_price':
          query += ` ORDER BY Price ASC`;
          break;
        case 'newest':
          query += ` ORDER BY DateAdded DESC`;
          break;
        case 'name':
          query += ` ORDER BY Name ASC`;
          break;
        default:
          query += ` ORDER BY DateAdded DESC`;
      }
    }
  
    console.log('Executing query:', query);  // Log the query
    console.log('With parameters:', queryParams);  // Log the parameters
  
    // Execute the query
    db.all(query, queryParams, (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).json({ message: 'Database query error' });
      }
  
      res.json(rows);
    });
});

app.post("/vote", (req, res) => {
    const { userId, bookId, vote } = req.body;
  
    if (!userId || !bookId || !vote || vote < 1 || vote > 5) {
      console.error("Invalid vote data:", req.body); // 🔹 Log invalid request data
      return res.status(400).json({ error: "Invalid vote data" });
    }
  
    db.get(
      "SELECT * FROM Votes WHERE USER_ID = ? AND BOOK_ID = ?",
      [userId, bookId],
      (err, row) => {
        if (err) {
          console.error("Error fetching existing vote:", err.message); // 🔹 Log SQL error
          return res.status(500).json({ error: err.message });
        }
  
        if (row) {
          db.run(
            "UPDATE Votes SET Vote = ? WHERE USER_ID = ? AND BOOK_ID = ?",
            [vote, userId, bookId],
            (err) => {
              if (err) {
                console.error("Error updating vote:", err.message); // 🔹 Log update error
                return res.status(500).json({ error: err.message });
              }
              res.json({ success: true, message: "Vote updated" });
            }
          );
        } else {
          db.run(
            "INSERT INTO Votes (USER_ID, BOOK_ID, Vote) VALUES (?, ?, ?)",
            [userId, bookId, vote],
            (err) => {
              if (err) {
                console.error("Error inserting vote:", err.message); // 🔹 Log insert error
                return res.status(500).json({ error: err.message });
              }
              res.json({ success: true, message: "Vote recorded" });
            }
          );
        }
      }
    );
});

// Server: Get book with highest average vote
app.get("/highest-rated-book", (req, res) => {
    const query = `
      SELECT b.ID, b.Name, b.ImagePath, b.Description, AVG(v.Vote) as AverageVote
      FROM Books b
      LEFT JOIN Votes v ON b.ID = v.BOOK_ID
      GROUP BY b.ID
      ORDER BY AverageVote DESC
      LIMIT 1;
    `;
  
    db.get(query, (err, row) => {
      if (err) {
        console.error("Error fetching highest rated book:", err);
        return res.status(500).json({ error: err.message });
      }
  
      if (!row) {
        return res.status(404).json({ message: "No books found" });
      }
  
      res.json(row); // Send the book with the highest average vote
    });
});

app.post("/add-book", (req, res) => {
    const {
      title,
      author,
      category,
      publisher,
      imageUrl,
      description,
      city,
      address,
      oldPrice,
      price,
    } = req.body;
  
    const query = `
      INSERT INTO Books (Name, Author, Category, Publisher, ImagePath, Description, City, Address, OldPrice, Price) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  
    db.run(
      query,
      [title, author, category, publisher, imageUrl, description, city, address, oldPrice, price],
      function (err) {
        if (err) {
          console.error("Error inserting book:", err.message);
          res.status(500).json({ message: "Failed to add book" });
        } else {
          res.json({ message: "Book added successfully", bookId: this.lastID });
        }
      }
    );
});

app.post("/cart", (req, res) => {
    const { userId, bookId } = req.body;
  
    if (!userId || !bookId) {
      return res.status(400).json({ success: false, message: "❌ Липсва userId или bookId!" });
    }
  
    const sql = "INSERT INTO BooksInCart (USER_ID, BOOK_ID) VALUES (?, ?)";
    db.run(sql, [userId, bookId], function (err) {
      if (err) {
        return res.status(500).json({ success: false, message: "❌ Грешка в базата данни!", error: err.message });
      }
      res.status(200).json({ success: true, message: "✅ Книгата беше добавена в кошницата!" });
    });
});

app.get("/cart/:userId", (req, res) => {
    const userId = req.params.userId;
    const sql = `
      SELECT b.*
      FROM BooksInCart bic
      JOIN Books b ON bic.BOOK_ID = b.ID
      WHERE bic.USER_ID = ?
    `;
    
    db.all(sql, [userId], (err, rows) => {
      if (err) {
        console.error("Error fetching cart items:", err);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      res.json(rows); // Send the full book details for each item in the cart
    });
});

app.post("/cart/remove", (req, res) => {
    const { userId, bookId } = req.body;
  
    const sql = "DELETE FROM BooksInCart WHERE USER_ID = ? AND BOOK_ID = ?";
    db.run(sql, [userId, bookId], function (err) {
      if (err) {
        console.error("Error removing item from cart:", err);
        return res.status(500).json({ error: "Failed to remove item from cart" });
      }
  
      res.status(200).json({ success: true, message: "Book removed from cart" });
    });
});

app.post("/cart/clear", (req, res) => {
    const { userId } = req.body;
  
    const sql = "DELETE FROM BooksInCart WHERE USER_ID = ?";
    db.run(sql, [userId], function (err) {
      if (err) {
        console.error("Error clearing cart:", err);
        return res.status(500).json({ error: "Failed to clear the cart" });
      }
  
      res.status(200).json({ success: true, message: "Cart cleared" });
    });
});

// Add a book to the user's favorites list
app.post("/favourites", (req, res) => {
    const { userId, bookId } = req.body;
  
    if (!userId || !bookId) {
      return res.status(400).json({ success: false, message: "❌ Липсва userId или bookId!" });
    }
  
    const sql = "INSERT INTO BooksInFavourites (USER_ID, BOOK_ID) VALUES (?, ?)";
    db.run(sql, [userId, bookId], function (err) {
      if (err) {
        return res.status(500).json({ success: false, message: "❌ Грешка в базата данни!", error: err.message });
      }
      res.status(200).json({ success: true, message: "✅ Книгата беше добавена в любими!" });
    });
});

// Check if a book is a favorite for the user
app.get("/favourites/check/:userId/:bookId", (req, res) => {
    const { userId, bookId } = req.params;
  
    // SQL query to check if the book is in the user's favorites list
    const sql = `
      SELECT 1 FROM BooksInFavourites 
      WHERE USER_ID = ? AND BOOK_ID = ?
      LIMIT 1
    `;
  
    db.get(sql, [userId, bookId], (err, row) => {
      if (err) {
        console.error("Error checking if book is a favorite:", err);
        return res.status(500).json({ message: "❌ Грешка при проверка за любими" });
      }
  
      // If we find a row, that means the book is a favorite
      if (row) {
        return res.status(200).json({ isFavorite: true });
      } else {
        return res.status(200).json({ isFavorite: false });
      }
    });
});
  
  
  // Get all books in the user's favorites list
  app.get("/favourites/:userId", (req, res) => {
    const userId = req.params.userId;
  
    const sql = `
      SELECT b.*
      FROM BooksInFavourites bif
      JOIN Books b ON bif.BOOK_ID = b.ID
      WHERE bif.USER_ID = ?
    `;
  
    db.all(sql, [userId], (err, rows) => {
      if (err) {
        console.error("Error fetching favorite items:", err);
        return res.status(500).json({ message: "❌ Грешка при зареждане на любими" });
      }
      res.json(rows); // Send the full book details for each favorite item
    });
});
  
  // Remove a book from the user's favorites list
  app.post("/favourites/remove", (req, res) => {
    const { userId, bookId } = req.body;
  
    const sql = "DELETE FROM BooksInFavourites WHERE USER_ID = ? AND BOOK_ID = ?";
    db.run(sql, [userId, bookId], function (err) {
      if (err) {
        console.error("Error removing item from favorites:", err);
        return res.status(500).json({ error: "❌ Грешка при премахване от любими" });
      }
  
      res.status(200).json({ success: true, message: "Книгата беше премахната от любими" });
    });
});
  
  // Clear all books from the user's favorites list
  app.post("/favourites/clear", (req, res) => {
    const { userId } = req.body;
  
    const sql = "DELETE FROM BooksInFavourites WHERE USER_ID = ?";
    db.run(sql, [userId], function (err) {
      if (err) {
        console.error("Error clearing favorites:", err);
        return res.status(500).json({ error: "❌ Грешка при изчистване на любими" });
      }
  
      res.status(200).json({ success: true, message: "Любимите бяха изчистени" });
    });
});

app.post("/order", (req, res) => {
    const { userId, books, totalPrice } = req.body;

    if (!userId || !books || totalPrice === undefined) {
        return res.status(400).json({ error: "❌ Missing required fields!" });
    }

    const booksJSON = JSON.stringify(books);

    db.run(
        `INSERT INTO Orders (UserID, Books, TotalPrice) VALUES (?, ?, ?)`,
        [userId, booksJSON, totalPrice],
        function (err) {
            if (err) {
                return res.status(500).json({ error: "❌ Error placing order!" });
            }
            res.json({ success: true, orderId: this.lastID });
        }
    );
});

app.get("/orders", (req, res) => {
    db.all(
        `SELECT Orders.*, 
                Users.FirstName || ' ' || Users.LastName AS Name 
         FROM Orders 
         JOIN Users ON Orders.UserID = Users.ID`,
        [],
        (err, rows) => {
            if (err) {
                console.error("❌ SQL Error:", err.message);
                return res.status(500).json({ error: `❌ Database query error: ${err.message}` });
            }
            res.json(rows);
        }
    );    
});

app.put("/books/:id", (req, res) => {
    const { id } = req.params;
    const { title, author, category, publisher, imageUrl, description, city, address, oldPrice, price } = req.body;
  
    if (!id || !title || !author) {
      return res.status(400).json({ message: "❌ ID, Title, and Author are required!" });
    }
  
    const query = `
      UPDATE Books 
      SET Name = ?, Author = ?, Category = ?, Publisher = ?, ImagePath = ?, 
          Description = ?, City = ?, Address = ?, OldPrice = ?, Price = ?
      WHERE ID = ?
    `;
  
    db.run(query, [title, author, category, publisher, imageUrl, description, city, address, oldPrice, price, id], function (err) {
      if (err) {
        console.error("❌ Error updating book:", err.message);
        return res.status(500).json({ message: "❌ Database error!", error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: "❌ Book not found!" });
      }
  
      res.json({ message: "✅ Book updated successfully!", bookId: id });
    });
});

app.get("/books/category/:category", (req, res) => {
    const category = req.params.category;
  
    const sql = "SELECT * FROM Books WHERE Category = ?";
    db.all(sql, [category], (err, rows) => {
      if (err) {
        console.error("Error fetching books by category:", err);
        return res.status(500).json({ message: "❌ Грешка при зареждане на книги по категория" });
      }
      res.json(rows);
    });
});

app.get("/books/publisher/:publisher", (req, res) => {
    const publisher = req.params.publisher;
  
    const sql = "SELECT * FROM Books WHERE Publisher = ?";
    db.all(sql, [publisher], (err, rows) => {
      if (err) {
        console.error("Error fetching books by publisher:", err);
        return res.status(500).json({ message: "❌ Грешка при зареждане на книги по издател" });
      }
      res.json(rows);
    });
});

app.post('/api/updateUser', (req, res) => {
    console.log("Received update request:", req.body); // Debugging
  
    const { firstName, middleName, lastName, email, address, telephone, currentPassword, newPassword } = req.body;
  
    if (!email || !currentPassword) {
      return res.status(400).json({ success: false, message: "Имейлът и паролата са задължителни!" });
    }
  
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
      if (err || !user) {
        return res.status(400).json({ success: false, message: "Потребителят не е намерен!" });
      }
  
      if (user.password !== currentPassword) {
        return res.status(400).json({ success: false, message: "Грешна парола!" });
      }
  
      const updateQuery = `UPDATE users SET firstName=?, middleName=?, lastName=?, address=?, telephone=?, password=? WHERE email=?`;
      db.run(updateQuery, [firstName, middleName, lastName, address, telephone, newPassword || user.password, email], function(err) {
        if (err) {
          return res.status(500).json({ success: false, message: "Грешка при обновяване на профила!" });
        }
        res.json({ success: true, message: "Профилът е обновен успешно!" });
      });
    });
});

// Start the server
app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
});
