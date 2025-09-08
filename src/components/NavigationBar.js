import React from "react";
import { NavLink } from "react-router-dom";
import "./NavigationBar.css";

export default function NavigationBar() {
  return (
    <nav className="navbar">
      <div className="nav-inner">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/movies">Movies</NavLink>
        <NavLink to="/music">Music</NavLink>
        <NavLink to="/gallery">Gallery</NavLink>
        <NavLink to="/stills">Stills</NavLink>
        <NavLink to="/team">Team</NavLink>
        <NavLink to="/studio">Studio</NavLink>
        <NavLink to="/services">Services</NavLink>
        <NavLink to="/timeline">Timeline</NavLink>
      </div>
    </nav>
  );
}
