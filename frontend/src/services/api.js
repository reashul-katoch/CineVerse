import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';

// Create Axios Instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor to unwrap standardized responses
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && response.data.status === 'success' && response.data.data !== undefined) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ----------------------------------------------------
// LOCAL STORAGE-BACKED STATIC MOCK DATABASE
// Used when backend API is unreachable (Offline mode)
// ----------------------------------------------------
const INITIAL_MOVIES = [
  {
    id: 1,
    title: 'Interstellar',
    genre: 'Sci-Fi',
    year: 2014,
    rating: 8.7,
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
    overview: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    reviews: [
      { id: 1, author: 'Aman', comment: 'Visually stunning and emotionally heavy!', rating: 5 },
      { id: 2, author: 'Alice', comment: 'Great sound design and acting.', rating: 4 }
    ]
  },
  {
    id: 2,
    title: 'The Dark Knight',
    genre: 'Action',
    year: 2008,
    rating: 9.0,
    image: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop&q=80',
    overview: 'When the menace known as the Joker wreaks havoc and chaos on Gotham, Batman must accept one of the greatest tests.',
    reviews: [
      { id: 1, author: 'Naitik Pathak', comment: 'Heath Ledger was legendary.', rating: 5 }
    ]
  },
  {
    id: 3,
    title: 'Inception',
    genre: 'Sci-Fi',
    year: 2010,
    rating: 8.8,
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    overview: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.',
    reviews: [
      { id: 1, author: 'Naitik Pathak', comment: 'Masterpiece film!', rating: 5 }
    ]
  },
  {
    id: 4,
    title: 'The Godfather',
    genre: 'Drama',
    year: 1972,
    rating: 9.2,
    image: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80',
    overview: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
    reviews: []
  }
];

const INITIAL_SHOWS = [
  { id: 1, movieId: 3, movieTitle: 'Inception', showDate: '2026-06-12', showTime: '18:00', blockedSeats: 'B-3, B-4, D-5, D-6' },
  { id: 2, movieId: 1, movieTitle: 'Interstellar', showDate: '2026-06-12', showTime: '21:00', blockedSeats: 'A-1, A-2, C-5' }
];

const INITIAL_BOOKINGS = [
  { id: 1, username: 'naitik', movieTitle: 'Inception', seats: 'C-2, C-3', price: 25.0 }
];

const INITIAL_USERS = [
  { id: 1, username: 'naitik@cineverse.com', name: 'Naitik Pathak', role: 'Admin', status: 'Active' },
  { id: 2, username: 'alice@cineverse.com', name: 'Alice Smith', role: 'User', status: 'Active' },
  { id: 3, username: 'manager@cineverse.com', name: 'Theatre Manager', role: 'Theatre Owner', status: 'Active' }
];

