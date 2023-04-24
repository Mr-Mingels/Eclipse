import React, { useEffect, useState } from "react";
import '../styles/likedSongs.css'
import AuthDetails from "./authdetails";
import { Link, useLocation } from 'react-router-dom';
import likedSongImg from '../assets/likedSongImg.png'
import pause from '../assets/pause.png'
import play from '../assets/play.png'
import time from '../assets/time.png'
import musicalNote from '../assets/musicalNote.png'
import purpleLikedIcon from '../assets/purpleLikedIcon.png'
import equalizer from '../assets/equalizer.png'
import more from '../assets/more.png'
import sortUp from '../assets/sortUp.png'

const LikedSongs = ({ displayName, accessToken, chooseTrack, togglePlay, setTogglePlay, theCurrentTrackPlaying, isPremium }) => {
    const [signedIn, setSignedIn] = useState(false)
    const [isAuthLoaded, setIsAuthLoaded] = useState(false);
    const [likedSongs, setLikedSongs] = useState()
    const [currentTrackUri, setCurrentTrackUri] = useState(null);
    const [isLoading, setIsLoading] = useState(true)
    const [appliedStyle, setAppliedStyle] = useState(null)
    const [infoBarStyle, setInfoBarStyle] = useState(null)
    const [playingLikedSongs, setPlayingLikedSongs] = useState(false)
    const [fetchedLikedSongs, setFetchedLikedSongs] = useState(false)
    const [clickedTrackIndex, setClickedTrackIndex] = useState(null);
    const [showSavedPlayLists, setShowSavedPlayLists] = useState(false)
    const [savedPlayLists, setSavedPlayLists] = useState()
    const [fetchedPlaylists, setFetchedPlayLists] = useState(false)
    const [hoveringRenderedPlayLists, setHoveringRenderedPlayLists] = useState(false)
    const location = useLocation()

    const arraysAreEqual = (arr1, arr2) => {
      if (!arr1 || !arr2) return false;
      if (arr1.length !== arr2.length) return false;
      for (let i = 0; i < arr1.length; i++) {
          if (arr1[i] !== arr2[i]) return false;
      }
      return true;
  }

    useEffect(() => {
      if (!likedSongs) return
        const likedTracksList = likedSongs.map(song => song.uri);
      if (arraysAreEqual(theCurrentTrackPlaying, likedTracksList) && togglePlay) {
        setPlayingLikedSongs(true)
      }
  },[togglePlay, likedSongs, location])


    const handleScroll = () => {
      const targetNavHalfRenderScrollPosition = 200; // Change this value to the desired scroll position
      const targetNavRenderScrollPosition = 300;
      const targetInfoBarScrollPosition = 370;
      const currentScrollPosition = window.scrollY;

      const scrolledNavHalfRenderStyle = {
        background: 'linear-gradient(to right, rgba(0, 0, 0, 0.5), rgba(35, 27, 37, 0.5))'
      };
      
      const transparentStyle = {
        background: 'transparent'
      };

      const scrolledNavFullRenderStyle = {
        background: 'linear-gradient(to right, #000000, #231b25)'
      }

    if (currentScrollPosition > targetInfoBarScrollPosition) {
      setInfoBarStyle(true);
    } else {
      setInfoBarStyle(false)
    }

     if (currentScrollPosition > targetNavRenderScrollPosition) {
        setAppliedStyle(scrolledNavFullRenderStyle);
    } else if (currentScrollPosition > targetNavHalfRenderScrollPosition) {
        setAppliedStyle(scrolledNavHalfRenderStyle);
    } else {
        setAppliedStyle(transparentStyle);
    }
    };
    
    useEffect(() => {
      window.addEventListener("scroll", handleScroll);
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }, []);
    

    const handleHoverOn = (event) => {  
        const trackBox = event.target.closest(".likedSongTrackBox");
        trackBox.style.setProperty("--toggle-visibility", "visible");
        trackBox.style.setProperty("--toggle-number-display", "none");
        trackBox.style.setProperty("--toggle-play-display", "flex");
        trackBox.style.setProperty("--toggle-color", "white");
        trackBox.style.setProperty("--toggle-equalizer-display", "none");
      }
  
      const handleHoverOff = (event) => {
        const trackBox = event.target.closest(".likedSongTrackBox");
        trackBox.style.setProperty("--toggle-visibility", "hidden");
        trackBox.style.setProperty("--toggle-number-display", "flex");
        trackBox.style.setProperty("--toggle-play-display", "none");
        trackBox.style.setProperty("--toggle-equalizer-display", "flex");
        trackBox.style.setProperty("--toggle-color", "#b3b3b3");
      }

    useEffect(() => {
        if(displayName) {
            setSignedIn(true)
        } else {
            setSignedIn(false)
        }
    },[displayName])

    useEffect(() => {
        if(signedIn) {
            setIsAuthLoaded(true)
        } else {
            setTimeout(() => {
                setIsAuthLoaded(true)
            }, 2000);
        }
       
    },[signedIn])


    const PlayClickedSong = (track) => {
      if(!isPremium) return
        if(currentTrackUri === track.uri || theCurrentTrackPlaying === track.uri) {
          setTogglePlay(true)
        }
          setCurrentTrackUri(track.uri)
          setPlayingLikedSongs(false)
      }


      const PauseSong = () => {
        setTogglePlay(false)
        setPlayingLikedSongs(false)
      }

      useEffect(() => {
        chooseTrack(currentTrackUri)
      },[currentTrackUri])

      const handleLoad = () => {
        setIsLoading(false)
      }


      const removeFromLikedSongs = async (trackId) => {
        try {
            const response = await fetch(`https://api.spotify.com/v1/me/tracks?ids=${trackId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                setLikedSongs(prevLikedSongs => prevLikedSongs.filter(song => song.id !== trackId));
            } else {
                console.error('Error removing track from liked songs:', response.statusText);
            }
        } catch (error) {
            console.error('Error removing track from liked songs:', error);
        }
    };


    const fetchLikedSongs = async (token) => {
        const limit = 50; // maximum allowed by the API
        let offset = 0;
        let allLikedSongs = [];
        let shouldFetchMore = true;
      
        while (shouldFetchMore) {
          const response = await fetch(`https://api.spotify.com/v1/me/tracks?limit=${limit}&offset=${offset}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
      
          if (!response.ok) {
            console.error(`Error fetching liked songs: ${response.statusText}`);
            break;
          }
      
          const data = await response.json();
          const fetchedItems = data.items.map(item => item.track);
          allLikedSongs = [...allLikedSongs, ...fetchedItems];
      
          if (fetchedItems.length === limit) {
            offset += limit;
          } else {
            shouldFetchMore = false;
          }
        }
      
        const tracksWithDuration = allLikedSongs.map((track) => {
          const durationInSeconds = Math.floor(track.duration_ms / 1000);
          const minutes = Math.floor(durationInSeconds / 60);
          const seconds = durationInSeconds % 60;
      
          return {
            ...track,
            duration: `${minutes}:${seconds.toString().padStart(2, "0")}`,
          };
        })
      
        setLikedSongs(tracksWithDuration);
        setFetchedLikedSongs(true)
      };
      

    useEffect(() => {
        if (signedIn && accessToken) {
            fetchLikedSongs(accessToken);
        }
    }, [signedIn, accessToken]);

    const playAllLikedSongs = () => {
      if(!isPremium) return
        if (!likedSongs) return;
        const trackUris = likedSongs.map(song => song.uri);
        setCurrentTrackUri(trackUris);
        setPlayingLikedSongs(true)
      };


      useEffect(() => {
        const handleClickOutside = (event) => {
          if (clickedTrackIndex !== null &&
            !event.target.closest(".likedSongMoreOptionsWrapper") &&
            !event.target.closest(".likedSongpenMoreOptionsModalContent")) {
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
  

      
    if (!isAuthLoaded || !fetchedLikedSongs || !fetchedPlaylists) {
        return <div className="loadingScreenLikedSongs">Invicible Space</div>;
    }
    
    return (
        <div className="likedSongsWrapper">
            {isLoading && <div className='likedSongsLoadingScreen'>Invicible Space</div>}
            <nav className={`likedSongsNavWrapper ${appliedStyle ? 'styleApplied' : ''}`} style={appliedStyle} >
                {!signedIn &&(
                    <div>
                        <Link to='/login' className="homeLinks"><button className="homeLogInBtn">Log In</button></Link>
                    </div>
                )}
                {signedIn && !isLoading &&(
                    <div>
                        <AuthDetails displayName={displayName}/>
                    </div>
                )}
            </nav>
            <div className="likedSongsDetailsWrapper">
                <div className="likedSongsDetailsContent">
                    <div className="likedSongsDetailsImgWrapper">
                        <img className="likedSongsImg" src={likedSongImg}/>
                    </div>
                    <div className="likedSongsDetailsInfoWrapper">
                        <span className="playListTxt">Playlist</span>
                        <h1 className="likedSongsHeaderTxt">Liked Songs</h1>
                        <div className="userInfoWrapper">
                            <span className="likedSongsDisplayName">{displayName}</span>
                            <span className="likedSongsCircleElement">●</span>
                            <span className="numberOfSongsLiked">{likedSongs.length} songs</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="playLikedSongsOptionsWrapper">
                <div className="playLikedSongsOptionsContent">
                  {(!playingLikedSongs || !togglePlay) && (
                    <button onClick={() => {playAllLikedSongs()}} className="playOptionsImgWrapper">
                        <img className="playOptionsImg" src={play}/>
                    </button>
                  )}
                  {playingLikedSongs && togglePlay && (
                    <button onClick={() => {PauseSong()}} className="playOptionsImgWrapper">
                        <img className="playOptionsImg paused" src={pause}/>
                    </button>
                  )}
                </div>
            </div>
            <div className={infoBarStyle ? 'likedSongsScrolledInfoBar' : 'likedSongsInfoBar'}>
                <span className="likedSongsHashTagSec">#</span>
                <p className="likedSongsTitleSec">Title</p>
                <p className="likedSongsAlbumSec">Album</p>
                <span className="likedSongsDurationImgWrapper">
                    <img className="likedSongsDurationImg" src={time}></img>
                </span>
            </div>
                {likedSongs &&(     
                <div className="likedSongsResultsWrapper">
                    {likedSongs.map((track, index) => (
                        <div className="likedSongTrackBox" 
                        key={index} onMouseEnter={(event) => handleHoverOn(event)} onMouseLeave={(event) => handleHoverOff(event)}>
                          {((theCurrentTrackPlaying !== track.uri) || !togglePlay) && (
                              <p className={`likedSongIndex ${theCurrentTrackPlaying === track.uri ? 'playing' : ''}`} style={{ display: "var(--toggle-number-display)" }}>{index + 1}</p>
                          )}
                          {theCurrentTrackPlaying === track.uri && togglePlay && (
                              <div className='likedSongEqualizerImgWrapper' style={{ display: "var(--toggle-equalizer-display)" }}>
                                  <img className="likedSongEqualizerImg" src={equalizer} style={{ display: "var(--toggle-equalizer-display)" }}/>
                              </div>
                          )}
                          {((theCurrentTrackPlaying !== track.uri) || !togglePlay) && (
                            <div className='likedSongPlayImgWrapper' style={{ display: "var(--toggle-play-display)" }}>
                              <img src={play} className='likedSongPlayImg' style={{ display: "var(--toggle-play-display)" }}
                              onClick={() => {PlayClickedSong(track)}}/>
                            </div>
                          )}
                          {theCurrentTrackPlaying === track.uri && togglePlay && (
                            <div className='likedSongPauseImgWrapper' style={{ display: "var(--toggle-play-display)" }}>
                              <img src={pause} className='likedSongPauseImg' style={{ display: "var(--toggle-play-display)" }} 
                              onClick={() => {PauseSong()}}/> 
                            </div>
                          )}
                          <div className="LikedSongStartOfTrackBoxWrapper">
                        {track.album.images.length > 0 ? (
                            <img loading="lazy" className="likedSongAlbumCoverImg" onLoad={handleLoad} src={track.album.images[0].url} />
                          ) : (
                            <img loading="lazy" className="likedSongAlbumCoverImg" onLoad={handleLoad} src={musicalNote} />
                          )}
                        <div className="likedSongName-artist-wrapper">
                            <p className={`likedSongName ${theCurrentTrackPlaying === track.uri ? 'playing' : ''}`}>{track.name}</p>
                            <p className="likedSongtrackArtistName" style={{ color: "var(--toggle-color)" }}>{track.artists[0].name}</p>
                        </div>
                        </div>
                        <p className="likedSongAlbumName" style={{ color: "var(--toggle-color)" }}>{track.album.name}</p>
                        <div className='likedSongEndOfTrackBoxWrapper'>
                          <div className='likedSongLikedIconImgWrapper'>
                            <img className='likedSongLikedIconImg' src={purpleLikedIcon} onClick={() => removeFromLikedSongs(track.id)}/>
                          </div>
                        <p className="likedSongDuration">{track.duration}</p>
                        <div className='likedSongMoreOptionsWrapper' onClick={() => handleOpenMoreOptionsModal(index)}>
                          <div className="likedSongMoreOptionsImgWrapper">
                            <img className='likedSongMoreOptionsImg' src={more} style={{ visibility: "var(--toggle-visibility)" }}/>
                          </div>
                          {clickedTrackIndex === index &&(
                          <div className='likedSongOpenMoreOptionsModalModalWrapper' onClick={(e) => e.stopPropagation()}>
                            <div className='likedSongOpenMoreOptionsModalContent'>
                                <span className='likedSongAddToPlayListHoverBtn' onMouseEnter={handleShowSavedPlayListsHoverOn}
                                >Add to PlayList<img className='likedSongAddToPlayListArrowImg' src={sortUp}/></span>
                            </div>
                            {showSavedPlayLists &&(
                              <div className='likedSongSavedPlayListsWrapper' onMouseEnter={handleHoveringRenderedPlayListsOn} 
                              onMouseLeave={handleHoveringRenderedPlayListsOff}>
                                  <div className='likedSongSavedPlayListsContent'>
                                      {savedPlayLists.map((playlist, playListIndex) => (
                                        <button className='likedSongRenderedPlayListBtn' key={playListIndex} 
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
                )}
        </div>
    )
}

export default LikedSongs