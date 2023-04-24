import React, { useEffect, useState } from "react";
import '../styles/home.css'
import HeroImg3 from '../assets/heroImg3.png'
import AuthDetails from "./authdetails";
import musicalNote from '../assets/musicalNote.png'
import defaultProfileImg from '../assets/profile-avatar.png'
import { Link } from 'react-router-dom';

const Home = ({ displayName, accessToken }) => {

    const [signedIn, setSignedIn] = useState(false)
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthLoaded, setIsAuthLoaded] = useState(false);
    const [topArtists, setTopArtists] = useState([]);
    const [recommendedPlaylists, setRecommendedPlaylists] = useState([]);
    const [newReleases, setNewReleases] = useState([]);
    const [fetchedTopArtists, setFetchedTopArtists] = useState(false)
    const [fetchedRecommendedPlayLists, setFetchedRecommendedPlayLists] = useState(false)
    const [fetchedNewReleases, setFetchedNewReleases] = useState(false)
    const [newReleasesNoResults, setNewReleasesNoResults] = useState(false)
    const [topArtistsNoResults, setTopArtistsNoResults] = useState(false)
    const [recommendedPlaylistsNoResults, setRecommendedPlaylistsNoResults] = useState(false)

    const handleClick = (event) => {
        event.preventDefault();
      };

    const handleImageLoad = () => {
            setIsLoading(false);
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

    useEffect(() => {
      const fetchTopArtists = async () => {
        try {
          const response = await fetch('https://api.spotify.com/v1/me/top/artists?limit=12', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
    
          if (!response.ok) {
            throw new Error(`Error fetching top artists: ${response.statusText}`);
          }
    
          const data = await response.json();
          setTopArtists(data.items);
          setFetchedTopArtists(true)
          if(data.items.length === 0) {
            setTimeout(() => {
              setTopArtistsNoResults(true)
              setIsLoading(false)
            }, 500);
          } else {
            setTopArtistsNoResults(false)
          }
        } catch (error) {
          console.error('Error fetching top artists:', error);
          setTopArtistsNoResults(true)
          setFetchedTopArtists(true)
          setIsLoading(false)
        }
      };
    
      const fetchRecommendedPlaylists = async () => {
        try {
          const response = await fetch('https://api.spotify.com/v1/browse/featured-playlists?market=US&limit=12', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
    
          if (!response.ok) {
            throw new Error(`Error fetching recommended playlists: ${response.statusText}`);
          }
    
          const data = await response.json();
          setRecommendedPlaylists(data.playlists.items);
          setFetchedRecommendedPlayLists(true)
          if(data.playlists.items.length === 0) {
            setTimeout(() => {
              setRecommendedPlaylistsNoResults(true)
              setIsLoading(false)
            }, 500);
          } else {
            setRecommendedPlaylistsNoResults(false)
          }
        } catch (error) {
          console.error('Error fetching recommended playlists:', error);
          setRecommendedPlaylistsNoResults(true)
          setFetchedRecommendedPlayLists(true)
          setIsLoading(false)
        }
      };
    
      const fetchNewReleases = async () => {
        try {
          const response = await fetch('https://api.spotify.com/v1/browse/new-releases?limit=12', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
    
          if (!response.ok) {
            throw new Error(`Error fetching new releases: ${response.statusText}`);
          }
    
          const data = await response.json();
          setNewReleases(data.albums.items);
          setFetchedNewReleases(true)
          if(data.albums.items.length === 0) {
            setTimeout(() => {
              setNewReleasesNoResults(true)
              setIsLoading(false)
            }, 500);
          } else {
            setNewReleasesNoResults(false)
          }
        } catch (error) {
          console.error('Error fetching new releases:', error);
          setNewReleasesNoResults(true)
          setFetchedNewReleases(true)
          setIsLoading(false)
        }
      };
    
      if (accessToken) {
        fetchTopArtists();
        fetchRecommendedPlaylists();
        fetchNewReleases();
      }
    }, [accessToken]);
    

    if (!isAuthLoaded || !fetchedTopArtists || !fetchedRecommendedPlayLists || !fetchedNewReleases) {
        return <div className="loadingScreenHome">Invicible Space</div>;
    }

    return (
        <div className="homeWrapper">
            {isLoading && <div className="loadingScreenHome">Invicible Space</div>}
            <div className="homeContent">
                <nav className="homeNavWrapper">
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
                <div className="heroImgWrapper">
                    <img className="heroImg" src={HeroImg3} onLoad={handleImageLoad}></img>
                    {!isLoading && <h1 className="heroImgTitle">Eclipse</h1>}
                </div>
                <h1 className='homeTopArtistsTitle'>Top Artists</h1>
                <div className="homeTopArtistsResultsWrapper">
                {topArtistsNoResults &&(
                                <div className='homeNoResults'>No Results Found</div>
                            )}
                    {topArtists.map((artist, index) => (
                    <Link className='linkHomeTopArtistBoxWrapper' to={`/artist/${artist.id}`} onMouseEnter={handleClick} key={index}>
                        <div className="homeArtistBox">
                        {artist.images.length > 0 ? (
                            <img loading="lazy" className="homeArtistImg" src={artist.images[0].url} />
                        ) : (
                            <img loading="lazy" className="homeArtistImg" src={defaultProfileImg} />
                        )}
                        <p className="homeArtistName">{artist.name}</p>
                        <span className="homeCategoryType">{artist.type.charAt(0).toUpperCase() + artist.type.slice(1)}</span>
                        </div>
                    </Link>
                    ))}
                </div>
                <h1 className='homeRecommendedPlayListsTitle'>Recommended Playlists</h1>
                <div className="homeRecommendedPlayListsResultsWrapper">
                {recommendedPlaylistsNoResults &&(
                                <div className='homeNoResults'>No Results Found</div>
                            )}
                    {recommendedPlaylists.map((playlists, index) => (
                        <Link className='linkHomePlayListBoxWrapper' key={index} to={`/playlist/${playlists.id}`} onMouseDown={handleClick}>
                            <div className="homePlayListBox" key={index}>
                            {playlists.images.length > 0 ? (
                                <img loading="lazy" className="homePlayListCoverImg" src={playlists.images[0].url} />  
                            ) : (
                                <img loading="lazy" className="homePlayListCoverImg" src={musicalNote}/>
                            )}
                                <p className="homePlayListName">{playlists.name}</p>
                                {playlists.owner === null ? (
                                <div></div>
                                ) : (
                                <p className="homePlayListDataAndArtistName">{playlists.owner.display_name} </p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>  
                <h1 className='homeNewReleasesTitle'>New Releases</h1>
                <div className="homeNewReleasesResultsWrapper">
                {newReleasesNoResults &&(
                                <div className='homeNoResults'>No Results Found</div>
                            )}
                {newReleases.map((album, index) => (
                       <Link className='linkHomeAlbumBoxWrapper' to={`/album/${album.id}`} key={index} onMouseDown={handleClick}>
                        <div className="homeAlbumBox">
                       {album.images.length > 0 ? (
                         <img loading="lazy" className="homeAlbumCoverImg" src={album.images[0].url} />
                       ) : (
                         <img loading="lazy" className="homeAlbumCoverImg" src={musicalNote} />
                       )}
                         <p className="homeAlbumName">{album.name}</p>
                         <p className="homeAlbumDataAndArtistName">{album.release_date.slice(0, 4)} <span className='circleElement'>●</span> {album.artists[0].name}</p>
                       </div></Link>   
                      ))}
                </div>  
            </div>
        </div>
    )
}

export default Home

