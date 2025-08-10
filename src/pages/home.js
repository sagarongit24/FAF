import React from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="know-me-container">
      {/* Header */}
      <div className="header">
        <h1>Welcome to My Portfolio</h1>
        <button className="fixed-btn" onClick={() => navigate("/movies")}>
          Show Work
        </button>
      </div>

      {/* Main Layout */}
      <div className="main-layout">
        {/* Clapboard Section */}
        <div className="left-container">
          <div className="clapboard-container">
            <div className="clapboard-content">
              <h3>Clapboard</h3>
              <p>
                Add movie stripes or any additional content here related to
                Clapboard!
              </p>
            </div>
          </div>
        </div>

        {/* Music Sheet Section */}
        <div className="right-container">
          <div className="music-sheet-container">
            <div className="music-sheet-content">
              <h3>Music Sheet</h3>
              <p>
                Add musical staff, notes, or interactive features for the music
                sheet here!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
