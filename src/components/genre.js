import '../styles/genre.css'
import React, { useEffect, useState } from "react";
import { useParams, Link } from 'react-router-dom';
import defaultProfileImg from '../assets/profile-avatar.png'
import musicalNote from '../assets/musicalNote.png'
import purpleLikedIcon from '../assets/purpleLikedIcon.png'
import likedIcon from '../assets/likedIcon.png'
import more from '../assets/more.png'
import play from '../assets/play.png'
import pause from '../assets/pause.png'
import sortUp from '../assets/sortUp.png'

const Genre = ({ accessToken, theCurrentTrackPlaying, togglePlay, setTogglePlay, chooseTrack, isPremium }) => {
    const [genreArtist, setGenreArtist] = useState([])
    const [genreAlbum, setGenreAlbum] = useState([])
    const [genreTracks, setGenreTracks] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [noArtistResults, setNoArtistResults] = useState(false)
    const [noTrackResults, setNoTrackResults] = useState(false)
    const [noAlbumResults, setNoAlbumResults] = useState(false)
    const [likedTracks, setLikedTracks] = useState({});
    const [likedTracksChanged, setLikedTracksChanged] = useState(false);
    const [currentTrackUri, setCurrentTrackUri] = useState(null);
    const [fetchedGenreAlbums, setFetchedGenreAlbums] = useState(false)
    const [fetchedGenreTracks, setFetchedGenreTracks] = useState(false)
    const [fetchedGenreArtist, setFetchedGenreArtist] = useState(false)
    const [clickedTrackIndex, setClickedTrackIndex] = useState(null);
    const [showSavedPlayLists, setShowSavedPlayLists] = useState(false)
    const [savedPlayLists, setSavedPlayLists] = useState()
    const [fetchedPlaylists, setFetchedPlayLists] = useState(false)
    const [hoveringRenderedPlayLists, setHoveringRenderedPlayLists] = useState(false)
    const { id } = useParams()

    const handleClick = (event) => {
      event.preventDefault();
    };


    const handleHoverOn = (event) => {
      const trackBox = event.target.closest(".genreTrackBox");
      trackBox.style.setProperty("--toggle-visibility", "visible");
      trackBox.style.setProperty("--toggle-number-display", "none");
      trackBox.style.setProperty("--toggle-play-display", "flex");
      trackBox.style.setProperty("--toggle-color", "white");
      trackBox.style.setProperty("--toggle-equalizer-display", "none");
    }

    const handleHoverOff = (event) => {
      const trackBox = event.target.closest(".genreTrackBox");
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
            console.log('returned')
            return;
        }
        console.log(id)
        searchArtists(id)
        searchAlbums(id)
        searchSongs(id)
      }, [accessToken, id])

      const searchArtists = async (urlParameter) => {
        console.log(urlParameter)
        const searchParameters = {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          };
        try {
          const response = await fetch(
            `https://api.spotify.com/v1/search?q=genre:${urlParameter}&type=artist&limit=3`,
            searchParameters
          );
        const data = await response.json();
        const newTopResults = [...data.artists.items];
        
        newTopResults.sort((a, b) => b.popularity - a.popularity)
          setGenreArtist(newTopResults)
          setFetchedGenreArtist(true)
          if(newTopResults.length === 0) {
            setTimeout(() => {
              setNoArtistResults(true)
              setIsLoading(false)
            }, 500);
          } else {
            setNoArtistResults(false)
          }
          console.log(...data.artists.items)
        } catch (error) {
          console.error(error)
          setNoArtistResults(true)
          setFetchedGenreArtist(true)
          setIsLoading(false)
        }
            };

    const searchAlbums = async (urlParameter) => {
        const searchParameters = {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          };
        try {
          const response = await fetch(
            `https://api.spotify.com/v1/search?q=${urlParameter}&type=playlist&limit=4`,
            searchParameters
          );
        const data = await response.json();
        console.log(data)
        const newTopResults = [...data.playlists.items];
        console.log(newTopResults)
        
        newTopResults.sort((a, b) => b.popularity - a.popularity) // sort by popularity, descending
        setGenreAlbum(newTopResults)
        setFetchedGenreAlbums(true)
        if(newTopResults.length === 0) {
          setTimeout(() => {
            setNoAlbumResults(true)
            setIsLoading(false)
          }, 500);
        } else {
          setNoAlbumResults(false)
        }
        }catch (error) {
          console.error(error)
          setNoAlbumResults(true)
          setFetchedGenreAlbums(true)
          setIsLoading(false)
        }
            };


    const searchSongs = async (urlParameter) => {
      
        const searchParameters = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        };
      try {
        const response = await fetch(
          `https://api.spotify.com/v1/search?q=genre:${urlParameter}&type=track&limit=9`,
          searchParameters
        );
      const data = await response.json();
      const tracks = [...data.tracks.items];
    
      const sortedTracks = tracks
        .sort((a, b) => b.popularity - a.popularity) // sort by popularity, descending
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
        setGenreTracks(tracksWithDuration);
        setFetchedGenreTracks(true)
        if(tracksWithDuration.length === 0) {
          setTimeout(() => {
            setNoTrackResults(true)
            setIsLoading(false)
          }, 500);
        } else {
          setNoTrackResults(false)
        }
      console.log(tracksWithDuration)
      } catch (error) {
        console.error(error)
        setNoTrackResults(true)
        setFetchedGenreTracks(true)
        setIsLoading(false)
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

      useEffect(() => {
        const handleClickOutside = (event) => {
          console.log('clicked')
          if (clickedTrackIndex !== null &&
            !event.target.closest(".genreSongMoreOptionsWrapper") &&
            !event.target.closest(".genreOpenMoreOptionsModalContent")) {
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

      if (!fetchedGenreAlbums || !fetchedGenreArtist || !fetchedGenreTracks || !fetchedPlaylists) {
        return <div className='genreLoadingScreen'>Invicible Space</div>
      }

    return (
        <div className='genreWrapper'>
          {isLoading && <div className='genreLoadingScreen'>Invicible Space</div>}
            <div className='genreArtistsResults-genreAlbumResults-genreSongResults-Wrapper'>
            <h1 className='genreArtistsTitle'>Artists</h1>
            <div className='genreArtistsResults'>
            {noArtistResults &&(
                                <div className='genreArtistNoResults'>No Results Found</div>
                            )}
                {genreArtist.map((artist, index) => (
                  <Link className='linkGenreArtistBoxWrapper' key={index} to={`/artist/${artist.id}`} onMouseDown={handleClick}>
                        <div className="genreArtistBox" key={index}>
                        {artist.images.length > 0 ? (
                          <img loading="lazy" className="genreArtistImg" onLoad={handleLoad} src={artist.images[0].url} />
                        ) : (
                          <img loading="lazy" className="genreArtistImg" onLoad={handleLoad} src={defaultProfileImg} />
                        )}
                        <p className="genreArtistName">{artist.name}</p>
                        <span className="genreCategoryType">{artist.type.charAt(0).toUpperCase() + artist.type.slice(1)}</span>
                        </div>
                      </Link>
                    ))}
                </div>
                <div className='genrePlayListTitle-genreSongTitle-wrapper'>
                  <h1 className='genrePlayListTitle'>PlayLists</h1><h1 className='genreSongsTitle'>Songs</h1>
                </div>
                <div className='genrePlayListResults-genreSongresults-wrapper'>
                <div className='genrePlayListResults'>
                {noAlbumResults &&(
                                <div className='genrePlayListNoResults'>No Results Found</div>
                            )}
                  {genreAlbum.map((playlists, index) => (
                    <Link className='linkGenrePlayListBoxWrapper' key={index} to={`/playlist/${playlists.id}`} onMouseDown={handleClick}>
                          <div className="genrePlayListBox" key={index}>
                          {playlists.images.length > 0 ? (
                              <img loading="lazy" className="genrePlayListCoverImg" onLoad={handleLoad} src={playlists.images[0].url} />  
                          ) : (
                              <img loading="lazy" className="genrePlayListCoverImg" onLoad={handleLoad} src={musicalNote}/>
                          )}
                            <p className="genrePlayListName">{playlists.name}</p>
                            {playlists.owner === null ? (
                              <div></div>
                            ) : (
                               <p className="genrePlayListDataAndArtistName">{playlists.owner.display_name} </p>
                            )}
                          </div>
                    </Link>
                      ))}
                  </div>
                  <div className='genreSongResults'>
                  {noTrackResults &&(
                                <div className='genreTracksNoResults'>No Results Found</div>
                            )}
                  {genreTracks.map((track, index) => (
                          <div className="genreTrackBox" key={index} 
                          onMouseEnter={(event) => handleHoverOn(event)} onMouseLeave={(event) => handleHoverOff(event)}>
                            {((theCurrentTrackPlaying !== track.uri) || !togglePlay) && (
                            <div className='genreSongPlayImgWrapper' style={{ display: "var(--toggle-play-display)" }}>
                              <img src={play} className='genreSongPlayImg' style={{ display: "var(--toggle-play-display)" }}
                              onClick={() => {PlayClickedSong(track)}}/>
                            </div>
                          )}
                          {theCurrentTrackPlaying === track.uri && togglePlay && (
                            <div className='genreSongPauseImgWrapper'>
                              <img src={pause} className='genreSongPauseImg' 
                              onClick={() => {PauseSong()}}/> 
                            </div>
                          )}
                          {track.album.images.length > 0 ? (
                              <img loading="lazy" className="genreSongAlbumCoverImg" onLoad={handleLoad} src={track.album.images[0].url} />  
                          ) : ( 
                              <img loading="lazy" className="genreSongAlbumCoverImg" onLoad={handleLoad} src={musicalNote} />
                          )}
                          <div className="genre-songName-artist-wrapper">
                              <p className={`genreSongName ${theCurrentTrackPlaying === track.uri ? 'playing' : ''}`}>{track.name}</p>
                              <p className="genreSongArtistName">{track.artists[0].name}</p>
                          </div>
                          {!isTrackLiked(track.id) ? (
                          <div className='genreSongLikedIconImgWrapper'>
                            <img className='genreSongLikedIconImg' src={likedIcon} style={{ visibility: "var(--toggle-visibility)" }} 
                            onClick={() => addToLikedSongs(track.id)} />
                          </div>
                        ) : (
                          <div className='genreSongLikedIconImgWrapper liked'>
                            <img className='genreSongLikedIconImg' src={purpleLikedIcon} onClick={() => removeFromLikedSongs(track.id)}/>
                          </div>
                        )}
                          <p className="genreSongDuration">{track.duration}</p>
                          <div className='genreSongMoreOptionsWrapper' onClick={() => handleOpenMoreOptionsModal(index)}>
                            <div className='genreSongMoreOptionsImgWrapper'>
                              <img className='genreSongMoreOptionsImg' src={more} style={{ visibility: "var(--toggle-visibility)" }}/>
                              {clickedTrackIndex === index &&(
                                <div className='genreOpenMoreOptionsModalModalWrapper' onClick={(e) => e.stopPropagation()}>
                                  <div className='genreOpenMoreOptionsModalContent'>
                                      <span className='genreAddToPlayListHoverBtn' onMouseEnter={handleShowSavedPlayListsHoverOn}
                                      >Add to PlayList<img className='genreAddToPlayListArrowImg' src={sortUp}/></span>
                                  </div>
                                    {showSavedPlayLists &&(
                                      <div className='genreSavedPlayListsWrapper' onMouseEnter={handleHoveringRenderedPlayListsOn} 
                                      onMouseLeave={handleHoveringRenderedPlayListsOff}>
                                          <div className='genreSavedPlayListsContent'>
                                              {savedPlayLists.map((playlist, playListIndex) => (
                                                <button className='genreRenderedPlayListBtn' key={playListIndex} 
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
                </div>
            </div>
        </div>
    )
}

export default Genre