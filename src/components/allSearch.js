import '../styles/allSearch.css'
import React, { useEffect, useState } from "react";
import { Link, useLocation } from 'react-router-dom';
import defaultProfileImg from '../assets/profile-avatar.png'
import musicalNote from '../assets/musicalNote.png'
import purpleLikedIcon from '../assets/purpleLikedIcon.png'
import likedIcon from '../assets/likedIcon.png'
import sortUp from '../assets/sortUp.png'
import more from '../assets/more.png'
import play from '../assets/play.png'
import pause from '../assets/pause.png'

const AllSearch = ({ searchInput, accessToken, theCurrentTrackPlaying, togglePlay, setTogglePlay, chooseTrack, isPremium }) => {

    const [songResults, setSongResults] = useState([])
    const [albumResults, setAlbumResults] = useState([])
    const [artistsResults, setArtistsResults] = useState([])
    const [noArtistResults, setNoArtistResults] = useState(false)
    const [noTrackResults, setNoTrackResults] = useState(false)
    const [noAlbumResults, setNoAlbumResults] = useState(false)
    const [likedTracks, setLikedTracks] = useState({});
    const [isLoading, setIsLoading] = useState(true)
    const [likedTracksChanged, setLikedTracksChanged] = useState(false);
    const [currentTrackUri, setCurrentTrackUri] = useState(null);
    const [fetchedLikedTracks, setFetchedLikedTracks] = useState(false)
    const [clickedTrackIndex, setClickedTrackIndex] = useState(null);
    const [showSavedPlayLists, setShowSavedPlayLists] = useState(false)
    const [savedPlayLists, setSavedPlayLists] = useState()
    const [fetchedPlaylists, setFetchedPlayLists] = useState(false)
    const [hoveringRenderedPlayLists, setHoveringRenderedPlayLists] = useState(false)
    const location = useLocation()

    const handleClick = (event) => {
      event.preventDefault();
    };

    const handleHoverOn = (event) => {
      const trackBox = event.target.closest(".allTrackBox");
      trackBox.style.setProperty("--toggle-visibility", "visible");
      trackBox.style.setProperty("--toggle-number-display", "none");
      trackBox.style.setProperty("--toggle-play-display", "flex");
      trackBox.style.setProperty("--toggle-color", "white");
      trackBox.style.setProperty("--toggle-equalizer-display", "none");
    }

    const handleHoverOff = (event) => {
      const trackBox = event.target.closest(".allTrackBox");
      trackBox.style.setProperty("--toggle-visibility", "hidden");
      trackBox.style.setProperty("--toggle-number-display", "flex");
      trackBox.style.setProperty("--toggle-play-display", "none");
      trackBox.style.setProperty("--toggle-equalizer-display", "flex");
      trackBox.style.setProperty("--toggle-color", "#b3b3b3");
    }

    const handleLoad = () => {
      setIsLoading(false);
    }

      useEffect(() => { 
            if (accessToken === '') {
                return;
            }
            searchSongs(searchInput)
            searchArtists(searchInput)
            searchAlbums(searchInput)
    },[searchInput, location, accessToken])

    /*SEARCH FOR THE 4 TRACKS BY MOST SIMILAR TO SEARCH RESULT AND THE MOST POPULAR*/ 

    const searchSongs = async (input) => {
      
        const searchParameters = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        };
      try {
        const response = await fetch(
          `https://api.spotify.com/v1/search?q=${input}&type=track&limit=9`,
          searchParameters
        );
      const data = await response.json();
      const tracks = [...data.tracks.items];
    
      const sortedTracks = tracks
        .sort((a, b) => b.popularity - a.popularity) // sort by popularity, descending
        .sort((a, b) => {
          // sort by similarity, descending
          const aSimilarity = similarity(a.name, input);
          const bSimilarity = similarity(b.name, input);
    
          return bSimilarity - aSimilarity;
        });
      const tracksWithDuration = sortedTracks.map((track) => {
          const durationInSeconds = Math.floor(track.duration_ms / 1000);
          const minutes = Math.floor(durationInSeconds / 60);
          const seconds = durationInSeconds % 60;
          
          return {
            ...track,
            duration: `${minutes}:${seconds.toString().padStart(2, "0")}`,
          };
        });
        setSongResults(tracksWithDuration);
        if(tracksWithDuration.length === 0) {
          setTimeout(() => {
            setNoTrackResults(true)
          }, 500);
        } else {
          setNoTrackResults(false)
        }
      } catch (error) {
        console.error(error)
        setIsLoading(false)
        setNoTrackResults(true)
      }
        
      };

      

    const searchArtists = async (input) => {
        const searchParameters = {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          };
        try {
          const response = await fetch(
            `https://api.spotify.com/v1/search?q=${input}&type=artist&limit=3`,
            searchParameters
          );
        const data = await response.json();
        const newTopResults = [...data.artists.items];
        
        newTopResults.sort((a, b) => b.popularity - a.popularity)
          setArtistsResults(newTopResults)
          if(newTopResults.length === 0) {
            setTimeout(() => {
              setNoArtistResults(true)
            }, 500);
          } else {
            setNoArtistResults(false)
          }
        } catch (error) {
          console.error(error)
          setIsLoading(false)
          setNoArtistResults(true)
        }
     };

    const searchAlbums = async (input) => {
        const searchParameters = {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          };
        try {
          const response = await fetch(
            `https://api.spotify.com/v1/search?q=${input}&type=album&limit=4`,
            searchParameters
          );
        const data = await response.json();
        const newTopResults = [...data.albums.items];
        
        newTopResults.sort((a, b) => b.popularity - a.popularity)
          setAlbumResults(newTopResults)
          if(newTopResults.length === 0) {
            setTimeout(() => {
              setNoAlbumResults(true)
            }, 500);
          } else {
            setNoAlbumResults(false)
          }
        } catch (error) {
          console.error(error)
          setIsLoading(false)
          setNoAlbumResults(true)
        }
      };

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
            setFetchedLikedTracks(true)
          } catch (error) {
            console.error("Error fetching liked tracks:", error);
            setFetchedLikedTracks(true)
          }
        };
      
        if (accessToken) {
          fetchLikedTracks();
        }
      }, [accessToken, likedTracksChanged]);


      const isTrackLiked = (trackId) => {
        return likedTracks.hasOwnProperty(trackId);
      };

      const PlayClickedSong = (track) => {
        if(!isPremium) return
        if(currentTrackUri === track.uri || theCurrentTrackPlaying === track.uri) {
          setTogglePlay(true)
        }
          setCurrentTrackUri(track.uri)
      }

      useEffect(() => {
        chooseTrack(currentTrackUri)
      },[currentTrackUri])

      const PauseSong = () => {
        setTogglePlay(false)
      }

    
      const similarity = (str1, str2) => {
        const set1 = new Set(str1.toLowerCase().split(""));
        const set2 = new Set(str2.toLowerCase().split(""));
        const intersection = new Set([...set1].filter((x) => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        return intersection.size / union.size;
    }   

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (clickedTrackIndex !== null &&
          !event.target.closest(".allSongMoreOptionsWrapper") &&
          !event.target.closest(".allSongOpenMoreOptionsModalContent")) {
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
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ uris: [trackUri] }),
      });
    
      if (response.ok) {
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
    

    if(!fetchedLikedTracks || !fetchedPlaylists) {
      return <div className='allSearchLoadingScreen'></div>
    }

    return(
        <div className='allSearchWrapper'>
          {isLoading && <div className='allSearchLoadingScreen'></div>}
            <div className='artistsResults-allAlbumResults-allSongResults-Wrapper'>
              <h1 className='allArtistsTitle'>Artists</h1>
                <div className='allArtistsResults'>
                {noArtistResults &&(
                                <div className='allArtistNoResults'>No Results Found</div>
                            )}
                {artistsResults.map((artist, index) => (
                     <Link className='linkAllArtistBoxWrapper' key={index} to={`/artist/${artist.id}`} onMouseDown={handleClick}>
                     <div className="allArtistBox">
                     {artist.images.length > 0 ? (
                       <img loading="lazy" className="allArtistImg" onLoad={handleLoad} src={artist.images[0].url} />
                     ) : (
                       <img loading="lazy" className="allArtistImg" onLoad={handleLoad} src={defaultProfileImg} />
                     )}
                     <p className="allArtistName">{artist.name}</p>
                     <span className="allCategoryType">{artist.type.charAt(0).toUpperCase() + artist.type.slice(1)}</span>
                     </div>
                     </Link>   
                    ))}
                </div>
                <div className='allAlbumTitle-allSongTitle-wrapper'>
                  <h1 className='allAlbumsTitle'>Albums</h1><h1 className='allSongsTitle'>Songs</h1>
                </div>
                <div className='allAlbumResults-allSongresults-wrapper'>
                  <div className='allAlbumResults'>
                  {noAlbumResults &&(
                                <div className='allAlbumNoResults'>No Results Found</div>
                            )}
                  {albumResults.map((album, index) => (
                          <Link className='linkAllAlbumBoxWrapper' to={`/album/${album.id}`} onMouseDown={handleClick} key={index}>
                            <div className="allAlbumBox">
                          {album.images.length > 0 ? (
                              <img loading="lazy" className="allAlbumCoverImg" onLoad={handleLoad} src={album.images[0].url} />  
                          ) : (
                              <img loading="lazy" className="allAlbumCoverImg" onLoad={handleLoad} src={musicalNote}/>
                          )}
                            <p className="allAlbumName">{album.name}</p>
                            <p className="allAlbumDataAndArtistName">{album.release_date.slice(0, 4)} <span className='circleElement'>●</span> {album.artists[0].name}</p>
                          </div>
                          </Link>
                      ))}
                  </div>
                  <div className='allSongResults'>
                  {noTrackResults &&(
                                <div className='allTracksNoResults'>No Results Found</div>
                            )}
                  {songResults.map((track, index) => (
                          <div className="allTrackBox" 
                          key={index} onMouseEnter={(event) => handleHoverOn(event)} onMouseLeave={(event) => handleHoverOff(event)}>
                          {((theCurrentTrackPlaying !== track.uri) || !togglePlay) && (
                            <div className='allSongPlayImgWrapper' style={{ display: "var(--toggle-play-display)" }}>
                              <img src={play} className='allSongPlayImg' style={{ display: "var(--toggle-play-display)" }}
                              onClick={() => {PlayClickedSong(track)}}/>
                            </div>
                          )}
                          {theCurrentTrackPlaying === track.uri && togglePlay && (
                            <div className='allSongPauseImgWrapper'>
                              <img src={pause} className='allSongPauseImg' 
                              onClick={() => {PauseSong()}}/> 
                            </div>
                          )}
                          {track.album.images.length > 0 ? (
                              <img loading="lazy" className="allSongAlbumCoverImg" onLoad={handleLoad} src={track.album.images[0].url} />  
                          ) : ( 
                              <img loading="lazy" className="allSongAlbumCoverImg" onLoad={handleLoad} src={musicalNote} />
                          )}
                          <div className="all-songName-artist-wrapper">
                              <p className={`allSongName ${theCurrentTrackPlaying === track.uri ? 'playing' : ''}`}>{track.name}</p>
                              <p className="allSongArtistName">{track.artists[0].name}</p>
                          </div>
                          {!isTrackLiked(track.id) ? (
                          <div className='allSongLikedIconImgWrapper'>
                            <img className='allSongLikedIconImg' src={likedIcon} style={{ visibility: "var(--toggle-visibility)" }} 
                            onClick={() => addToLikedSongs(track.id)} />
                          </div>
                        ) : (
                          <div className='allSongLikedIconImgWrapper liked'>
                            <img className='allSongLikedIconImg' src={purpleLikedIcon} onClick={() => removeFromLikedSongs(track.id)}/>
                          </div>
                        )}
                          <p className="allSongDuration">{track.duration}</p>
                          <div className='allSongMoreOptionsWrapper' onClick={() => handleOpenMoreOptionsModal(index)}>
                            <div className='allSongMoreOptionsImgWrapper'>
                              <img className='allSongMoreOptionsImg' src={more} style={{ visibility: "var(--toggle-visibility)" }}/>
                            </div>
                          {clickedTrackIndex === index &&(
                            <div className='allSongOpenMoreOptionsModalModalWrapper' onClick={(e) => e.stopPropagation()}>
                              <div className='allSongOpenMoreOptionsModalContent'>
                                <span className='allSongAddToPlayListHoverBtn' onMouseEnter={handleShowSavedPlayListsHoverOn}
                                >Add to PlayList<img className='allSongAddToPlayListArrowImg' src={sortUp}/></span>
                              </div>
                            {showSavedPlayLists &&(
                              <div className='allSongSavedPlayListsWrapper' onMouseEnter={handleHoveringRenderedPlayListsOn} 
                              onMouseLeave={handleHoveringRenderedPlayListsOff}>
                                  <div className='allSongSavedPlayListsContent'>
                                      {savedPlayLists.map((playlist, playListIndex) => (
                                        <button className='allSongRenderedPlayListBtn' key={playListIndex} 
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
                      ))}
                  </div>
                </div>
            </div>
        </div>
    )
}

export default AllSearch;