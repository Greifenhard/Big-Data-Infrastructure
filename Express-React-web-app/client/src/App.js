import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [movie, setMovie] = useState(null)
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [mostWatched, setMostWatched] = useState([])
  const [bestRated, setBestRated] = useState([])

  useEffect(() => {
    fetchMostWatched()
    fetchBestRated()
  }, [])

  const searchMovie = () => {
    console.log("Searching for:", searchTerm)
    setMovie({
      title: "Sample Movie",
      movieId: "12345",
      avgRating: 4.5,
      imageUrl: "https://via.placeholder.com/300x450"
    })
  }

  const submitRating = () => {
    console.log("Submitting rating:", userRating, "for movie:", movie ? movie.movieId : "No movie selected")
    setUserRating(0)
    setHoverRating(0)
  }

  const fetchMostWatched = () => {
    setMostWatched([
      { id: 1, title: "Most Watched 1", imageUrl: "https://via.placeholder.com/150x225" },
      { id: 2, title: "Most Watched 2", imageUrl: "https://via.placeholder.com/150x225" },
      { id: 3, title: "Most Watched 3", imageUrl: "https://via.placeholder.com/150x225" },
      { id: 4, title: "Most Watched 4", imageUrl: "https://via.placeholder.com/150x225" },
      { id: 5, title: "Most Watched 5", imageUrl: "https://via.placeholder.com/150x225" }
    ])
  }

  const fetchBestRated = () => {
    setBestRated([
      { id: 1, title: "Best Rated 1", imageUrl: "https://via.placeholder.com/150x225" },
      { id: 2, title: "Best Rated 2", imageUrl: "https://via.placeholder.com/150x225" },
      { id: 3, title: "Best Rated 3", imageUrl: "https://via.placeholder.com/150x225" },
      { id: 4, title: "Best Rated 4", imageUrl: "https://via.placeholder.com/150x225" },
      { id: 5, title: "Best Rated 5", imageUrl: "https://via.placeholder.com/150x225" }
    ])
  }

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
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="Search for a movie"
            />
            <button onClick={searchMovie}>Search</button>
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
            <button onClick={submitRating}>Submit Rating</button>
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
                <img src={movie.imageUrl} alt={movie.title} />
                <p>{movie.title}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="best-rated-section">
          <h2>Best Rated Movies</h2>
          <div className="movie-list">
            {bestRated.map(movie => (
              <div key={movie.id} className="movie-item">
                <img src={movie.imageUrl} alt={movie.title} />
                <p>{movie.title}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App