const getLocalDb = (key, initial) => {
  const data = localStorage.getItem(`db_${key}`);
  if (!data) {
    localStorage.setItem(`db_${key}`, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
};

const setLocalDb = (key, data) => {
  localStorage.setItem(`db_${key}`, JSON.stringify(data));
};

// ----------------------------------------------------
// AUTH SERVICE APIs
// ----------------------------------------------------
export const authService = {
  login: async (email, password, role) => {
    try {
      const res = await apiClient.post('/auth/login', { 
        email, 
        username: email.split('@')[0], 
        password, 
        role 
      });
      // Add email to result
      return { ...res.data, email, name: res.data.name || email.split('@')[0] };
    } catch (err) {
      console.warn('[API Client] Gateway offline. Falling back to local authentication mockup.');
      const users = getLocalDb('users', INITIAL_USERS);
      const user = users.find(u => u.username === email && u.role === role);
      if (!user) {
        throw new Error('Invalid email or role selection in offline database');
      }
      if (user.status !== 'Active') {
        throw new Error('This account has been suspended by the administrator');
      }
      // Return simulated JWT token containing identity info
      const token = btoa(`${user.name}:${user.role}`);
      return {
        token,
        name: user.name,
        role: user.role,
        email: user.username
      };
    }
  },

  register: async (email, name, password, role) => {
    try {
      const res = await apiClient.post('/auth/register', { 
        name, 
        email,
        username: email.split('@')[0], 
        password, 
        role, 
        status: 'Active' 
      });
      return { ...res.data, email, token: btoa(`${res.data.username || res.data.email}:${res.data.role}`) };
    } catch (err) {
      console.warn('[API Client] Gateway offline. Storing registration in local database.');
      const users = getLocalDb('users', INITIAL_USERS);
      if (users.some(u => u.username === email)) {
        throw new Error('User account already exists');
      }
      const newUser = {
        id: Date.now(),
        username: email,
        name,
        role,
        status: 'Active'
      };
      users.push(newUser);
      setLocalDb('users', users);
      const token = btoa(`${name}:${role}`);
      return {
        token,
        name,
        role,
        email
      };
    }
  },

  validateToken: async (token) => {
    try {
      const res = await apiClient.get(`/auth/validate?token=${encodeURIComponent(token)}`);
      return res.data;
    } catch (e) {
      console.warn('[API Client] Offline mode validation. Decoding local JWT token.');
      try {
        const decoded = atob(token);
        const [name, role] = decoded.split(':');
        if (name && role) {
          return { valid: true, name, role };
        }
      } catch (err) {}
      return { valid: false };
    }
  },

  getUsers: async () => {
    try {
      const res = await apiClient.get('/auth/users');
      return res.data;
    } catch (e) {
      return getLocalDb('users', INITIAL_USERS);
    }
  },

  toggleUserStatus: async (id) => {
    try {
      const res = await apiClient.post(`/auth/users/${id}/toggle`);
      return res.data;
    } catch (e) {
      const users = getLocalDb('users', INITIAL_USERS);
      const userIndex = users.findIndex(u => u.id === id);
      if (userIndex !== -1) {
        users[userIndex].status = users[userIndex].status === 'Active' ? 'Suspended' : 'Active';
        setLocalDb('users', users);
        return users[userIndex];
      }
      throw new Error('User not found in offline db');
    }
  }
};

// ----------------------------------------------------
// MOVIE SERVICE APIs
// ----------------------------------------------------
export const movieService = {
  getMovies: async () => {
    try {
      const res = await apiClient.get('/movies');
      return res.data;
    } catch (err) {
      return getLocalDb('movies', INITIAL_MOVIES);
    }
  },

  addMovie: async (movie) => {
    try {
      const res = await apiClient.post('/movies', movie);
      return res.data;
    } catch (err) {
      const movies = getLocalDb('movies', INITIAL_MOVIES);
      const newMovie = {
        ...movie,
        id: movie.id || Date.now(),
        reviews: []
      };
      movies.push(newMovie);
      setLocalDb('movies', movies);
      return newMovie;
    }
  },

  getShows: async () => {
    try {
      // Endpoint to fetch schedules
      const res = await apiClient.get('/movies/schedules');
      return res.data;
    } catch (err) {
      return getLocalDb('shows', INITIAL_SHOWS);
    }
  },

  addShow: async (show) => {
    try {
      // In the database schemas, we post show schedules
      const res = await apiClient.post('/movies/schedules', show);
      return res.data;
    } catch (err) {
      const shows = getLocalDb('shows', INITIAL_SHOWS);
      const newShow = {
        ...show,
        id: Date.now()
      };
      shows.push(newShow);
      setLocalDb('shows', shows);
      return newShow;
    }
  },

  getBookings: async (username) => {
    try {
      const url = username 
        ? `/movies/bookings?username=${encodeURIComponent(username)}` 
        : `/movies/bookings`;
      const res = await apiClient.get(url);
      return res.data;
    } catch (err) {
      const bookings = getLocalDb('bookings', INITIAL_BOOKINGS);
      if (username) {
        return bookings.filter(b => b.username === username);
      }
      return bookings;
    }
  },

  addBooking: async (booking) => {
    try {
      const res = await apiClient.post('/movies/bookings', booking);
      return res.data;
    } catch (err) {
      const bookings = getLocalDb('bookings', INITIAL_BOOKINGS);
      const newBooking = {
        ...booking,
        id: Date.now()
      };
      bookings.push(newBooking);
      setLocalDb('bookings', bookings);
      return newBooking;
    }
  }
};

// ----------------------------------------------------
// REVIEW SERVICE APIs
// ----------------------------------------------------
export const reviewService = {
  addReview: async (review) => {
    try {
      const res = await apiClient.post('/reviews', review);
      return res.data;
    } catch (err) {
      const movies = getLocalDb('movies', INITIAL_MOVIES);
      const movie = movies.find(m => m.id === review.movieId);
      if (movie) {
        const newRevObj = {
          id: Date.now(),
          author: review.author,
          comment: review.comment,
          rating: review.rating
        };
        if (!movie.reviews) movie.reviews = [];
        movie.reviews.push(newRevObj);
        setLocalDb('movies', movies);
        return newRevObj;
      }
      throw new Error('Movie not found in offline db');
    }
  }
};
