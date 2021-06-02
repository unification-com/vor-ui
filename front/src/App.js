import React from "react"
import "./App.css"
import { Router } from "react-router-dom"
import Routes from "./routes/Routes"
import history from "./routes/History"

function App() {
  return (
    <div className="App">
      <Router history={history}>{Routes}</Router>
    </div>
  )
}

export default App
