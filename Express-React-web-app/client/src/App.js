import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [movie, setMovie] = useState(null)
  const [userRating, setUserRating] = useState('')
  const [mostWatched, setMostWatched] = useState([])
  const [bestRated, setBestRated] = useState([])

  useEffect(() => {
    // Fetch most watched and best rated movies on component mount
    fetchMostWatched()
    fetchBestRated()
  }, [])

  const searchMovie = () => {
    // Placeholder for API call to search movie
    console.log("Searching for:", searchTerm)
    // Simulating API response
    setMovie({
      title: "Sample Movie",
      movieId: "12345",
      avgRating: 4.5,
      imageUrl: "https://via.placeholder.com/300x450"
    })
  }

  const submitRating = () => {
    // Placeholder for API call to submit rating
    console.log("Submitting rating:", userRating, "for movie:", movie.movieId)
  }

  const fetchMostWatched = () => {
    // Placeholder for API call to fetch most watched movies
    setMostWatched([
      { id: 1, title: "Most Watched 1", imageUrl: "https://via.placeholder.com/150x225" },
      { id: 2, title: "Most Watched 2", imageUrl: "https://via.placeholder.com/150x225" },
      { id: 3, title: "Most Watched 3", imageUrl: "https://via.placeholder.com/150x225" },
      { id: 4, title: "Most Watched 4", imageUrl: "https://via.placeholder.com/150x225" },
      { id: 5, title: "Most Watched 5", imageUrl: "https://via.placeholder.com/150x225" }
    ])
  }

  const fetchBestRated = () => {
    // Placeholder for API call to fetch best rated movies
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
        <h1>Movie Search and Rating</h1>
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
            {movie && (
              <div className="movie-info">
                <h2>{movie.title}</h2>
                <p>Movie ID: {movie.movieId}</p>
                <p>Average Rating: {movie.avgRating}</p>
                <input 
                  type="number" 
                  min="1" 
                  max="5" 
                  value={userRating} 
                  onChange={(e) => setUserRating(e.target.value)} 
                  placeholder="Your rating (1-5)"
                />
                <button onClick={submitRating}>Submit Rating</button>
              </div>
            )}
          </div>
          <div className="image-column">
            {movie && <img src={movie.imageUrl} alt={movie.title} />}
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