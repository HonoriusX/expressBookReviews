
const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let usersWithSameName = users.filter((user) => {
        return user.username === username;
    });
    return usersWithSameName.length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validUsers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    return validUsers.length > 0;
}

// User registration endpoint
regd_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Validate required fields
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required for registration" });
    }

    // Check if user already exists
    // 🟢 CHANGED: Replaced `doesExist` with `isValid` (fixes ReferenceError)
    if (isValid(username)) {
        return res.status(409).json({ message: "User already exists!" });
    }

    // Add new user to the list
    users.push({ "username": username, "password": password });
    return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Validate required fields
    if (!username || !password) {
        return res.status(400).json({ message: "Error logging in. Username and password are required" });
    }

    // Verify user credentials
    if (authenticatedUser(username, password)) {
        // Generate JWT token valid for 1 hour
        let accessToken = jwt.sign(
            { data: username },
            'access',
            { expiresIn: 60 * 60 }
        );

        // Store token and username in session
        req.session.authorization = {
            accessToken,
            username
        };
        return res.status(200).json({ message: "User successfully logged in", username: username });
    } else {
        return res.status(401).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const reviewContent = req.body.review;
    const currentUser = req.session.authorization.username;

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found with the given ISBN" });
    }

    // Validate review content
    if (!reviewContent) {
        return res.status(400).json({ message: "Review content is required" });
    }

    // Initialize reviews object if not exists
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    // Add/Update the user's review
    books[isbn].reviews[currentUser] = reviewContent;
    return res.status(200).json({ 
        message: "Review successfully added/updated",
        bookDetails: books[isbn]
    });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const currentUser = req.session.authorization.username;

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found with the given ISBN" });
    }

    // Check if the book has any reviews
    if (!books[isbn].reviews) {
        return res.status(404).json({ message: "No reviews found for this book" });
    }

    // Check if the user has a review for this book
    if (!books[isbn].reviews[currentUser]) {
        return res.status(404).json({ message: "You have not posted a review for this book" });
    }

    // Delete the user's review
    delete books[isbn].reviews[currentUser];
    return res.status(200).json({ 
        message: "Review successfully deleted",
        bookDetails: books[isbn]
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
