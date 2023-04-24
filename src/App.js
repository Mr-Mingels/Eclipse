import './App.css'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState, useRef, lazy, Suspense  } from "react";
import Player from './components/Player';
import useAuth from './components/useAuth';

const Home = lazy(() => import('./components/home'));
const SideBar = lazy(() => import('./components/sidebar'));
const SignInPage = lazy(() => import('./components/signin'));
const Search = lazy(() => import('./components/search'))
const SongSearch = lazy(() => import('./components/songSearch'))
const AllSearch = lazy(() => import('./components/allSearch'))
const ArtistSearch = lazy(() => import('./components/artistSearch'))
const AlbumSearch = lazy(() => import('./components/albumSearch'))
const Genre = lazy(() => import('./components/genre'))
const LikedSongs = lazy(() => import('./components/likedSongs'))
const Album = lazy(() => import('./components/album'))
const Artist = lazy(() => import('./components/artist'))
const PlayList = lazy(() => import('./components/playlist'))
const MyLibrary = lazy(() => import('./components/myLibrary'))
const SavedPlayLists = lazy(() => import('./components/savedPlayLists'))
const SavedArtists = lazy(() => import('./components/savedArtists'))
const SavedAlbums = lazy(() => import('./components/savedAlbums'))

const code = new URLSearchParams(window.location.search).get('code')

function App({ getAccessToken, getTrack, togglePlay, setTogglePlay, theCurrentTrackPlaying, setCurrentLocation, isPremium }) {  
  const location = useLocation();
  const [thumbPosition, setThumbPosition] = useState(0);
  const thumbRef = useRef(null);
  const [searchInput, setSearchInput] = useState('');
  const { displayName, accessToken, userId } = useAuth(code);
  const [playingTrack, setPlayingTrack] = useState();
  const [savedPlayListData, setSavedPlayListData] = useState()
  const navigate = useNavigate();

  useEffect(() => {
    if(location.pathname === '/') return
    setCurrentLocation(location.pathname);
  }, [location, setCurrentLocation]);
  
  useEffect(() => {
    if (!code) {
      navigate('/login');
    }
  }, [code, navigate]);

  const chooseTrack = (track) => {
    setPlayingTrack(track)
  }

  useEffect(() => {
    if(playingTrack) {
      getTrack(playingTrack)
    }
  },[playingTrack])

  useEffect(() => {
    if(accessToken) {
      getAccessToken(accessToken)
    }
  },[accessToken])


  useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage =
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      const thumbPosition = (scrollPercentage / 100) * (thumbRef.current.parentNode.offsetHeight - thumbRef.current.offsetHeight);
      setThumbPosition(thumbPosition);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const getSearchInput = (data) => {
    setSearchInput(data)
  }

  const getSavedPlayListsData = (data) => {
    setSavedPlayListData(data)
  }

  return (
      <Suspense fallback={<div className='loadingScreen'></div>}>
        {location.pathname !== '/login' && location.pathname !== '/signup' && <SideBar savedPlayListData={savedPlayListData} 
        userId={userId} accessToken={accessToken}/>}
        <div className='custom-scrollbar'>
          <div className='custom-scrollbar-thumb' style={{ top: `${thumbPosition}px` }} ref={thumbRef}>
            
          </div>
        </div>
        <Routes>
          <Route path="/" element={<Home displayName={displayName} accessToken={accessToken}/>} />
          <Route path='/search' element={<Search displayName={displayName} getSearchInput={getSearchInput} code={code}/>}>
            <Route path='all' element={<AllSearch searchInput={searchInput} accessToken={accessToken} isPremium={isPremium}
            theCurrentTrackPlaying={theCurrentTrackPlaying} togglePlay={togglePlay} setTogglePlay={setTogglePlay} chooseTrack={chooseTrack}/>} />
            <Route path='tracks' element={<SongSearch searchInput={searchInput} accessToken={accessToken} isPremium={isPremium}
            chooseTrack={chooseTrack} togglePlay={togglePlay} setTogglePlay={setTogglePlay} 
            theCurrentTrackPlaying={theCurrentTrackPlaying}/>} />
            <Route path='artists' element={<ArtistSearch searchInput={searchInput} accessToken={accessToken}/>} />
            <Route path='albums' element={<AlbumSearch searchInput={searchInput} accessToken={accessToken}/>} />
          </Route>
          <Route path='/genre/:id' element={<Genre accessToken={accessToken} theCurrentTrackPlaying={theCurrentTrackPlaying} 
          togglePlay={togglePlay} setTogglePlay={setTogglePlay} chooseTrack={chooseTrack} isPremium={isPremium}/>} />
          <Route path='/album/:id' element={<Album displayName={displayName} accessToken={accessToken} 
            chooseTrack={chooseTrack} togglePlay={togglePlay} setTogglePlay={setTogglePlay} isPremium={isPremium}
            theCurrentTrackPlaying={theCurrentTrackPlaying} />}/>
          <Route path='/artist/:id' element={<Artist displayName={displayName} accessToken={accessToken} 
            chooseTrack={chooseTrack} togglePlay={togglePlay} setTogglePlay={setTogglePlay} isPremium={isPremium}
            theCurrentTrackPlaying={theCurrentTrackPlaying} />}/>
            <Route path='/playlist/:id' element={<PlayList userId={userId} displayName={displayName} accessToken={accessToken} 
            chooseTrack={chooseTrack} togglePlay={togglePlay} setTogglePlay={setTogglePlay} isPremium={isPremium}
            theCurrentTrackPlaying={theCurrentTrackPlaying} />}/>
          <Route path='/collection/tracks' element={<LikedSongs displayName={displayName} accessToken={accessToken} 
            chooseTrack={chooseTrack} togglePlay={togglePlay} setTogglePlay={setTogglePlay} isPremium={isPremium}
            theCurrentTrackPlaying={theCurrentTrackPlaying}/>} />
          <Route path='/collection' element={<MyLibrary displayName={displayName} />}>
            <Route path='playlists' element={<SavedPlayLists getSavedPlayListsData={getSavedPlayListsData} accessToken={accessToken} 
            displayName={displayName} />} />
            <Route path='artists' element={<SavedArtists accessToken={accessToken} displayName={displayName} />} />
            <Route path='albums' element={<SavedAlbums accessToken={accessToken} displayName={displayName} />} />
          </Route>
          <Route path='/login' element={<SignInPage />} />
        </Routes>
      </Suspense>
  );
}

