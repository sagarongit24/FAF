// src/components/Navigation.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const LOGO = "/brand/broadneck.png";

export default function Navigation() {
  return (
    <nav className="nav-bar">
      <div className="nav-left">
        <NavLink to="/" className="nav-brand">
          <img src={LOGO} alt="Broadneck Films" className="nav-logo" />
        </NavLink>
      </div>

      <div className="nav-center">
        <NavLink to="/" className="nav-link" end>
          Home
        </NavLink>
        <NavLink to="/movies" className="nav-link">
          Movies
        </NavLink>
        <NavLink to="/music" className="nav-link">
          Music
        </NavLink>
        <NavLink to="/gallery" className="nav-link">
          Gallery
        </NavLink>
        <NavLink to="/team" className="nav-link">
          Team
        </NavLink>
        <NavLink to="/studio" className="nav-link">
          Studio
        </NavLink>
        <NavLink to="/services" className="nav-link">
          Services
        </NavLink>
      </div>

      <div className="nav-right">
        {/* Can add auth status or other buttons here */}
      </div>
    </nav>
  );
}