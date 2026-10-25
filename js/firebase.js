/**
 * The Reading Nook - Firebase Configuration
 * Testing phase setup
 */

// Firebase SDK (using CDN modules in HTML, this is the config + helpers)

const firebaseConfig = {
  apiKey: "AIzaSyABvOe7hJpNFpTxaRpzrADNHYd9Z6fefiQ",
  authDomain: "data-for-development-11b00.firebaseapp.com",
  databaseURL: "https://data-for-development-11b00-default-rtdb.firebaseio.com",
  projectId: "data-for-development-11b00",
  storageBucket: "data-for-development-11b00.firebasestorage.app",
  messagingSenderId: "581148696578",
  appId: "1:581148696578:web:c2519b62cfabd85c59c71b",
  measurementId: "G-2P0FHBCNTY"
};

// These will be set after Firebase is loaded from CDN
let app, analytics, database, auth;

/**
 * Initialize Firebase (call this after the SDK scripts are loaded)
 */
function initFirebase() {
  if (typeof firebase === 'undefined') {
    console.error('Firebase SDK not loaded yet');
    return false;
  }

  app = firebase.initializeApp(firebaseConfig);
  
  try {
    analytics = firebase.analytics();
  } catch (e) {
    console.log('Analytics not available in this environment');
  }

  database = firebase.database();
  auth = firebase.auth();

  console.log('Firebase initialized successfully (Testing phase)');
  return true;
}

/* ========== BOOKS ========== */

/**
 * Get all books from Realtime Database
 * Path: /books
 */
function getBooksFromFirebase() {
  return database.ref('books').once('value')
    .then(snapshot => {
      const data = snapshot.val() || {};
      // Convert object to array
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    });
}

/**
 * Get books by category
 */
function getBooksByCategory(category) {
  return database.ref('books').orderByChild('category').equalTo(category).once('value')
    .then(snapshot => {
      const data = snapshot.val() || {};
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    });
}

/**
 * Add or update a book (for Admin)
 */
function saveBookToFirebase(bookId, bookData) {
  return database.ref('books/' + bookId).set(bookData);
}

/* ========== USER CART (when logged in) ========== */

function saveUserCart(userId, cartItems) {
  return database.ref('users/' + userId + '/cart').set(cartItems);
}

function getUserCart(userId) {
  return database.ref('users/' + userId + '/cart').once('value')
    .then(snapshot => snapshot.val() || []);
}

/* ========== USER WISHLIST ========== */

function saveUserWishlist(userId, wishlistItems) {
  return database.ref('users/' + userId + '/wishlist').set(wishlistItems);
}

function getUserWishlist(userId) {
  return database.ref('users/' + userId + '/wishlist').once('value')
    .then(snapshot => snapshot.val() || []);
}

/* ========== AUTH HELPERS ========== */

function signUp(email, password) {
  return auth.createUserWithEmailAndPassword(email, password);
}

function signIn(email, password) {
  return auth.signInWithEmailAndPassword(email, password);
}

function signOutUser() {
  return auth.signOut();
}

function onAuthChange(callback) {
  return auth.onAuthStateChanged(callback);
}

function getCurrentUser() {
  return auth.currentUser;
}

/* ========== SEED SAMPLE BOOKS (run once for testing) ========== */

function seedSampleBooks() {
  const sampleBooks = {
    'atomic-habits': {
      title: 'Atomic Habits',
      author: 'James Clear',
      price: 499,
      cover: '⚙️',
      category: 'learning',
      description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones',
      tags: ['Self-Help', 'Habits', 'Productivity']
    },
    'the-very-hungry-caterpillar': {
      title: 'The Very Hungry Caterpillar',
      author: 'Eric Carle',
      price: 299,
      cover: '🐛',
      category: 'children',
      ageGroup: '0-3',
      description: 'A classic picture book for the youngest readers.',
      tags: ['Picture Book', 'Ages 0-3']
    },
    'the-silent-patient': {
      title: 'The Silent Patient',
      author: 'Alex Michaelides',
      price: 399,
      cover: '📖',
      category: 'fiction',
      description: 'A psychological thriller that will keep you guessing.',
      tags: ['Thriller', 'Mystery']
    },
    'the-alchemist': {
      title: 'The Alchemist',
      author: 'Paulo Coelho',
      price: 299,
      cover: '🌟',
      category: 'gifts',
      description: 'A fable about following your dream.',
      tags: ['Inspiration', 'Classic']
    },
    'harry-potter-1': {
      title: 'Harry Potter and the Philosopher’s Stone',
      author: 'J.K. Rowling',
      price: 499,
      cover: '⚡',
      category: 'children',
      ageGroup: '8-12',
      description: 'The beginning of the magical journey.',
      tags: ['Fantasy', 'Adventure']
    }
  };

  return database.ref('books').set(sampleBooks)
    .then(() => {
      console.log('Sample books seeded successfully!');
      return true;
    });
}