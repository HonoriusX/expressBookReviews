
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required for registration" });
    }
  
    if (isValid(username)) {
        return res.status(409).json({ message: "User already exists!" });
    }
  
    users.push({ "username": username, "password": password });
    return res.status(200).json({ message: "User successfully registered. Now you can login" });
  });

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
    const isbn = req.params.isbn;
    const targetBook = books[isbn];
    
    if (targetBook) {
        return res.status(200).send(JSON.stringify(targetBook, null, 4));
    } else {
        return res.status(404).json({ message: "Book not found with the given ISBN" });
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
    const targetAuthor = req.params.author.toLowerCase();
    const matchedBooks = [];
    const bookKeys = Object.keys(books);

    // Iterate all books to match the author
    bookKeys.forEach((key) => {
        if (books[key].author.toLowerCase() === targetAuthor) {
            matchedBooks.push(books[key]);
        }
    });

    if (matchedBooks.length > 0) {
        return res.status(200).send(JSON.stringify(matchedBooks, null, 4));
    } else {
        return res.status(404).json({ message: "No books found by the given author" });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
    const targetTitle = req.params.title.toLowerCase();
    const matchedBooks = [];
    const bookKeys = Object.keys(books);

    // Iterate all books to match the title
    bookKeys.forEach((key) => {
        if (books[key].title.toLowerCase() === targetTitle) {
            matchedBooks.push(books[key]);
        }
    });

    if (matchedBooks.length > 0) {
        return res.status(200).send(JSON.stringify(matchedBooks, null, 4));
    } else {
        return res.status(404).json({ message: "No books found with the given title" });
    }
});

const fetchAllBooks = () => {
    return new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject("No books available in the shop");
        }
    });
};

public_users.get('/async/books', async function (req, res) {
    try {
        const allBooks = await fetchAllBooks();
        return res.status(200).send(JSON.stringify(allBooks, null, 4));
    } catch (error) {
        return res.status(404).json({ message: error });
    }
});

const fetchBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        const targetBook = books[isbn];
        if (targetBook) {
            resolve(targetBook);
        } else {
            reject("Book not found with the given ISBN");
        }
    });
};

public_users.get('/async/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        const targetBook = await fetchBookByISBN(isbn);
        return res.status(200).send(JSON.stringify(targetBook, null, 4));
    } catch (error) {
        return res.status(404).json({ message: error });
    }
});

const fetchBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
        const targetAuthor = author.toLowerCase();
        const matchedBooks = [];
        const bookKeys = Object.keys(books);

        bookKeys.forEach((key) => {
            if (books[key].author.toLowerCase() === targetAuthor) {
                matchedBooks.push(books[key]);
            }
        });

        if (matchedBooks.length > 0) {
            resolve(matchedBooks);
        } else {
            reject("No books found by the given author");
        }
    });
};

public_users.get('/async/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const matchedBooks = await fetchBooksByAuthor(author);
        return res.status(200).send(JSON.stringify(matchedBooks, null, 4));
    } catch (error) {
        return res.status(404).json({ message: error });
    }
});

const fetchBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
        const targetTitle = title.toLowerCase();
        const matchedBooks = [];
        const bookKeys = Object.keys(books);

        bookKeys.forEach((key) => {
            if (books[key].title.toLowerCase() === targetTitle) {
                matchedBooks.push(books[key]);
            }
        });

        if (matchedBooks.length > 0) {
            resolve(matchedBooks);
        } else {
            reject("No books found with the given title");
        }
    });
};

public_users.get('/async/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        const matchedBooks = await fetchBooksByTitle(title);
        return res.status(200).send(JSON.stringify(matchedBooks, null, 4));
    } catch (error) {
        return res.status(404).json({ message: error });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const targetBook = books[isbn];
  
  if (targetBook) {
    if (targetBook.reviews && Object.keys(targetBook.reviews).length > 0) {
      return res.status(200).send(JSON.stringify(targetBook.reviews, null, 4));
    } else {
      return res.status(200).json({ message: "No reviews found for this book" });
    }
  } else {
    return res.status(404).json({ message: "Book not found with the given ISBN" });
  }
});

module.exports.general = public_users;
