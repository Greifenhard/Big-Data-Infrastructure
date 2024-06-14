import React, { useEffect, useState } from 'react'

const CountMovieIds = 20

function App() {

  const [backendData, setBackendData] = useState([{}])
  const [missionId, setMissionId] = useState([{}])

  useEffect(() => {
    fetch("/api").then(
      response => response.json()
    ).then(
      data => {
        setBackendData(data)
      }
    )
  }, [])

  const SeeMovies = (id, ranking) => {
    console.log("Fetching movie id " + id)
    fetch("/movies/"+ id + "/" + ranking).then(
      response => response.json()
    ).then(
      data => {
        setMissionId(data) 
      }
    )
  }

  return (
    <div>
      {(typeof backendData.users === 'undefined') ? (
        <p>Loading ...</p>
      ):(
        backendData.users.map((user, i) => (
          <p key={i}>{user}</p>
        ))
      )}
      <div>
        <button onClick={() => SeeMovies(Math.round(Math.random()*100000)%CountMovieIds+1, Math.round(Math.random()*100000)%5+1)}>Hier Klicken</button>
      </div>
        {(typeof missionId.id === 'undefined') ? (
          <p>No Mission Id selected</p>
        ):(
          missionId.id.map((user, i) => (
            <p key={i}>You selected this movieId: {user}</p>
          ))
        )}
    </div>
  )
}

export default App