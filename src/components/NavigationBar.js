import React from "react";
import { NavLink } from "react-router-dom";

function NavigationBar() {
  const linkBase =
    "px-3 py-1 rounded-md transition-colors duration-150";
  const active = "text-white";
  const inactive = "text-white/70 hover:text-white";

  return (
    <nav
      className="navbar bg-[#1a1f2b] text-white h-16 flex items-center justify-center gap-8 border-t border-white/10"
      aria-label="Primary"
    >
      <NavLink to="/" className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}>
        Home
      </NavLink>
      <NavLink to="/movies" className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}>
        Movies
      </NavLink>
      <NavLink to="/music" className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}>
        Music
      </NavLink>
      <NavLink to="/gallery" className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}>
        Gallery
      </NavLink>
    </nav>
  );
}

export default NavigationBar;