function Root() {
  const [playingTrack, setPlayingTrack] = useState()
  const [accessToken, setAccessToken] = useState()
  const [togglePlay, setTogglePlay] = useState(null)
  const [theCurrentTrackPlaying, setTheCurrentTrackPlaying] = useState()
  const [currentLocation, setCurrentLocation] = useState();
  const [isPremium, setIsPremium] = useState()

  const getTrack = (track) => {
    setPlayingTrack(track)
  }

  const getAccessToken = (token) => {
    setAccessToken(token)
  }

  const getPlay = (data) => {
    setTogglePlay(data)
  }

  const getCurrentTrackPlaying = (data) => {
    setTheCurrentTrackPlaying(data)
  }

  const getPremiumData = (data) => {
    setIsPremium(data)
  }

  return (
    <BrowserRouter>
      <App getTrack={getTrack} getAccessToken={getAccessToken} togglePlay={togglePlay} setTogglePlay={setTogglePlay}
      theCurrentTrackPlaying={theCurrentTrackPlaying} setCurrentLocation={setCurrentLocation} isPremium={isPremium}/>
      {currentLocation !== '/login' && currentLocation !== '/signup' && (
        <Player
          accessToken={accessToken}
          trackUri={playingTrack}
          getPlay={getPlay}
          togglePlay={togglePlay}
          getCurrentTrackPlaying={getCurrentTrackPlaying}
          getTrack={getTrack}
          getPremiumData={getPremiumData}
        />
      )}
    </BrowserRouter> 
  );
}

export default Root;

