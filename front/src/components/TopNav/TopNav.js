import React from "react"
import { Link } from "react-router-dom"
import "./TopNav.css"

const TopNav = () => {
  return (
    <nav>
      <Link className="nav-link active" underline="none" to="#">
        Explore
      </Link>
      <Link className="nav-link" underline="none" to="#">
        Docs
      </Link>
    </nav>
  )
}
export default TopNav
