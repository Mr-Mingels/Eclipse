import '../styles/playlist.css'
import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import AuthDetails from './authdetails';
import defaultProfileImg from '../assets/profile-avatar.png'
import musicalNote from '../assets/musicalNote.png'
import purpleLikedIcon from '../assets/purpleLikedIcon.png'
import likedIcon from '../assets/likedIcon.png'
import more from '../assets/more.png'
import time from '../assets/time.png'
import play from '../assets/play.png'
import equalizer from '../assets/equalizer.png'
import pause from '../assets/pause.png'
import sortUp from '../assets/sortUp.png'


const PlayList = ({ displayName, accessToken, chooseTrack, togglePlay, setTogglePlay, userId, theCurrentTrackPlaying, isPremium }) => {
    const { id } = useParams()
    const [appliedStyle, setAppliedStyle] = useState(null)
    const [infoBarStyle, setInfoBarStyle] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isAuthLoaded, setIsAuthLoaded] = useState(false);
    const [signedIn, setSignedIn] = useState(false)
    const [playingPlayList, setPlayingPlayList] = useState(false)
    const [playListTracks, setPlayListTracks] = useState(null)
    const [playlist, setPlaylist] = useState()
    const [currentTrackUri, setCurrentTrackUri] = useState(null);
    const [fullAlbumDuration, setFullAlbumDuration] = useState()
    const [likedTracks, setLikedTracks] = useState({});
    const [likedTracksChanged, setLikedTracksChanged] = useState(false);
    const [fetchedLikedTracks, setFetchedLikedTracks] = useState(false)
    const [openMorePlayListOptionsModal, setOpenMorePlayListOptionsModal] = useState(false)
    const [openEditDetails, setOpenEditDetails] = useState(false)
    const [openDeleteModal, setOpenDeleteModal] = useState(false)
    const [clickedTrackIndex, setClickedTrackIndex] = useState(null);
    const [showSavedPlayLists, setShowSavedPlayLists] = useState(false)
    const [savedPlayLists, setSavedPlayLists] = useState()
    const [fetchedPlaylists, setFetchedPlayLists] = useState(false)
    const [hoveringRenderedPlayLists, setHoveringRenderedPlayLists] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    


    const arraysAreEqual = (arr1, arr2) => {
        if (!arr1 || !arr2) return false;
        if (arr1.length !== arr2.length) return false;
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }
        return true;
    }

    useEffect(() => {
        if (!playListTracks) return;
        const trackUris = playListTracks.map(song => song.track.uri);
        
        if (arraysAreEqual(theCurrentTrackPlaying, trackUris) && togglePlay) {
            setPlayingPlayList(true);
        }
    }, [togglePlay, location, playListTracks]);

    useEffect(() => {
        if (accessToken === '') {
            return;
        }
        searchPlayList(id)
      }, [accessToken, id, location])

      const handleHoverOn = (event) => {  
        const trackBox = event.target.closest(".playListPageTrackBox");
        trackBox.style.setProperty("--toggle-visibility", "visible");
        trackBox.style.setProperty("--toggle-number-display", "none");
        trackBox.style.setProperty("--toggle-play-display", "flex");
        trackBox.style.setProperty("--toggle-color", "white");
        trackBox.style.setProperty("--toggle-equalizer-display", "none");
      }
  
      const handleHoverOff = (event) => {
        const trackBox = event.target.closest(".playListPageTrackBox");
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

      const playPlayList = () => {
        if(!isPremium) return
        if (!playListTracks || playListTracks.length <= 0) return;
        const trackUris = playListTracks.map(song => song.track.uri);
        setCurrentTrackUri(trackUris);
        setPlayingPlayList(true)
      };

    const PauseSong = () => {
        setTogglePlay(false)
        setPlayingPlayList(false)
    }


    const searchPlayList = async (playListId) => {
        const searchParameters = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        };
        try {
          const response = await fetch(
            `https://api.spotify.com/v1/playlists/${playListId}`,
            searchParameters
          );
          const data = await response.json();
          const newTopResults = [data];
          setPlaylist(newTopResults);
      
          // Pagination
          const allTracks = [];
          let moreTracks = true;
          let offset = 0;
      
          while (moreTracks) {
            const tracksResponse = await fetch(
              `https://api.spotify.com/v1/playlists/${playListId}/tracks?offset=${offset}&limit=100`,
              searchParameters
            );
            const tracksData = await tracksResponse.json();
            allTracks.push(...tracksData.items);
      
            if (tracksData.items.length < 100) {
              moreTracks = false;
            } else {
              offset += 100;
            }
          }
      
          const totalDurationMs = allTracks.reduce(
            (accumulator, albumTracks) =>
              accumulator + albumTracks.track.duration_ms,
            0
          );
      
          const totalDurationSec = Math.floor(totalDurationMs / 1000);
          const hours = Math.floor(totalDurationSec / 3600);
          const minutes = Math.floor((totalDurationSec % 3600) / 60);
      
          const formattedDuration = `${hours}h ${minutes}m`;
          setFullAlbumDuration(formattedDuration);
      
          const tracksWithDuration = allTracks.map((track) => {
            const durationInSeconds = Math.floor(track.track.duration_ms / 1000);
            const minutes = Math.floor(durationInSeconds / 60);
            const seconds = durationInSeconds % 60;
      
            return {
              ...track,
              duration: `${minutes}:${seconds.toString().padStart(2, "0")}`,
            };
          });
          setPlayListTracks(tracksWithDuration);
        } catch (error) {
          console.error(error);
        }
      };
      
    const handleLoad = () => {
        setIsLoading(false)
      }

    const PlayClickedSong = (track) => {
      if (!isPremium) return
        if(currentTrackUri === track.uri || theCurrentTrackPlaying === track.uri) {
            setTogglePlay(true)
        }
            setCurrentTrackUri(track.uri)
            setPlayingPlayList(false)
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

      const openMoreOptionsModal = () => {
        setOpenMorePlayListOptionsModal(true)
      }

      useEffect(() => {
        const handleClickOutside = (event) => {
          if (openMorePlayListOptionsModal && !event.target.closest(".playListPageMoreOptionsModalContent")) {
            setOpenMorePlayListOptionsModal(false);
          }
        };
      
        if (openMorePlayListOptionsModal) {
          document.addEventListener("mousedown", handleClickOutside);
        } else {
          document.removeEventListener("mousedown", handleClickOutside);
        }
      
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, [openMorePlayListOptionsModal]);

      const openEditDetailsModal = () => {
        setOpenMorePlayListOptionsModal(false)
        setOpenEditDetails(true)
      }

      const closeEditDetailsModal = () => {
        setOpenEditDetails(false)
      }

      const stopPropagation = (e) => {
        e.stopPropagation();
      };

      useEffect(() => {
        const disableScroll = (e) => {
          if (openEditDetails || openDeleteModal) {
            e.preventDefault();
          }
        };
      
        window.addEventListener('wheel', disableScroll, { passive: false });
        return () => {
          window.removeEventListener('wheel', disableScroll);
        };
      }, [openEditDetails, openDeleteModal]);

      const updatePlayList = async (playlistId) => {
        const newName = document.querySelector('.editPlayListNameInput').value;
      
        if (!newName || newName.trim() === '') {
          // Handle empty input or spaces-only input
          return;
        }
      
        const requestOptions = {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ name: newName }),
        };
      
        try {
          const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, requestOptions);
          if (!response.ok) {
            throw new Error(`Error updating playlist: ${response.statusText}`);
          }
          // Refresh the playlist data to show the updated name (use your existing function to fetch playlist data)
          searchPlayList(id);
          setOpenEditDetails(false)
        } catch (error) {
          console.error('Error updating playlist:', error);
        }
      };

      const handleOpenDeleteModal = () => {
        setOpenMorePlayListOptionsModal(false)
        setOpenDeleteModal(true)
      }

      const handleCloseDeleteModal = () => {
        setOpenDeleteModal(false)
      }

      const deletePlayList = async (playlistId) => {
        const url = `https://api.spotify.com/v1/playlists/${playlistId}/followers`;
      
        try {
          const response = await fetch(url, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });
      
          if (response.ok) {
            // Redirect or update the UI to reflect the deletion
            navigate('/collection/playlists');
          } else {
            console.error(`Error deleting playlist: ${response.statusText}`);
          }
        } catch (error) {
          console.error('Error while deleting playlist:', error);
        }
      };
      
      useEffect(() => {
        const handleClickOutside = (event) => {
          if (clickedTrackIndex !== null &&
            !event.target.closest(".playListPageMoreOptionsWrapper") &&
            !event.target.closest(".playListPageOpenMoreOptionsModalContent")) {
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
  
      const removeTrackFromPlaylist = async (playlistId, trackUri) => {
        setClickedTrackIndex(null)
        try {
          const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              tracks: [{ uri: trackUri }],
            }),
          });
      
          if (!response.ok) {
            throw new Error(`Error removing track from playlist: ${response.statusText}`);
          }
          searchPlayList(id);
        } catch (error) {
          console.error(`Failed to remove track from playlist: ${error.message}`);
        }
      }
      

      if (!isAuthLoaded || !playListTracks || !fetchedLikedTracks || !fetchedPlaylists) {
        return <div className="loadingScreenPlayListPage">Invicible Space</div>;
    }

    return (
        <div className="playListPageWrapper">
            {isLoading && <div className='playListPageLoadingScreen'>Invicible Space</div>}
            <nav className="playListPageNavWrapper" style={appliedStyle} >
                {!signedIn &&(
                    <div>
                        <Link to='/login' className="playListPageLinks"><button className="playListPageLogInBtn">Log In</button></Link>
                    </div>
                )}
                {signedIn && !isLoading &&(
                    <div>
                        <AuthDetails displayName={displayName}/>
                    </div>
                )}
            </nav>
            <div className="playListPageDetailsWrapper">
                <div className="playListPageDetailsContent">
                 <div className="playListPageDetailsImgWrapper">
                    {playlist[0].images.length > 0 ? (
                        <img className="playListPageImg" src={playlist[0].images[0].url}/>
                    ) : (
                        <img className="playListPageImg" src={musicalNote} />
                    )}
                    
                    </div>
                    <div className="playListPageDetailsInfoWrapper">
                        <span className="playListPageplayListTxt">Play List</span>
                        <h1 className="playListPageTitleTxt">{playlist[0].name}</h1>
                        <div className="playListPageUserInfoWrapper">
                            {playlist[0].owner.display_name && (
                                <span className="playListPageArtistName">{playlist[0].owner.display_name}</span>
                            )}
                            {!playlist[0].owner.display_name && playlist[0].owner.id && (
                                <span className="playListPageArtistName">{playlist[0].owner.id}</span>
                            )}
                            {!playlist[0].owner.display_name && !playlist[0].owner.id && (
                                <span className="playListPageArtistName">Undefined</span>
                            )}
                            <span className="playListPageCircleElement">●</span>
                            <span className="playListPageNumberOfTracks">{playListTracks.length} songs,</span>
                            <span className="playListPageFullAlbumTimeLenght">&nbsp;{fullAlbumDuration}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="playListPageSongsOptionsWrapper">
                <div className="playListPageSongsOptionsContent">
                  {(!playingPlayList || !togglePlay) && (
                    <button onClick={() => {playPlayList()}} className="playListPagePlayOptionsImgWrapper">
                        <img className="playListPagePlayOptionsImg" src={play}/>
                    </button>
                  )}
                  {playingPlayList && togglePlay && (
                    <button onClick={() => {PauseSong()}} className="playListPagePlayOptionsImgWrapper">
                        <img className="playListPagePlayOptionsImg paused" src={pause}/>
                    </button>
                  )}
                  {playlist[0].owner.id === userId && (
                    <div className='playListPageMorePlayListOptionsWrapper' onClick={openMoreOptionsModal}>
                      <img className='playListPageMorePlayListOptionsImg' src={more}/>
                    </div>
                  )}
                  {openMorePlayListOptionsModal &&(
                    <div className='playListPageMoreOptionsModalWrapper'>
                      <div className='playListPageMoreOptionsModalContent'>
                        <button className='playListPageModalButtons' onClick={openEditDetailsModal}>Edit Details</button>
                        <button className='playListPageModalButtons' onClick={handleOpenDeleteModal}>Remove From Library</button>
                      </div>
                    </div>
                  )}
                  {openEditDetails && (
                    <div className='openEditDetailsModalWrapper' onClick={closeEditDetailsModal}> 
                      <div className='openEditDetailsModalContent' onClick={stopPropagation}>
                          <h1 className='editPlayListEditDetailsTitle'>Edit Details</h1>
                          <input placeholder='Name...' className='editPlayListNameInput'></input>
                          <div className='editPlayListBtnWrapper'>
                              <button className='editPlayListCloseBtn' onClick={closeEditDetailsModal}>Close</button>
                              <button className='editPlayListSaveBtn' onClick={() => updatePlayList(id)}>Save</button>
                          </div>
                      </div>
                    </div>
                  )}
                  {openDeleteModal && (
                    <div className='openDeleteModalWrapper' onClick={handleCloseDeleteModal}> 
                      <div className='openDeleteModalContent' onClick={stopPropagation}>
                          <h1 className='deletePlayListTitleTxt'>Remove From Library?</h1>
                          <p className='deletePlayListTxt'>This will remove&nbsp;<span className='deletePlayListPlayListName'>{playlist[0].name}&nbsp;</span>from Your Library.</p>
                          <div className='deletePlayListBtnWrapper'>
                              <button className='deletePlayListCancelBtn' onClick={handleCloseDeleteModal}>Cancel</button>
                              <button className='deletePlayListDeleteBtn' onClick={() => deletePlayList(id)}>Remove</button>
                          </div>
                      </div>
                    </div>
                  )}
                </div>
            </div>
            <div className={infoBarStyle ? 'playListPageScrolledInfoBar' : 'playListPageInfoBar'}>
                <span className="playListPageHashTagSec">#</span>
                <p className="playListPageTitleSec">Title</p>
                <p className="playListPageAlbumSec">Album</p>
                <span className="playListPageDurationImgWrapper">
                    <img className="playListPageDurationImg" src={time}></img>
                </span>
            </div>
            {playListTracks &&(     
                <div className="playListPageResultsWrapper">
                    {playListTracks.map((track, index) => (
                        <div className="playListPageTrackBox" onLoad={handleLoad}
                        key={index} onMouseEnter={(event) => handleHoverOn(event)} onMouseLeave={(event) => handleHoverOff(event)}>
                          {((theCurrentTrackPlaying !== track.track.uri) || !togglePlay) && (
                              <p className={`playListPageIndex ${theCurrentTrackPlaying === track.track.uri ? 'playing' : ''}`} style={{ display: "var(--toggle-number-display)" }}>{index + 1}</p>
                          )}
                          {theCurrentTrackPlaying === track.track.uri && togglePlay && (
                              <div className='playListPageEqualizerImgWrapper' style={{ display: "var(--toggle-equalizer-display)" }}>
                                  <img className="playListPageEqualizerImg" src={equalizer} style={{ display: "var(--toggle-equalizer-display)" }}/>
                              </div>
                          )}
                          {((theCurrentTrackPlaying !== track.track.uri) || !togglePlay) && (
                            <div className='playListPagePlayImgWrapper' style={{ display: "var(--toggle-play-display)" }}>
                              <img src={play} className='playListPagePlayImg' style={{ display: "var(--toggle-play-display)" }}
                              onClick={() => {PlayClickedSong(track.track)}}/>
                            </div>
                          )}
                          {theCurrentTrackPlaying === track.track.uri && togglePlay && (
                            <div className='playListPagePauseImgWrapper' style={{ display: "var(--toggle-play-display)" }}>
                              <img src={pause} className='playListPagePauseImg' style={{ display: "var(--toggle-play-display)" }} 
                              onClick={() => {PauseSong()}}/> 
                            </div>
                          )}
                          <div className='playListPageStartOfTrackBoxWrapper'>
                          {track.track.album.images.length > 0 ? (
                            <img className="playListPageAlbumCoverImg" onLoad={handleLoad} src={track.track.album.images[0].url} />
                          ) : (
                            <img className="playListPageAlbumCoverImg" onLoad={handleLoad} src={musicalNote} />
                          )}
                        <div className="playListPageName-artist-wrapper">
                            <p className={`playListPageName ${theCurrentTrackPlaying === track.track.uri ? 'playing' : ''}`}>{track.track.name}</p>
                            <p className="playListPagetrackArtistName" style={{ color: "var(--toggle-color)" }}>{track.track.artists[0].name}</p>
                        </div>
                        </div>
                        <p className="playListPageSongAlbumName" style={{ color: "var(--toggle-color)" }}>{track.track.album.name}</p>
                        <div className='playListPageEndOfTrackBoxWrapper'>
                        {!isTrackLiked(track.track.id) ? (
                          <div className='playListPageAllSongLikedIconImgWrapper'>
                            <img className='playListPageAllSongLikedIconImg' src={likedIcon} style={{ visibility: "var(--toggle-visibility)" }} 
                            onClick={() => addToLikedSongs(track.track.id)} />
                          </div>
                        ) : (
                          <div className='playListPageAllSongLikedIconImgWrapper liked'>
                            <img className='playListPageAllSongLikedIconImg' src={purpleLikedIcon} onClick={() => removeFromLikedSongs(track.track.id)}/>
                          </div>
                        )}
                        <p className="playListPageDuration">{track.duration}</p>
                        <div className='playListPageMoreOptionsWrapper' onClick={() => handleOpenMoreOptionsModal(index)}>
                          <div className='playListPageMoreOptionsImgWrapper'>
                            <img className='playListPageMoreOptionsImg' src={more} style={{ visibility: "var(--toggle-visibility)" }}/>
                          </div>
                          {clickedTrackIndex === index &&(
                          <div className='playListPageOpenMoreOptionsModalModalWrapper' onClick={(e) => e.stopPropagation()}>
                            <div className='playListPageOpenMoreOptionsModalContent'>
                              {playlist[0].owner.id !== userId &&(
                                <span className='playListPageAddToPlayListHoverBtn' onMouseEnter={handleShowSavedPlayListsHoverOn}
                                >Add to PlayList<img className='playListPageAddToPlayListArrowImg' src={sortUp}/></span>
                              )}
                              {playlist[0].owner.id === userId &&(
                                <span className='playListPageAddToPlayListHoverBtn' onClick={() => removeTrackFromPlaylist(id, track.track.uri)}
                                >Remove From PlayList</span>
                              )}
                            </div>
                            {showSavedPlayLists &&(
                              <div className='playListPageSavedPlayListsWrapper' onMouseEnter={handleHoveringRenderedPlayListsOn} 
                              onMouseLeave={handleHoveringRenderedPlayListsOff}>
                                  <div className='playListPageSavedPlayListsContent'>
                                      {savedPlayLists.map((playlist, playListIndex) => (
                                        <button className='playListPageRenderedPlayListBtn' key={playListIndex} 
                                        onClick={() => addTrackToPlaylist(playlist.id, track.track.uri)}
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

export default PlayList