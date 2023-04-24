import '../styles/songSearch.css'
import React, { useEffect, useState } from "react";
import { Link, useLocation } from 'react-router-dom';
import time from '../assets/time.png'
import musicalNote from '../assets/musicalNote.png'
import likedIcon from '../assets/likedIcon.png'
import purpleLikedIcon from '../assets/purpleLikedIcon.png'
import equalizer from '../assets/equalizer.png'
import more from '../assets/more.png'
import play from '../assets/play.png'
import pause from '../assets/pause.png'
import sortUp from '../assets/sortUp.png'

const SongSearch = ({ searchInput, accessToken, chooseTrack, togglePlay, setTogglePlay, theCurrentTrackPlaying, isPremium }) => {

    const [results, setResults] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [noResults, setNoResults] = useState(false)
    const [currentTrackUri, setCurrentTrackUri] = useState(null);
    const [likedTracks, setLikedTracks] = useState({});
    const [likedTracksChanged, setLikedTracksChanged] = useState(false);
    const [clickedTrackIndex, setClickedTrackIndex] = useState(null);
    const [showSavedPlayLists, setShowSavedPlayLists] = useState(false)
    const [savedPlayLists, setSavedPlayLists] = useState()
    const [fetchedPlaylists, setFetchedPlayLists] = useState(false)
    const [hoveringRenderedPlayLists, setHoveringRenderedPlayLists] = useState(false)

    const location = useLocation()

    const handleHoverOn = (event) => {
      const trackBox = event.target.closest(".trackBox");
      trackBox.style.setProperty("--toggle-visibility", "visible");
      trackBox.style.setProperty("--toggle-number-display", "none");
      trackBox.style.setProperty("--toggle-play-display", "flex");
      trackBox.style.setProperty("--toggle-color", "white");
      trackBox.style.setProperty("--toggle-equalizer-display", "none");
    }

    const handleHoverOff = (event) => {
      const trackBox = event.target.closest(".trackBox");
      trackBox.style.setProperty("--toggle-visibility", "hidden");
      trackBox.style.setProperty("--toggle-number-display", "flex");
      trackBox.style.setProperty("--toggle-play-display", "none");
      trackBox.style.setProperty("--toggle-equalizer-display", "flex");
      trackBox.style.setProperty("--toggle-color", "#b3b3b3");
    }

    const handleLoad = () => {
        setIsLoading(false)
    }

      useEffect(() => { 
            if (accessToken === '') {
                console.log('returned')
                return;
            }
            search(searchInput)
    },[searchInput, location, accessToken])

    const search = async (input) => {
        console.log(`Searched for ${input}`);
      
        const searchParameters = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        };
      try {
        const tracks = [];
        let offset = 0;
        let shouldFetchMore = true;
    while (offset < 200 && shouldFetchMore) { // fetch up to 200 tracks (4 requests of 50 tracks)
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${input}&type=track&limit=50&offset=${offset}`,
        searchParameters
      );
      const data = await response.json();
      console.log(data)
      tracks.push(...data.tracks.items);

      if (data.tracks.items.length < 50) {
        shouldFetchMore = false;
      }

      offset += 50;
    }
      
        const sortedTracks = tracks
          .sort((a, b) => b.popularity - a.popularity) // sort by popularity, descending
          .sort((a, b) => {
            // sort by similarity, descending
            const aSimilarity = similarity(a.name, input);
            const bSimilarity = similarity(b.name, input);
      
            return bSimilarity - aSimilarity;
          });
        console.log(sortedTracks);
        const tracksWithDuration = sortedTracks.map((track) => {
            const durationInSeconds = Math.floor(track.duration_ms / 1000);
            const minutes = Math.floor(durationInSeconds / 60);
            const seconds = durationInSeconds % 60;
            
            return {
              ...track,
              duration: `${minutes}:${seconds.toString().padStart(2, "0")}`,
            };
          });
        setResults(tracksWithDuration);
        if (tracksWithDuration.length === 0) {
          setTimeout(() => {
          setNoResults(true)
          }, 500);
        } else {
          setNoResults(false)
        }
      } catch (error) {
        console.error(error)
        setTimeout(() => {
          setNoResults(true)
        }, 500);
      }
      };

      const PlayClickedSong = (track) => {
        console.log(track.id)
        console.log(theCurrentTrackPlaying)
        if(!isPremium) return
        if(currentTrackUri === track.uri || theCurrentTrackPlaying === track.uri) {
          setTogglePlay(true)
          console.log('clicked play')
          console.log(togglePlay)
        }
          setCurrentTrackUri(track.uri)
      }

      useEffect(() => {
        chooseTrack(currentTrackUri)
      },[currentTrackUri])

      const PauseSong = () => {
        console.log('paused')
        setTogglePlay(false)
      }

      const addToLikedSongs = async (trackId) => {
        try {
          const response = await fetch(`https://api.spotify.com/v1/me/tracks?ids=${trackId}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          setLikedTracksChanged((prev) => !prev);
        } catch (error) {
          console.error('Error adding track to liked songs:', error);
        }
      };

      const removeFromLikedSongs = async (trackId) => {
        try {
          const response = await fetch(`https://api.spotify.com/v1/me/tracks?ids=${trackId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
      
          if (response.ok) {
            console.log('Track removed from liked songs');
            setLikedTracksChanged((prev) => !prev);
            // Update the local state to reflect the change
            setLikedTracks((prevLikedTracks) => {
              const updatedLikedTracks = { ...prevLikedTracks };
              delete updatedLikedTracks[trackId];
              return updatedLikedTracks;
            });
          } else {
            console.log('Failed to remove track from liked songs');
          }
        } catch (error) {
          console.error('Error removing track from liked songs:', error);
        }
      };
      
      

      useEffect(() => {
        const fetchLikedTracks = async () => {
          try {
            const allLikedTracks = [];
            let moreTracks = true;
            let offset = 0;
        
            while (moreTracks) {
              const response = await fetch(`https://api.spotify.com/v1/me/tracks?limit=50&offset=${offset}`, {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
              });
              const data = await response.json();
              const tracks = data.items.map((item) => item.track);
              allLikedTracks.push(...tracks);
        
              if (tracks.length < 50) {
                moreTracks = false;
              } else {
                offset += 50;
              }
            }
        
            const trackIds = allLikedTracks.reduce((acc, track) => {
              acc[track.id] = true;
              return acc;
            }, {});
            setLikedTracks(trackIds);
          } catch (error) {
            console.error("Error fetching liked tracks:", error);
          }
        };
      
        if (accessToken) {
          fetchLikedTracks();
        }
      }, [accessToken, likedTracksChanged]);


      const isTrackLiked = (trackId) => {
        return likedTracks.hasOwnProperty(trackId);
      };
      
      

      const similarity = (str1, str2) => {
        const set1 = new Set(str1.toLowerCase().split(""));
        const set2 = new Set(str2.toLowerCase().split(""));
        const intersection = new Set([...set1].filter((x) => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        return intersection.size / union.size;
    }

    useEffect(() => {
      const handleClickOutside = (event) => {
        console.log('clicked')
        if (clickedTrackIndex !== null &&
          !event.target.closest(".songMoreOptionsWrapper") &&
          !event.target.closest(".songOpenMoreOptionsModalContent")) {
          setClickedTrackIndex(null);
          setShowSavedPlayLists(false)
        }
      };
    
      if (clickedTrackIndex !== null) {
        document.addEventListener("mousedown", handleClickOutside);
      } else {
        document.removeEventListener("mousedown", handleClickOutside);
      }
    
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [clickedTrackIndex]);

    const handleOpenMoreOptionsModal = (index) => {
      if(clickedTrackIndex === index) {
        setClickedTrackIndex(null);
        setShowSavedPlayLists(false)
      } else {
        setClickedTrackIndex(index);
      }
    };
    
    const handleShowSavedPlayListsHoverOn = () => {
      setShowSavedPlayLists(true)
    }

    const handleShowSavedPlayListsHoverOff = () => {
      setShowSavedPlayLists(false)
    }

    const handleHoveringRenderedPlayListsOn = () => {
      setHoveringRenderedPlayLists(true)
    }

    const handleHoveringRenderedPlayListsOff = () => {
      setHoveringRenderedPlayLists(false)
    }

    useEffect(() => {
      const disableScroll = (e) => {
        console.log(hoveringRenderedPlayLists)
        if (hoveringRenderedPlayLists) return
        if (clickedTrackIndex !== null) {
          e.preventDefault();
        }
      };
    
      window.addEventListener('wheel', disableScroll, { passive: false });
      return () => {
        window.removeEventListener('wheel', disableScroll);
      };
    }, [clickedTrackIndex, hoveringRenderedPlayLists]);

    const fetchUserPlaylists = async (token) => {
      const limit = 50; // maximum allowed by the API
      let offset = 0;
      let allPlaylists = [];
      let shouldFetchMore = true;
    
      while (shouldFetchMore) {
        const response = await fetch(`https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
    
        if (!response.ok) {
          console.error(`Error fetching user playlists: ${response.statusText}`);
          break;
        }
    
        const data = await response.json();
        const fetchedItems = data.items;
        allPlaylists = [...allPlaylists, ...fetchedItems];
    
        if (fetchedItems.length === limit) {
          offset += limit;
        } else {
          shouldFetchMore = false;
        }
      }
      console.log(allPlaylists);
      setFetchedPlayLists(true)
      setIsLoading(false)
      return allPlaylists;
    };

    useEffect(() => {
      if (accessToken) {
        fetchUserPlaylists(accessToken).then((playlists) => {
          // Do something with the playlists
          setSavedPlayLists(playlists)
        });
      }
    }, [accessToken, fetchedPlaylists]);

    const addTrackToPlaylist = async (playlistId, trackUri) => {
      setClickedTrackIndex(null)
      console.log(trackUri)
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ uris: [trackUri] }),
      });
    
      if (response.ok) {
        console.log(`Track added to playlist ${playlistId}`);
        setHoveringRenderedPlayLists(false)
      } else {
        console.error(`Error adding track to playlist: ${response.statusText}`);
        setHoveringRenderedPlayLists(false)
      }
    };
    
    const toggleBodyScroll = (disable) => {
      document.body.style.overflow = disable ? 'hidden' : 'auto';
    };
    
    useEffect(() => {
      if(hoveringRenderedPlayLists) {
        toggleBodyScroll(true)
      } else {
        toggleBodyScroll(false)
      }
    },[hoveringRenderedPlayLists])

    if(!fetchedPlaylists) {
      return <div className='tracksLoadingScreen'></div>
    }

    return(
        <div className="resultsWrapper">
          {isLoading && <div className='tracksLoadingScreen'></div>}
          {noResults && (
                <div className='tracksNoResultsFound'>No Results Found</div>
              )}
                    <nav className="infoNavBar">
                      <span className="hashtagSec">#</span>
                      <p className="titleSec">Title</p>
                      <p className="albumSec">Album</p>
                      <span className="durationImgWrapper">
                        <img className="durationImg" src={time}></img>
                      </span>
                    </nav>
                    {results.map((track, index) => (
                        <div className="trackBox" 
                        key={index} onMouseEnter={(event) => handleHoverOn(event)} onMouseLeave={(event) => handleHoverOff(event)}>
                          {((theCurrentTrackPlaying !== track.uri) || !togglePlay) && (
                              <p className={`songIndex ${theCurrentTrackPlaying === track.uri ? 'playing' : ''}`} style={{ display: "var(--toggle-number-display)" }}>{index + 1}</p>
                          )}
                          {theCurrentTrackPlaying === track.uri && togglePlay && (
                              <div className='songEqualizerImgWrapper' style={{ display: "var(--toggle-equalizer-display)" }}>
                                  <img className="songEqualizerImg" src={equalizer} style={{ display: "var(--toggle-equalizer-display)" }}/>
                              </div>
                          )}
                          {((theCurrentTrackPlaying !== track.uri) || !togglePlay) && (
                            <div className='songPlayImgWrapper' style={{ display: "var(--toggle-play-display)" }}>
                              <img src={play} className='songPlayImg' style={{ display: "var(--toggle-play-display)" }}
                              onClick={() => {PlayClickedSong(track)}}/>
                            </div>
                          )}
                          {theCurrentTrackPlaying === track.uri && togglePlay && (
                            <div className='songPauseImgWrapper' style={{ display: "var(--toggle-play-display)" }}>
                              <img src={pause} className='songPauseImg' style={{ display: "var(--toggle-play-display)" }} 
                              onClick={() => {PauseSong()}}/> 
                            </div>
                          )}
                        <div className='songStartOfTrackBoxWrapper'>
                          {track.album.images.length > 0 ? (
                              <img className="songAlbumCoverImg" onLoad={handleLoad} src={track.album.images[0].url} />
                            ) : (
                              <img className="songAlbumCoverImg" onLoad={handleLoad} src={musicalNote} />
                            )}
                          <div className="songName-artist-wrapper">
                              <p className={`songName ${theCurrentTrackPlaying === track.uri ? 'playing' : ''}`}>{track.name}</p>
                              <p className="trackArtistName" style={{ color: "var(--toggle-color)" }}>{track.artists[0].name}</p>
                          </div>
                          </div>
                          <p className="songAlbumName" style={{ color: "var(--toggle-color)" }}>{track.album.name}</p>
                        <div className='songEndOfTrackBoxWrapper'>
                        {!isTrackLiked(track.id) ? (
                           <div className='songLikedIconImgWrapper'>
                              <img className='songLikedIconImg' src={likedIcon} style={{ visibility: "var(--toggle-visibility)" }} 
                              onClick={() => addToLikedSongs(track.id)} />
                           </div>
                        ) : (
                          <div className='songLikedIconImgWrapper'>
                            <img className='songLikedIconImg' src={purpleLikedIcon} onClick={() => removeFromLikedSongs(track.id)}/>
                          </div>
                        )}
                        <p className="songDuration">{track.duration}</p>
                        <div className='songMoreOptionsWrapper' onClick={() => handleOpenMoreOptionsModal(index)}>
                          <div className='songMoreOptionsImgWrapper'>
                            <img className='songMoreOptionsImg' src={more} style={{ visibility: "var(--toggle-visibility)" }}/>
                          </div>
                        {clickedTrackIndex === index &&(
                          <div className='songOpenMoreOptionsModalModalWrapper' onClick={(e) => e.stopPropagation()}>
                            <div className='songOpenMoreOptionsModalContent'>
                                <span className='songAddToPlayListHoverBtn' onMouseEnter={handleShowSavedPlayListsHoverOn}
                                >Add to PlayList<img className='songAddToPlayListArrowImg' src={sortUp}/></span>
                            </div>
                            {showSavedPlayLists &&(
                              <div className='songSavedPlayListsWrapper' onMouseEnter={handleHoveringRenderedPlayListsOn} 
                              onMouseLeave={handleHoveringRenderedPlayListsOff}>
                                  <div className='songSavedPlayListsContent'>
                                      {savedPlayLists.map((playlist, playListIndex) => (
                                        <button className='songRenderedPlayListBtn' key={playListIndex} 
                                        onClick={() => addTrackToPlaylist(playlist.id, track.uri)}
                                        >{playlist.name}</button>
                                      ))}
                                  </div>
                              </div>
                            )}
                          </div>
                        )}
                        </div>
                        </div>
                        </div>
                    ))}
                    </div>
    )
}

export default SongSearch;