import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [movie, setMovie] = useState(null);
  const [userRating, setUserRating] = useState(1);
  const [hoverRating, setHoverRating] = useState(1);
  const [mostWatched, setMostWatched] = useState([]);
  const [bestRated, setBestRated] = useState([]);
  const [movies, setMovies] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    fetch('/movies.dat')
      .then(response => response.text())
      .then(data => {
        const parsedMovies = data.split('\n').map(line => {
          const parts = line.split('::');
          if (parts.length === 3) {
            const [id, title, genres] = parts;
            return { id, title, genres };
          }
          return null;
        }).filter(movie => movie !== null);
        setMovies(parsedMovies);
      })
      .catch(error => console.error('Error loading the movie data:', error));

    fetchMostWatched();
    fetchBestRated();
  }, []);

  const handleSearchTermChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 1) {
      const filteredSuggestions = movies.filter(movie =>
        movie.title.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5)
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (suggestion) => {
    setSearchTerm(suggestion.title);
    setSuggestions([]);
    setMovie({
      title: suggestion.title,
      movieId: suggestion.id,
      avgRating: 4.5, // Placeholder rating, update this if you have actual rating data
      imageUrl: "https://via.placeholder.com/300x450"
    });
  };

  const searchMovie = () => {
    const foundMovie = movies.find(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));
    if (foundMovie) {
      setMovie({
        title: foundMovie.title,
        movieId: foundMovie.id,
        avgRating: 4.5, // Placeholder rating, update this if you have actual rating data
        imageUrl: "https://via.placeholder.com/300x450"
      });
    } else {
      setMovie(null);
    }
  };

  const submitRating = () => {
    console.log("Submitting rating:", userRating, "for movie:", movie ? movie.movieId : "No movie selected");
    fetch("/movies/" + movie.movieId + "/" + userRating);
    setUserRating(1);
    setHoverRating(1);
  };

  const fetchMostWatched = () => {
    fetch('/popular')
      .then(response => response.json())
      .then(data => {
        setMostWatched(data.movies);
      });
  };

  const fetchBestRated = () => {
    fetch('/prediction')
      .then(response => response.json())
      .then(data => {
        setBestRated(data.prediction);
      });
  };

  return (
    <div className="container">
      <header>
        <h1>Movie Recommender System</h1>
      </header>
      <main>
        <section className="search-section">
          <div className="search-column">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchTermChange}
              placeholder="Search for a movie"
            />
            <button onClick={() => searchMovie()}>Search</button>
            <ul className="suggestions-list">
              {suggestions.map(suggestion => (
                <li key={suggestion.id} onClick={() => selectSuggestion(suggestion)}>
                  {suggestion.title}
                </li>
              ))}
            </ul>
            <h2>{movie ? movie.title : "No Movie Selected"}</h2>
            <div className="rating-input">
              <label>Your Rating: </label>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setUserRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className={`star ${star <= (hoverRating || userRating) ? 'active' : ''}`}
                >
                  ★
                </span>
              ))}
            </div>
            <button onClick={() => submitRating()}>Submit Rating</button>
          </div>
          <div className="movie-info">
            <img src={movie ? movie.imageUrl : "https://via.placeholder.com/300x450"} alt={movie ? movie.title : "No movie selected"} />
            {movie && (
              <>
                <p>Movie ID: {movie.movieId}</p>
                <p>Average Rating: {movie.avgRating}</p>
              </>
            )}
          </div>
        </section>

        <section className="most-watched-section">
          <h2>Most Watched Movies</h2>
          <div className="movie-list">
            {mostWatched.map(movie => (
              <div key={movie.id} className="movie-item">
                <img src={"https://via.placeholder.com/150x225"} alt={movie.id} />
                <p>{movie.count}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="best-rated-section">
          <h2>Best Rated Movies</h2>
          <div className="movie-list">
            {bestRated.map(movie => (
              <div key={movie.id} className="movie-item">
                <img src={"https://via.placeholder.com/150x225"} alt={movie.id} />
                <p>{movie.user}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
