import React, { useState, useEffect } from "react";
import "./App.css";

function App() {

    const [searchTerm, setSearchTerm] = useState("");
    const [movie, setMovie] = useState(null);
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [mostWatched, setMostWatched] = useState([]);
    const [bestRated, setBestRated] = useState([]);
    const [movies, setMovies] = useState([]);
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        // Load Movie Dataset 
        fetch("/movies.csv")
            .then((response) => response.text())
            .then((data) => {
            const parsedMovies = data
                .split("\n")
                .map((line) => {
                const parts = line.split(",");
                if (parts.length === 3) {
                    const [id, title, genres] = parts;
                    return { id, title, genres };
                }
                return null;
                })
                .filter((movie) => movie !== null);
            setMovies(parsedMovies);
            })
            .catch((error) => console.error("Error loading the movie data:", error));

        // get Most Watched movies from backend (Database)
        const fetchMostWatched = async () => {
            const response = await fetch("/popular");
            const data = await response.json();
            const moviePromises = data.movies.map(async (movie) => {
            const imageUrl = await getImageFromTMDB(movie.title);
            return { ...movie, URL: imageUrl };
            });

            const movieCounter = await Promise.all(moviePromises);
            setMostWatched(movieCounter);
        };

        // get Best Rated Movies from Backend (Database)
        const fetchBestRated = async () => {
            const response = await fetch("/avgrating");
            const data = await response.json();
            const moviePromises = data.prediction.map(async (movie) => {
            const imageUrl = await getImageFromTMDB(movie.title);
            return { ...movie, URL: imageUrl };
            });

            const movieCounter = await Promise.all(moviePromises);
            setBestRated(movieCounter);
        };

        fetchMostWatched();
        fetchBestRated();
    }, []);

    // Handle Input for Moviesearch
    const handleSearchTermChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.length > 1) {
            const filteredSuggestions = movies
            .filter((movie) =>
                movie.title.toLowerCase().includes(value.toLowerCase())
            )
            .slice(0, 5); // Limit to 5 suggestions
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    };

    // Method to get Movieimages from TheMovieDB.org
    const getImageFromTMDB = async (movieName) => {
      const cleanedName = movieName.replace(/\s*\(\d{4}\)$/, ""); // Remove the number at the end of the title
      const url = `https://api.themoviedb.org/3/search/movie?query=${cleanedName}`;
      const headers = {
        accept: "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_TMDB_API_KEY}`,
      };

      try {
        const response = await fetch(url, { headers });
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          return `https://image.tmdb.org/t/p/w185${data.results[0].poster_path}`;
        } else {
          return null;
        }
      } catch (error) {
        console.error("Error fetching image from TMDB:", error);
        return null;
      }
    };

    // Autocomplete feature with responsive click
    const selectSuggestion = async (suggestion) => {
        setSearchTerm(suggestion.title);
        setSuggestions([]);
        const imageUrl = await getImageFromTMDB(suggestion.title);
        setMovie({
            title: suggestion.title,
            movieId: suggestion.id,
            genres: suggestion.genres,
            imageUrl: imageUrl || "https://via.placeholder.com/185x278",
        });
    };

    // Method to search for movies 
    const searchMovie = async () => {
        const foundMovie = movies.find((m) =>
            m.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (foundMovie) {
            const imageUrl = await getImageFromTMDB(foundMovie.title);
            setMovie({
            title: foundMovie.title,
            movieId: foundMovie.id,
            genres: foundMovie.genres,
            imageUrl: imageUrl || "https://via.placeholder.com/185x278",
            });
        } else {
            setMovie(null);
        }
    };

    // Send Frontend-data to backend (For Kafka)
    const submitRating = () => {
        console.log(
            "Submitting rating:",
            userRating,
            "for movie:",
            movie ? movie.movieId : "No movie selected"
        );
        fetch("/movies/" + movie.movieId + "/" + userRating);
        setUserRating(0);
        setHoverRating(0);
    };

    // For demonstration ONLY: generate UserContent for 30 Users for the first 200 movies with ratings
    const generateUserContent = () => {
        for (let i = 0; i < 30; i++) {
            fetch("/movies/" + (Math.random()*100000).toFixed(0)%200 + "/" + (Math.random()*10000).toFixed(0)%6) 
        }
    };

    return (
    <div className="container">
        <header>
        <h1>Datawhispers Movierater</h1>
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
                {suggestions.map((suggestion) => (
                <li
                    key={suggestion.id}
                    onClick={() => selectSuggestion(suggestion)}
                >
                    {suggestion.title}
                </li>
                ))}
            </ul>
            <h2>{movie ? movie.title : "No Movie Selected"}</h2>
            <p>{movie ? movie.genres : ""}</p>
            <div className="rating-input">
                <label>Your Rating: </label>
                {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    onClick={() => setUserRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className={`star ${star <= (hoverRating || userRating) ? "active" : ""}`}
                >
                    ★
                </span>
                ))}
            </div>
            <button onClick={() => submitRating()}>Submit Rating</button>
            <p></p>
            <button onClick={() => generateUserContent()}>DEMO Only -- Generate Random UserInputs</button>
            </div>
            <div className="movie-info">
            <img
                src={movie ? movie.imageUrl : "https://via.placeholder.com/185x278"}
                alt={movie ? movie.title : "No movie selected"}
            />
            </div>
        </section>

        <section className="most-watched-section">
            <h2>Most Watched Movies</h2>
            <div className="movie-list">
            {mostWatched.map((movie) => (
                <div key={movie.id} className="movie-item">
                <p className="counter">Views: {movie.count}</p>
                <img
                    src={movie.URL || "https://via.placeholder.com/150x225"}
                    alt={movie.id}
                />
                <p>{movie.title}</p>
                </div>
            ))}
            </div>
        </section>

        <section className="best-rated-section">
            <h2>Best Rated Movies</h2>
            <div className="movie-list">
            {bestRated.map((movie) => (
                <div key={movie.id} className="movie-item">
                <p className="counter">Rating: {movie.score.toFixed(1)}</p>
                <img
                    src={movie.URL || "https://via.placeholder.com/150x225"}
                    alt={movie.id}
                />
                <p>{movie.title}</p>
                </div>
            ))}
            </div>
        </section>
        </main>
    </div>
    );
}

export default App;
