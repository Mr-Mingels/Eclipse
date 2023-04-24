import React, { useEffect, useState } from "react";
import AuthDetails from "./authdetails";
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import '../styles/search.css'
import searchBarIcon from '../assets/searchBarIcon.png'

const Search = ({getSearchInput, code, displayName }) => {
    const [signedIn, setSignedIn] = useState(false)
    const [isAuthLoaded, setIsAuthLoaded] = useState(false);
    const [searchInput, setSearchInput] = useState('')
    const [searchTimerId, setSearchTimerId] = useState(null);
    const [viewSelectorHeader, setViewSelectorHeader] = useState(false)
    const [onTracksUrl, setOnTracksUrl] = useState(false)
    const [onAllUrl, setOnAllUrl] = useState(false)
    const [onArtistUrl, setOnArtistUrl] = useState(false)
    const [onAlbumUrl, setOnAlbumUrl] = useState(false)
    const [viewGenres, setViewGenres] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [isHandlingSearchInput, setIsHandlingSearchInput] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleClick = (event) => {
        event.preventDefault();
      };

    useEffect(() => {
        if(displayName) {
            setSignedIn(true)
        } else {
            setSignedIn(false)
        }
    },[displayName])

    useEffect(() => {
        if(signedIn) {
            setIsLoading(false)
        } else {
            setTimeout(() => {
                setIsLoading(false)
            }, 2000);
        }
    },[signedIn])

    const handleSearchInputChange = (event) => {
        setIsHandlingSearchInput(true)
        const input = event.target.value;
        setSearchInput(input);
        if (searchTimerId) {
          clearTimeout(searchTimerId);
        }
        const newTimerId = setTimeout(() => {
            if (input === '') {
                setViewSelectorHeader(false)
                getSearchInput(input)
                navigate('/search');
            } else {
                console.log('sent info')
                setViewSelectorHeader(true)
                getSearchInput(input)
                if(location.pathname === '/search') {
                    navigate('/search/all')
                }
            }
            setIsHandlingSearchInput(false)
        }, 500);
        setSearchTimerId(newTimerId);
      };

      useEffect(() => {
        if(location.pathname === '/search/all') {
            setOnAllUrl(true)
        } else {
            setOnAllUrl(false)
        }
        if(location.pathname === '/search/tracks') {
            setOnTracksUrl(true)
        } else {
            setOnTracksUrl(false)
        }
        if(location.pathname === '/search/artists') {
            setOnArtistUrl(true)
        } else {
            setOnArtistUrl(false)
        }
        if(location.pathname === '/search/albums') {
            setOnAlbumUrl(true)
        } else {
            setOnAlbumUrl(false)
        }
        if(location.pathname === '/search') {
            setSearchInput('')
            setViewSelectorHeader(false)
            setViewGenres(true)
        }
        if(location.pathname !== '/search') {
            setViewGenres(false)
        }
      },[location])

      useEffect(() => {
        if (window.location.pathname === '/search/tracks' || window.location.pathname === '/search/all' 
        || window.location.pathname === '/search/artists' || window.location.pathname === '/search/albums') {
          window.location.pathname = '/search';
        }
      }, []);

      if (isLoading) {
        return <div className='searchLoadingScreen'></div>
      }

    return(
        <>
            <nav className="searchNavWrapper">
                <form className="searchInputWrapper" onChange={handleSearchInputChange} onSubmit={(event) => event.preventDefault()}>
                    <img className="searchBarIconImg" src={searchBarIcon}></img>
                    <input className="searchInput" placeholder="What do you want to listen to?" value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}></input>
                </form>
                    {!signedIn &&(
                        <div>
                            <Link to='/login' className="searchLinks"><button className="searchLogInBtn">Log In</button></Link>
                        </div>
                    )}
                    {signedIn && !isLoading &&(
                        <div className="searchAuthDetailsWrapper">
                            <AuthDetails displayName={displayName}/>
                        </div>
                    )}
                </nav>
                {viewSelectorHeader && (
                <div className="selectorHeaderWrapper">
                    <Link to='/search/all' className="selectBtnLinkWrapper" onMouseDown={handleClick}>
                        <button className={`selectBtn ${onAllUrl ? 'onRoute' : ''}`} disabled={isHandlingSearchInput}>All</button></Link>
                    <Link to='/search/artists' className="selectBtnLinkWrapper" onMouseDown={handleClick}>
                        <button className={`selectBtn ${onArtistUrl ? 'onRoute' : ''}`} disabled={isHandlingSearchInput}>Artists</button></Link>
                    <Link to='/search/tracks' className="selectBtnLinkWrapper" onMouseDown={handleClick}>
                        <button className={`selectBtn ${onTracksUrl ? 'onRoute' : ''}`} disabled={isHandlingSearchInput}>Songs</button></Link>
                    <Link to='/search/albums' className="selectBtnLinkWrapper" onMouseDown={handleClick}>
                        <button className={`selectBtn ${onAlbumUrl ? 'onRoute' : ''}`} disabled={isHandlingSearchInput}>Albums</button></Link>
                </div>
                )}
                {viewGenres &&(
                    <div className="genreListWrapper">
                            <h2 className="browseAllTitle">Browse All</h2>
                            <div className="genreBoxWrapper">
                                <Link to='/genre/pop' className={`genreBoxLinkWrapper ${isLoading ? 'disabled' : ''}`} onMouseDown={handleClick}>
                                <div className="genreBox" id="Pop">
                                    <h2 className="genreTitle">Pop</h2>
                                </div>
                                </Link>
                                <Link to='/genre/hip-hop' className={`genreBoxLinkWrapper ${isLoading ? 'disabled' : ''}`} onMouseDown={handleClick}>
                                <div className="genreBox" id="Hip-Hop">
                                    <h2 className="genreTitle">Hip-Hop</h2>
                                </div>
                                </Link>
                                <Link to='/genre/rock' className={`genreBoxLinkWrapper ${isLoading ? 'disabled' : ''}`} onMouseDown={handleClick}>
                                <div className="genreBox" id="Rock">
                                    <h2 className="genreTitle">Rock</h2>
                                </div>
                                </Link>
                                <Link to='/genre/jazz' className={`genreBoxLinkWrapper ${isLoading ? 'disabled' : ''}`} onMouseDown={handleClick}>
                                <div className="genreBox" id="Jazz">
                                    <h2 className="genreTitle">Jazz</h2>
                                </div>
                                </Link>
                                <Link to='/genre/classical' className={`genreBoxLinkWrapper ${isLoading ? 'disabled' : ''}`} onMouseDown={handleClick}>
                                <div className="genreBox" id="Classical">
                                    <h2 className="genreTitle">Classical</h2>
                                </div>
                                </Link>
                                <Link to='/genre/metal' className={`genreBoxLinkWrapper ${isLoading ? 'disabled' : ''}`} onMouseDown={handleClick}>
                                <div className="genreBox" id="Metal">
                                    <h2 className="genreTitle">Metal</h2>
                                </div>
                                </Link>
                                <Link to='/genre/country' className={`genreBoxLinkWrapper ${isLoading ? 'disabled' : ''}`} onMouseDown={handleClick}>
                                <div className="genreBox" id="Country">
                                    <h2 className="genreTitle">Country</h2>
                                </div>
                                </Link>
                                <Link to='/genre/indie' className={`genreBoxLinkWrapper ${isLoading ? 'disabled' : ''}`} onMouseDown={handleClick}>
                                <div className="genreBox" id="Indie">
                                    <h2 className="genreTitle">Indie</h2>
                                </div>
                                </Link>
                                <Link to='/genre/R&B' className={`genreBoxLinkWrapper ${isLoading ? 'disabled' : ''}`} onMouseDown={handleClick}>
                                <div className="genreBox" id="rb">
                                    <h2 className="genreTitle">R&B</h2>
                                </div>
                                </Link>
                                <Link to='/genre/blues' className={`genreBoxLinkWrapper ${isLoading ? 'disabled' : ''}`} onMouseDown={handleClick}>
                                <div className="genreBox" id="Blues">
                                    <h2 className="genreTitle">Blues</h2>
                                </div>
                                </Link>
                                <Link to='/genre/soul' className={`genreBoxLinkWrapper ${isLoading ? 'disabled' : ''}`} onMouseDown={handleClick}>
                                <div className="genreBox" id="Soul">
                                    <h2 className="genreTitle">Soul</h2>
                                </div>
                                </Link>
                                <Link to='/genre/k-pop' className={`genreBoxLinkWrapper ${isLoading ? 'disabled' : ''}`} onMouseDown={handleClick}>
                                <div className="genreBox" id="K-pop">
                                    <h2 className="genreTitle">K-pop</h2>
                                </div>
                                </Link>
                                <Link to='/genre/punk' className={`genreBoxLinkWrapper ${isLoading ? 'disabled' : ''}`} onMouseDown={handleClick}>
                                <div className="genreBox" id="Punk">
                                    <h2 className="genreTitle">Punk</h2>
                                </div>
                                </Link>
                                <Link to='/genre/latin' className={`genreBoxLinkWrapper ${isLoading ? 'disabled' : ''}`} onMouseDown={handleClick}>
                                <div className="genreBox" id="Latin">
                                    <h2 className="genreTitle">Latin</h2>
                                </div>
                                </Link>
                                <Link to='/genre/folk' className={`genreBoxLinkWrapper ${isLoading ? 'disabled' : ''}`} onMouseDown={handleClick}>
                                <div className="genreBox" id="Folk">
                                    <h2 className="genreTitle">Folk</h2>
                                </div>
                                </Link>
                                <Link to='/genre/gospel' className={`genreBoxLinkWrapper ${isLoading ? 'disabled' : ''}`} onMouseDown={handleClick}>
                                <div className="genreBox" id="Gospel">
                                    <h2 className="genreTitle">Gospel</h2>
                                </div>
                                </Link>
                                <Link to='/genre/electronic' className={`genreBoxLinkWrapper ${isLoading ? 'disabled' : ''}`} onMouseDown={handleClick}>
                                <div className="genreBox" id="Electronic">
                                    <h2 className="genreTitle">Electronic</h2>
                                </div>
                                </Link>
                                <Link to='/genre/reggae' className={`genreBoxLinkWrapper ${isLoading ? 'disabled' : ''}`} onMouseDown={handleClick}>
                                <div className="genreBox" id="Reggae">
                                    <h2 className="genreTitle">Reggae</h2>
                                </div>
                                </Link>
                            </div>
                    </div>
                )}
                <div>
                    <Outlet />
                </div>
            </>
    )
}

/*
var artistId = await fetch(`https://api.spotify.com/v1/search?q=${searchInput}&type=artist`, searchParameters)
            .then(response => response.json())
            .then(data => { return data.artists.items[0].id })

            console.log(`Artist Id is ${artistId}`)

        var returnedAlbums = await fetch(`https://api.spotify.com/v1/artists/${artistId}/albums?include_group=album&market=US&limit=50`
        , searchParameters)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            setAlbums(data.items)
        })
*/

export default Search