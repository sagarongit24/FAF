import React from "react";
import { Link } from "react-router-dom";

function NavigationBar() {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-center space-x-6">
      <Link to="/" className="hover:underline">Home</Link>
      <Link to="/movies" className="hover:underline">Movies</Link>
      <Link to="/music" className="hover:underline">Music</Link>
      <Link to="/gallery" className="hover:underline">Gallery</Link>
    </nav>
  );
}

export default NavigationBar;
