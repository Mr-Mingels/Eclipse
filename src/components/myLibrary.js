import React, { useEffect, useState } from "react";
import '../styles/mylibrary.css'
import AuthDetails from "./authdetails";
import { Link, Outlet, useLocation } from 'react-router-dom';
import likedSongImg from '../assets/likedSongImg.png'
import pause from '../assets/pause.png'
import play from '../assets/play.png'
import time from '../assets/time.png'
import musicalNote from '../assets/musicalNote.png'
import purpleLikedIcon from '../assets/purpleLikedIcon.png'
import equalizer from '../assets/equalizer.png'
import more from '../assets/more.png'

const MyLibrary = ({ displayName }) => {
    const [signedIn, setSignedIn] = useState(false)
    const [isAuthLoaded, setIsAuthLoaded] = useState(false);
    const [appliedStyle, setAppliedStyle] = useState()
    const [onPlayListsUrl, setOnPlayListsUrl] = useState(false)
    const [onArtistsUrl, setOnArtistsUrl] = useState(false)
    const [onAlbumsUrl, setOnAlbumsUrl] = useState(false)
    const location = useLocation()

    const handleClick = (event) => {
        event.preventDefault();
      };

      useEffect(() => {
        if(location.pathname === '/collection/playlists') {
            setOnPlayListsUrl(true)
        } else {
            setOnPlayListsUrl(false)
        }
        if(location.pathname === '/collection/artists') {
            setOnArtistsUrl(true)
        } else {
            setOnArtistsUrl(false)
        }
        if(location.pathname === '/collection/albums') {
            setOnAlbumsUrl(true)
        } else {
            setOnAlbumsUrl(false)
        }
      },[location])

    const handleScroll = () => { // Change this value to the desired scroll position
        const targetNavRenderScrollPosition = 75;
        const currentScrollPosition = window.scrollY;
        
        const transparentStyle = {
          background: 'transparent'
        };
  
        const scrolledNavFullRenderStyle = {
          background: 'linear-gradient(to right, #000000, #231b25)'
        }
  
       if (currentScrollPosition > targetNavRenderScrollPosition) {
          setAppliedStyle(scrolledNavFullRenderStyle);
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

    if (!isAuthLoaded) {
        return <div className="loadingScreenMyLibrary">Invicible Space</div>;
    }

    return (
        <>
            <nav className="myLibraryNavBar" style={appliedStyle}>
                <div className="myLibraryNavLinksWrapper">
                    <Link to='/collection/playlists' className={`myLibraryNavLink ${onPlayListsUrl ? 'onRoute' : ''}`} 
                    onMouseDown={handleClick}>Playlists</Link>
                    <Link to='/collection/artists' className={`myLibraryNavLink ${onArtistsUrl ? 'onRoute' : ''}`} 
                    onMouseDown={handleClick}>Artists</Link>
                    <Link to='/collection/albums' className={`myLibraryNavLink ${onAlbumsUrl ? 'onRoute' : ''}`} 
                    onMouseDown={handleClick}>Albums</Link>
                </div>
            {!signedIn &&(
                        <div>
                            <Link to='/login' className="myLibraryLinks"><button className="myLibraryLogInBtn">Log In</button></Link>
                        </div>
                    )}
                    {signedIn &&(
                        <div className="myLibraryAuthDetailsWrapper">
                            <AuthDetails displayName={displayName}/>
                        </div>
                    )}
            </nav>
            <div>
                <Outlet />
            </div>
        </>
    )
}

export default MyLibrary