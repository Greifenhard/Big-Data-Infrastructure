import React, { useEffect, useState } from 'react'

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

  const SeeMovies = (id) => {
    console.log("Fetching movie id " + id)
    fetch("/movies/"+ id).then(
      response => response.json()
    ).then(
      data => {
        console.log(data)
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
        <button onClick={() => SeeMovies(Math.round(Math.random()*100000)%8000)}>Hier Klicken</button>
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