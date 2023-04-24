import '../styles/artist.css'
import React, { useEffect, useState } from "react";
import { useParams, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import AuthDetails from './authdetails';
import defaultProfileImg from '../assets/profile-avatar.png'
import musicalNote from '../assets/musicalNote.png'
import purpleLikedIcon from '../assets/purpleLikedIcon.png'
import likedIcon from '../assets/likedIcon.png'
import more from '../assets/more.png'
import time from '../assets/time.png'
import likedSongImg from '../assets/likedSongImg.png'
import play from '../assets/play.png'
import equalizer from '../assets/equalizer.png'
import pause from '../assets/pause.png'
import sortUp from '../assets/sortUp.png'

const Artist = ({ displayName, accessToken, chooseTrack, togglePlay, setTogglePlay, theCurrentTrackPlaying, isPremium }) => {
    const { id } = useParams()
    const [appliedStyle, setAppliedStyle] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isAuthLoaded, setIsAuthLoaded] = useState(false);
    const [signedIn, setSignedIn] = useState(false)
    const [playingAlbum, setPlayingAlbum] = useState(false)
    const [currentTrackUri, setCurrentTrackUri] = useState(null);
    const [likedTracks, setLikedTracks] = useState({});
    const [likedTracksChanged, setLikedTracksChanged] = useState(false);
    const [artistInfo, setArtistInfo] = useState(null)
    const [artistAlbums, setArtistAlbums] = useState(null)
    const [artistTopTracks, setArtistTopTracks] = useState(null)
    const [followedArtists, setFollowedArtists] = useState()
    const [fetchedLikedTracks, setFetchedLikedTracks] = useState(false)
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
        if (!artistTopTracks) return;
        const trackUris = artistTopTracks.map(song => song.uri);
        
        if (arraysAreEqual(theCurrentTrackPlaying, trackUris) && togglePlay) {
            console.log('totes true');
            setPlayingAlbum(true);
        }
    }, [togglePlay, location, artistTopTracks]);

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
    
    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => {
          window.removeEventListener("scroll", handleScroll);
        };
      }, []);
      
      const handleClick = (event) => {
        event.preventDefault();
      };

    const handleHoverOn = (event) => {  
        const trackBox = event.target.closest(".artistPageTrackBox");
        trackBox.style.setProperty("--toggle-visibility", "visible");
        trackBox.style.setProperty("--toggle-number-display", "none");
        trackBox.style.setProperty("--toggle-play-display", "flex");
        trackBox.style.setProperty("--toggle-color", "white");
        trackBox.style.setProperty("--toggle-equalizer-display", "none");
      }
  
      const handleHoverOff = (event) => {
        const trackBox = event.target.closest(".artistPageTrackBox");
        trackBox.style.setProperty("--toggle-visibility", "hidden");
        trackBox.style.setProperty("--toggle-number-display", "flex");
        trackBox.style.setProperty("--toggle-play-display", "none");
        trackBox.style.setProperty("--toggle-equalizer-display", "flex");
        trackBox.style.setProperty("--toggle-color", "#b3b3b3");
      }

      const handleLoad = () => {
        setIsLoading(false)
      }

    const handleScroll = () => {
      const targetNavHalfRenderScrollPosition = 200; // Change this value to the desired scroll position
      const targetNavRenderScrollPosition = 300;
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

     if (currentScrollPosition > targetNavRenderScrollPosition) {
        setAppliedStyle(scrolledNavFullRenderStyle);
    } else if (currentScrollPosition > targetNavHalfRenderScrollPosition) {
        setAppliedStyle(scrolledNavHalfRenderStyle);
    } else {
        setAppliedStyle(transparentStyle);
    }
    };

    useEffect(() => {
        if (accessToken === '') {
            console.log('returned')
            return;
        }
        console.log(id)
        fetchArtistInfo(id)
        fetchArtistAlbums(id)
        fetchArtistTopTracks(id)
      }, [accessToken, id])

      const fetchArtistInfo = async (artistId) => {
        const searchParameters = {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          };
        try {
          const response = await fetch(
            `https://api.spotify.com/v1/artists/${artistId}`,
            searchParameters
          );
        const data = await response.json();
        setArtistInfo(data)
        console.log(data)
        }catch (error) {
          console.error(error)
        }
    };

    useEffect(() => {
      console.log(artistInfo)
    },[artistInfo])

    const fetchArtistAlbums = async (artistId) => {
        const searchParameters = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        };
        try {
          const response = await fetch(
            `https://api.spotify.com/v1/artists/${artistId}/albums`,
            searchParameters
          );
          const data = await response.json();
          const filteredAlbums = filterDuplicateAlbums(data.items);
          setArtistAlbums(filteredAlbums)
          console.log('Albums:', data.items);
        } catch (error) {
          console.error(error);
        }
      };

      const filterDuplicateAlbums = (albums) => {
        const filteredAlbums = [];
        const albumNames = new Set();
      
        for (const album of albums) {
          const albumKey = `${album.name}-${album.release_date.slice(0, 7)}`;
          if (!albumNames.has(albumKey)) {
            filteredAlbums.push(album);
            albumNames.add(albumKey);
          }
        }
      
        return filteredAlbums;
      };
      


      const fetchArtistTopTracks = async (artistId) => {
        const searchParameters = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        };
        try {
          const response = await fetch(
            `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
            searchParameters
          );
          const data = await response.json();
          if(!data.tracks) return;
          const tracksWithDuration = data.tracks.map((track) => {
            const durationInSeconds = Math.floor(track.duration_ms / 1000);
            const minutes = Math.floor(durationInSeconds / 60);
            const seconds = durationInSeconds % 60;
            
            return {
              ...track,
              duration: `${minutes}:${seconds.toString().padStart(2, "0")}`,
            };
          });
          setArtistTopTracks(tracksWithDuration)
        } catch (error) {
          console.error(error);
        }
      };

      const numberWithCommas = (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }

      const PlayClickedSong = (track) => {
        if(!isPremium) return
        if(currentTrackUri === track.uri || theCurrentTrackPlaying === track.uri) {
          setTogglePlay(true)
        }
          setCurrentTrackUri(track.uri)
          setPlayingAlbum(false)
      }

      const PauseSong = () => {
        setTogglePlay(false)
        setPlayingAlbum(false)
    }

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

      const playArtistTopTracks = () => {
        if(!isPremium) return
        if (!artistTopTracks || artistTopTracks.length <= 0) return;
        const trackUris = artistTopTracks.map(song => song.uri);
        setCurrentTrackUri(trackUris);
        setPlayingAlbum(true)
      };

      const fetchFollowedArtists = async (token) => {
        const limit = 50; // maximum allowed by the API
        let after = null;
        let allArtists = [];
        let shouldFetchMore = true;
    
        while (shouldFetchMore) {
            const response = await fetch(`https://api.spotify.com/v1/me/following?type=artist&limit=${limit}${after ? `&after=${after}` : ''}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
    
            if (!response.ok) {
                console.error(`Error fetching followed artists: ${response.statusText}`);
                break;
            }
    
            const data = await response.json();
            const fetchedItems = data.artists.items;
            allArtists = [...allArtists, ...fetchedItems];
    
            if (fetchedItems.length === limit) {
                after = data.artists.cursors.after;
            } else {
                shouldFetchMore = false;
            }
        }
        console.log(allArtists);
        return allArtists;
    };
    

      useEffect(() => {
        if (accessToken) {
            fetchFollowedArtists(accessToken).then((artists) => {
            // Do something with the playlists
            setFollowedArtists(artists)
          });
        }
      }, [accessToken]);

      const isArtistFollowed = (artistId) => {
        const checkFollowedArtists = followedArtists.map(artist => artist.id)
        return checkFollowedArtists.includes(artistId);
      };

      const unFollowArtist = async (artistId) => {
        try {
          const response = await fetch(`https://api.spotify.com/v1/me/following?type=artist&ids=${artistId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
      
          if (response.ok) {
            // Update the local state to reflect the change
            setFollowedArtists((prevFollowedArtists) =>
              prevFollowedArtists.filter((artist) => artist.id !== artistId)
            );
          } else {
            console.log('Failed to remove artist from followed artists');
          }
        } catch (error) {
          console.error('Error removing artist from followed artists:', error);
        }
      };
      

      const followArtist = async (artistId) => {
        try {
          const response = await fetch(`https://api.spotify.com/v1/me/following?type=artist&ids=${artistId}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
      
          if (response.ok) {
            // Fetch the artist data using the artistId
            const artistResponse = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });
            const artistData = await artistResponse.json();
      
            // Update the local state to reflect the change
            setFollowedArtists((prevFollowedArtists) => [...prevFollowedArtists, artistData]);
          } else {
            console.log('Failed to add artist to followed artists');
          }
        } catch (error) {
          console.error('Error adding artist to followed artists:', error);
        }
      };
      
      useEffect(() => {
        const handleClickOutside = (event) => {
          console.log('clicked')
          if (clickedTrackIndex !== null &&
            !event.target.closest(".artistPageMoreOptionsWrapper") &&
            !event.target.closest(".artistPageOpenMoreOptionsModalContent")) {
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


      if (!isAuthLoaded || !artistInfo || !artistTopTracks || !artistAlbums || !followedArtists || !fetchedLikedTracks || !fetchedPlaylists) {
        return <div className="loadingScreenArtistPage">Invicible Space</div>;
    }
      

    return (
        <div className='artistPageWrapper'>
            {isLoading && <div className='artistPageLoadingScreen'>Invicible Space</div>}
            <nav className="artistPageNavWrapper" style={appliedStyle} >
                {!signedIn &&(
                    <div>
                        <Link to='/login' className="artistPageLinks"><button className="artistPageLogInBtn">Log In</button></Link>
                    </div>
                )}
                {signedIn && !isLoading &&(
                    <div>
                        <AuthDetails displayName={displayName}/>
                    </div>
                )}
            </nav>
            <div className='artistPageArtistInfoWrapper'>
                <div className="artistPageDetailsContent">
                    <div className="artistPageDetailsImgWrapper">
                    {artistInfo.images.length > 0 ? (
                        <img className="artistPageImg" src={artistInfo.images[0].url}/>
                    ) : (
                        <img className="artistPageImg" src={defaultProfileImg} />
                    )}
                    </div>
                    <div className="artistPageDetailsInfoWrapper">
                        <span className="artistPageplayListTxt">Artist</span>
                        <h1 className="artistPageArtistName">{artistInfo.name}</h1>
                        <div className="artistPageUserInfoWrapper">
                            <span className="artistPageArtistFollowers">{numberWithCommas(artistInfo.followers.total)} followers</span>
                        </div>
                    </div>
                </div>                    
            </div>
            <div className="artistPageSongsOptionsWrapper">
                <div className="artistPageSongsOptionsContent">
                  {(!playingAlbum || !togglePlay) && (
                    <button onClick={() => {playArtistTopTracks()}} className="artistPagePlayOptionsImgWrapper">
                        <img className="artistPagePlayOptionsImg" src={play}/>
                    </button>
                  )}
                  {playingAlbum && togglePlay && (
                    <button onClick={() => {PauseSong()}} className="artistPagePlayOptionsImgWrapper">
                        <img className="artistPagePlayOptionsImg paused" src={pause}/>
                    </button>
                  )}
                  {isArtistFollowed(id) ? (
                    <button className='artistPageFollowBtn' onClick={() => {unFollowArtist(id)}}>FOLLOWING</button>
                  ) : (
                    <button className='artistPageFollowBtn' onClick={() => {followArtist(id)}}>FOLLOW</button>
                  )}
                </div>
            </div>
            {artistTopTracks &&(     
                <div className="artistPageResultsWrapper">
                <h2 className='artistPagePopularSongsTxt'>Popular Songs</h2>
                    {artistTopTracks.map((track, index) => (
                        <div className="artistPageTrackBox"
                        key={index} onMouseEnter={(event) => handleHoverOn(event)} onMouseLeave={(event) => handleHoverOff(event)}>
                          {((theCurrentTrackPlaying !== track.uri) || !togglePlay) && (
                              <p className={`artistPageIndex ${theCurrentTrackPlaying === track.uri ? 'playing' : ''}`} style={{ display: "var(--toggle-number-display)" }}>{index + 1}</p>
                          )}
                          {theCurrentTrackPlaying === track.uri && togglePlay && (
                              <div className='artistPageEqualizerImgWrapper' style={{ display: "var(--toggle-equalizer-display)" }}>
                                  <img className="artistPageEqualizerImg" src={equalizer} style={{ display: "var(--toggle-equalizer-display)" }}/>
                              </div>
                          )}
                          {((theCurrentTrackPlaying !== track.uri) || !togglePlay) && (
                            <div className='artistPagePlayImgWrapper' style={{ display: "var(--toggle-play-display)" }}>
                              <img src={play} className='artistPagePlayImg' style={{ display: "var(--toggle-play-display)" }}
                              onClick={() => {PlayClickedSong(track)}}/>
                            </div>
                          )}
                          {theCurrentTrackPlaying === track.uri && togglePlay && (
                            <div className='artistPagePauseImgWrapper' style={{ display: "var(--toggle-play-display)" }}>
                              <img src={pause} className='artistPagePauseImg' style={{ display: "var(--toggle-play-display)" }} 
                              onClick={() => {PauseSong()}}/> 
                            </div>
                          )}
                          {track.album.images.length > 0 ? (
                            <img className="artistPageAlbumCoverImg" onLoad={handleLoad} src={track.album.images[0].url} />
                          ) : (
                            <img className="artistPageAlbumCoverImg" onLoad={handleLoad} src={musicalNote} />
                          )}
                        <div className="artistPageName-artist-wrapper">
                            <p className={`artistPageName ${theCurrentTrackPlaying === track.uri ? 'playing' : ''}`}>{track.name}</p>
                            <p className="artistPagetrackArtistName" style={{ color: "var(--toggle-color)" }}>{track.artists[0].name}</p>
                        </div>
                        <div className='artistPageEndOfTrackBoxWrapper'>
                        {!isTrackLiked(track.id) ? (
                          <div className='artistPageAllSongLikedIconImgWrapper'>
                            <img className='artistPageAllSongLikedIconImg' src={likedIcon} style={{ visibility: "var(--toggle-visibility)" }} 
                            onClick={() => addToLikedSongs(track.id)} />
                          </div>
                        ) : (
                          <div className='artistPageAllSongLikedIconImgWrapper liked'>
                            <img className='artistPageAllSongLikedIconImg' src={purpleLikedIcon} onClick={() => removeFromLikedSongs(track.id)}/>
                          </div>
                        )}
                        <p className="artistPageDuration">{track.duration}</p>
                        <div className='artistPageMoreOptionsWrapper' onClick={() => handleOpenMoreOptionsModal(index)}>
                          <div className='artistPageMoreOptionsImgWrapper'>
                            <img className='artistPageMoreOptionsImg' src={more} style={{ visibility: "var(--toggle-visibility)" }}/>
                          </div>
                          {clickedTrackIndex === index &&(
                          <div className='artistPageOpenMoreOptionsModalModalWrapper' onClick={(e) => e.stopPropagation()}>
                            <div className='artistPageOpenMoreOptionsModalContent'>
                                <span className='artistPageAddToPlayListHoverBtn' onMouseEnter={handleShowSavedPlayListsHoverOn}
                                >Add to PlayList<img className='artistPageAddToPlayListArrowImg' src={sortUp}/></span>
                            </div>
                            {showSavedPlayLists &&(
                              <div className='artistPageSavedPlayListsWrapper' onMouseEnter={handleHoveringRenderedPlayListsOn} 
                              onMouseLeave={handleHoveringRenderedPlayListsOff}>
                                  <div className='artistPageSavedPlayListsContent'>
                                      {savedPlayLists.map((playlist, playListIndex) => (
                                        <button className='artistPageRenderedPlayListBtn' key={playListIndex} 
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
                    <h2 className='artistPageAlbumsTxt'>Albums</h2>
                    <div className='artistPageAlbumResults'>
                {artistAlbums.map((album, index) => (
                       <Link className='artistPageLinkAlbumBoxWrapper' to={`/album/${album.id}`} key={index} onMouseDown={handleClick}>
                        <div className="artistPageAlbumBox">
                       {album.images.length > 0 ? (
                         <img loading="lazy" className="artistPageTheAlbumCoverImg" onLoad={handleLoad} src={album.images[0].url} />
                       ) : (
                         <img loading="lazy" className="artistPageTheAlbumCoverImg" onLoad={handleLoad} src={musicalNote} />
                       )}
                         <p className="artistPageAlbumName">{album.name}</p>
                         <p className="artistPageAlbumDataAndArtistName">{album.release_date.slice(0, 4)} <span className='circleElement'>●</span> {album.artists[0].name}</p>
                       </div></Link>   
                      ))}
                </div>
                    </div>
                )}
        </div>
    )
}

export default Artist;