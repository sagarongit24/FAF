// src/components/MusicPlayer.jsx - YOUTUBE VERSION
import React, { useState, useEffect } from "react";
import "../styles/music-player.css";

export default function MusicPlayer({ track, onClose }) {
  const [isReady, setIsReady] = useState(false);

  // Extract YouTube video ID
  const extractVideoId = (url) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtube.com")) {
        return u.searchParams.get("v");
      }
      if (u.hostname.includes("youtu.be")) {
        return u.pathname.substring(1);
      }
      return null;
    } catch {
      return null;
    }
  };

  const videoId = extractVideoId(track.url);
  const thumbnailUrl = videoId 
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : track.coverUrl;

  useEffect(() => {
    // Simple ready state
    const timer = setTimeout(() => setIsReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!videoId) {
    return (
      <div className="music-player-overlay" onClick={onClose}>
        <div className="music-player" onClick={(e) => e.stopPropagation()}>
          <button className="player-close" onClick={onClose}>×</button>
          <div className="state error">Invalid YouTube URL</div>
        </div>
      </div>
    );
  }

  return (
    <div className="music-player-overlay" onClick={onClose}>
      <div className="music-player music-player-youtube" onClick={(e) => e.stopPropagation()}>
        <button className="player-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        {/* Album Art (YouTube Thumbnail) */}
        <div className="player-artwork">
          {thumbnailUrl ? (
            <img 
              src={thumbnailUrl} 
              alt={track.title}
              onError={(e) => {
                e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              }}
            />
          ) : (
            <div className="player-artwork-placeholder">
              <span>🎵</span>
            </div>
          )}
          <div className="player-artwork-glow"></div>
        </div>

        {/* Track Info */}
        <div className="player-info">
          <h2 className="player-title">{track.title}</h2>
          <p className="player-artist">{track.artist || "Broadneck Films"}</p>
          {track.tags && track.tags.length > 0 && (
            <div className="player-tags">
              {track.tags.map((tag, i) => (
                <span key={i} className="player-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* YouTube Player */}
        <div className="youtube-player-container">
          {isReady ? (
            <iframe
              className="youtube-player"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              title={track.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="player-loading">Loading player...</div>
          )}
        </div>

        {/* Links */}
        <div className="player-actions">
          <a
            href={track.url}
            target="_blank"
            rel="noreferrer"
            className="btn"
            onClick={(e) => e.stopPropagation()}
          >
            Open in YouTube
          </a>
        </div>
      </div>
    </div>
  );
}