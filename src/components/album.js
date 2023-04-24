import '../styles/album.css'
import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from 'react-router-dom';
import AuthDetails from './authdetails';
import musicalNote from '../assets/musicalNote.png'
import purpleLikedIcon from '../assets/purpleLikedIcon.png'
import likedIcon from '../assets/likedIcon.png'
import more from '../assets/more.png'
import time from '../assets/time.png'
import play from '../assets/play.png'
import equalizer from '../assets/equalizer.png'
import pause from '../assets/pause.png'
import sortUp from '../assets/sortUp.png'

const Album = ({ displayName, accessToken, chooseTrack, togglePlay, setTogglePlay, theCurrentTrackPlaying, isPremium }) => {
    const { id } = useParams()
    const [appliedStyle, setAppliedStyle] = useState(null)
    const [infoBarStyle, setInfoBarStyle] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthLoaded, setIsAuthLoaded] = useState(false);
    const [signedIn, setSignedIn] = useState(false)
    const [playingAlbum, setPlayingAlbum] = useState(false)
    const [albumTracks, setAlbumTracks] = useState(null)
    const [album, setAlbum] = useState()
    const [currentTrackUri, setCurrentTrackUri] = useState(null);
    const [fullAlbumDuration, setFullAlbumDuration] = useState()
    const [likedTracks, setLikedTracks] = useState({});
    const [likedTracksChanged, setLikedTracksChanged] = useState(false);
    const [fetchedLikedTracks, setFetchedLikedTracks] = useState(false)
    const [savedAlbums, setSavedAlbums] = useState()
    const [savedAlbumsChanged, setSavedAlbumsChanged] = useState(false)
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
        if (!albumTracks) return;
        const trackUris = albumTracks.map(song => song.uri);
        
        if (arraysAreEqual(theCurrentTrackPlaying, trackUris) && togglePlay) {
            setPlayingAlbum(true);
        }
    }, [togglePlay, location, albumTracks]);

    useEffect(() => {
        if (accessToken === '') {
            return;
        }
        searchAlbums(id)
      }, [accessToken, id])

      const handleHoverOn = (event) => {  
        const trackBox = event.target.closest(".albumPageTrackBox");
        trackBox.style.setProperty("--toggle-visibility", "visible");
        trackBox.style.setProperty("--toggle-number-display", "none");
        trackBox.style.setProperty("--toggle-play-display", "flex");
        trackBox.style.setProperty("--toggle-color", "white");
        trackBox.style.setProperty("--toggle-equalizer-display", "none");
      }
  
      const handleHoverOff = (event) => {
        const trackBox = event.target.closest(".albumPageTrackBox");
        trackBox.style.setProperty("--toggle-visibility", "hidden");
        trackBox.style.setProperty("--toggle-number-display", "flex");
        trackBox.style.setProperty("--toggle-play-display", "none");
        trackBox.style.setProperty("--toggle-equalizer-display", "flex");
        trackBox.style.setProperty("--toggle-color", "#b3b3b3");
      }


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
      setInfoBarStyle(true)
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

    useEffect(() => {
        chooseTrack(currentTrackUri)
      },[currentTrackUri])

    const playAlbum = () => {
      if(!isPremium) return
        if (!albumTracks || albumTracks.length <= 0) return;
        const trackUris = albumTracks.map(song => song.uri);
        setCurrentTrackUri(trackUris);
        setPlayingAlbum(true)
      };

    const PauseSong = () => {
        setTogglePlay(false)
        setPlayingAlbum(false)
    }

    const searchAlbums = async (albumId) => {
        const searchParameters = {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          };
        try {
          const response = await fetch(
            `https://api.spotify.com/v1/albums/${albumId}`,
            searchParameters
          );
        const data = await response.json();
        const newTopResults = [data];
        setAlbum(newTopResults)
        const totalDurationMs = data.tracks.items.reduce((accumulator, albumTracks) => accumulator + albumTracks.duration_ms, 0);
        const totalDurationSec = Math.floor(totalDurationMs / 1000);
        const hours = Math.floor(totalDurationSec / 3600);
        const minutes = Math.floor((totalDurationSec % 3600) / 60);

        const formattedDuration = `${hours}h ${minutes}m`;
        setFullAlbumDuration(formattedDuration)
        const tracksWithDuration = data.tracks.items.map((track) => {
            const durationInSeconds = Math.floor(track.duration_ms / 1000);
            const minutes = Math.floor(durationInSeconds / 60);
            const seconds = durationInSeconds % 60;
        
            return {
              ...track,
              duration: `${minutes}:${seconds.toString().padStart(2, "0")}`,
            };
          })
          setAlbumTracks(tracksWithDuration)
        }catch (error) {
          console.error(error)
        }
    };

        const handleLoad = () => {
            setIsLoading(false)
          }

    const PlayClickedSong = (track) => {
      if(!isPremium) return
        if(currentTrackUri === track.uri || theCurrentTrackPlaying === track.uri) {
          setTogglePlay(true)
        }
          setCurrentTrackUri(track.uri)
          setPlayingAlbum(false)
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

      const formatDate = (dateString) => {
        const months = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
      
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = months[date.getMonth()];
        const day = date.getDate();
      
        return `${month} ${day}, ${year}`;
      };

      const saveAlbum = async (albumId) => {
        try {
          const response = await fetch(`https://api.spotify.com/v1/me/albums?ids=${albumId}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
      
          if (response.ok) {
            if (savedAlbumsChanged) {
              setSavedAlbumsChanged(false)
            } else {
              setSavedAlbumsChanged(true)
            }
          } else {
            console.log('Failed to add album to your library');
          }
        } catch (error) {
          console.error('Error adding album to your library:', error);
        }
      };
      
      const removeAlbum = async (albumId) => {
        try {
          const response = await fetch(`https://api.spotify.com/v1/me/albums?ids=${albumId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
      
          if (response.ok) {
            if (savedAlbumsChanged) {
              setSavedAlbumsChanged(false)
            } else {
              setSavedAlbumsChanged(true)
            }
          } else {
            console.log('Failed to remove album from your library');
          }
        } catch (error) {
          console.error('Error removing album from your library:', error);
        }
      };
      
      const fetchSavedAlbums = async (token) => {
        const limit = 50; // maximum allowed by the API
        let offset = 0;
        let allAlbums = [];
        let shouldFetchMore = true;
      
        while (shouldFetchMore) {
          const response = await fetch(`https://api.spotify.com/v1/me/albums?limit=${limit}&offset=${offset}`, {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });
      
          if (!response.ok) {
            console.error(`Error fetching saved albums: ${response.statusText}`);
            break;
          }
      
          const data = await response.json();
          const fetchedItems = data.items.map(item => item.album);
          allAlbums = [...allAlbums, ...fetchedItems];
      
          if (fetchedItems.length === limit) {
            offset += limit;
          } else {
            shouldFetchMore = false;
          }
        }
        return allAlbums;
      };
      
    

      useEffect(() => {
        if (accessToken) {
            fetchSavedAlbums(accessToken).then((albums) => {
            // Do something with the playlists
            setSavedAlbums(albums)
          });
        }
      }, [accessToken, savedAlbumsChanged]);

      const isAlbumSaved = (albumId) => {
        const checkSavedAlbums = savedAlbums.map(album => album.id)
        return checkSavedAlbums.includes(albumId);
      };

      useEffect(() => {
        const handleClickOutside = (event) => {
          if (clickedTrackIndex !== null &&
            !event.target.closest(".albumPageMoreOptionsWrapper") &&
            !event.target.closest(".albumPageOpenMoreOptionsModalContent")) {
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

    if (!isAuthLoaded || !albumTracks || !fetchedLikedTracks || !album || !fetchedPlaylists) {
        return <div className="loadingScreenAlbumPage">Invicible Space</div>;
    }

    return (
        <div className="albumPageWrapper">
            {isLoading && <div className='albumPageLoadingScreen'>Invicible Space</div>}
            <nav className="albumPageNavWrapper" style={appliedStyle} >
                {!signedIn &&(
                    <div>
                        <Link to='/login' className="albumPageLinks"><button className="albumPageLogInBtn">Log In</button></Link>
                    </div>
                )}
                {signedIn && !isLoading &&(
                    <div>
                        <AuthDetails displayName={displayName}/>
                    </div>
                )}
            </nav>
            <div className="albumPageDetailsWrapper">
                <div className="albumPageDetailsContent">
                    <div className="albumPageDetailsImgWrapper">
                    {album[0].images.length > 0 ? (
                        <img className="albumPageImg" src={album[0].images[0].url}/>
                    ) : (
                        <img className="albumPageImg" src={musicalNote} />
                    )}
                    </div>
                    <div className="albumPageDetailsInfoWrapper">
                        <span className="albumPageplayListTxt">Album</span>
                        <h1 className="albumPageTitleTxt">{album[0].name}</h1>
                        <div className="albumPageUserInfoWrapper">
                            <span className="albumPageArtistName">{album[0].artists[0].name}</span>
                            <span className="albumPageCircleElement">●</span>
                            <span className='albumPageAlbumReleaseYear'>{album[0].release_date.split('-')[0]}</span>
                            <span className="albumPageCircleElement">●</span>
                            <span className="albumPageNumberOfTracks">{`${album[0].tracks.total} songs,`}</span>
                            <span className="albumPageFullAlbumTimeLenght">&nbsp;{fullAlbumDuration}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="albumPageSongsOptionsWrapper">
                <div className="albumPageSongsOptionsContent">
                  {(!playingAlbum || !togglePlay) && (
                    <button onClick={() => {playAlbum()}} className="albumPagePlayOptionsImgWrapper">
                        <img className="albumPagePlayOptionsImg" src={play}/>
                    </button>
                  )}
                  {playingAlbum && togglePlay && (
                    <button onClick={() => {PauseSong()}} className="albumPagePlayOptionsImgWrapper">
                        <img className="albumPagePlayOptionsImg paused" src={pause}/>
                    </button>
                  )}
                  {!isAlbumSaved(id) ? (
                    <div className='albumPageAddAlbumToSavedWrapper' onClick={() => {saveAlbum(id)}}>
                      <img src={likedIcon} className='albumPageAddAlbumToSaved'/>
                    </div>
                  ) : (
                    <div className='albumPageRemoveAlbumToSavedWrapper' onClick={() => {removeAlbum(id)}}>
                      <img src={purpleLikedIcon} className='albumPageRemoveAlbumToSaved'/>
                    </div>
                  )}
                </div>
            </div>
            <div className={infoBarStyle ? 'albumPageScrolledInfoBar' : 'albumPageInfoBar'}>
                <span className="albumPageHashTagSec">#</span>
                <p className="albumPageTitleSec">Title</p>
                <span className="albumPageDurationImgWrapper">
                    <img className="albumPageDurationImg" src={time}></img>
                </span>
            </div>
            {albumTracks &&(     
                <div className="albumPageResultsWrapper">
                    {albumTracks.map((track, index) => (
                        <div className="albumPageTrackBox" onLoad={handleLoad}
                        key={index} onMouseEnter={(event) => handleHoverOn(event)} onMouseLeave={(event) => handleHoverOff(event)}>
                          {((theCurrentTrackPlaying !== track.uri) || !togglePlay) && (
                              <p className={`albumPageIndex ${theCurrentTrackPlaying === track.uri ? 'playing' : ''}`} style={{ display: "var(--toggle-number-display)" }}>{index + 1}</p>
                          )}
                          {theCurrentTrackPlaying === track.uri && togglePlay && (
                              <div className='albumPageEqualizerImgWrapper' style={{ display: "var(--toggle-equalizer-display)" }}>
                                  <img className="albumPageEqualizerImg" src={equalizer} style={{ display: "var(--toggle-equalizer-display)" }}/>
                              </div>
                          )}
                          {((theCurrentTrackPlaying !== track.uri) || !togglePlay) && (
                            <div className='albumPagePlayImgWrapper' style={{ display: "var(--toggle-play-display)" }}>
                              <img src={play} className='albumPagePlayImg' style={{ display: "var(--toggle-play-display)" }}
                              onClick={() => {PlayClickedSong(track)}}/>
                            </div>
                          )}
                          {theCurrentTrackPlaying === track.uri && togglePlay && (
                            <div className='albumPagePauseImgWrapper' style={{ display: "var(--toggle-play-display)" }}>
                              <img src={pause} className='albumPagePauseImg' style={{ display: "var(--toggle-play-display)" }} 
                              onClick={() => {PauseSong()}}/> 
                            </div>
                          )}
                        <div className="albumPageName-artist-wrapper">
                            <p className={`albumPageName ${theCurrentTrackPlaying === track.uri ? 'playing' : ''}`}>{track.name}</p>
                            <p className="albumPagetrackArtistName" style={{ color: "var(--toggle-color)" }}>{track.artists[0].name}</p>
                        </div>
                        <div className='albumPageEndOfTrackBoxWrapper'>
                        {!isTrackLiked(track.id) ? (
                          <div className='albumPageAllSongLikedIconImgWrapper'>
                            <img className='albumPageAllSongLikedIconImg' src={likedIcon} style={{ visibility: "var(--toggle-visibility)" }} 
                            onClick={() => addToLikedSongs(track.id)} />
                          </div>
                        ) : (
                          <div className='albumPageAllSongLikedIconImgWrapper liked'>
                            <img className='albumPageAllSongLikedIconImg' src={purpleLikedIcon} onClick={() => removeFromLikedSongs(track.id)}/>
                          </div>
                        )}
                        <p className="albumPageDuration">{track.duration}</p>
                        <div className='albumPageMoreOptionsWrapper' onClick={() => handleOpenMoreOptionsModal(index)}>
                          <div className='albumPageMoreOptionsImgWrapper'>
                            <img className='albumPageMoreOptionsImg' src={more} style={{ visibility: "var(--toggle-visibility)" }}/>
                          </div>
                          {clickedTrackIndex === index &&(
                          <div className='albumPageOpenMoreOptionsModalModalWrapper' onClick={(e) => e.stopPropagation()}>
                            <div className='albumPageOpenMoreOptionsModalContent'>
                                <span className='albumPageAddToPlayListHoverBtn' onMouseEnter={handleShowSavedPlayListsHoverOn}
                                >Add to PlayList<img className='albumPageAddToPlayListArrowImg' src={sortUp}/></span>
                            </div>
                            {showSavedPlayLists &&(
                              <div className='albumPageSavedPlayListsWrapper' onMouseEnter={handleHoveringRenderedPlayListsOn} 
                              onMouseLeave={handleHoveringRenderedPlayListsOff}>
                                  <div className='albumPageSavedPlayListsContent'>
                                      {savedPlayLists.map((playlist, playListIndex) => (
                                        <button className='albumPageRenderedPlayListBtn' key={playListIndex} 
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
                    {album[0].copyrights.length > 0 ? (
                    <div className='albumPageCopyRightInfo'>
                        <span className='albumPageCopyRightDate'>{formatDate(album[0].release_date)}</span>
                        {album[0].copyrights[0].text && (
                          <span className='albumPageCopyRightTxt'>{album[0].copyrights[0].text}</span>
                        )}
                        {album[0].copyrights.length > 1 && (
                          <span className='albumPageCopyRightTxt'>{album[0].copyrights[1].text}</span>
                        )}
                    </div>
                    ) : (
                        <div></div>
                    )}
                    </div>
                )}
        </div>
    )
}

export default Album