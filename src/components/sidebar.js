import React, { useState, useEffect } from "react";
import '../styles/sidebar.css'
import homeIcon from '../assets/homeIcon.png'
import searchIcon from '../assets/searchIcon.png'
import collection from '../assets/collection.png'
import addNewIcon from '../assets/addNewIcon.png'
import heart from '../assets/heart.png'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import Home from "./home";

const SideBar = ({ userId, accessToken, savedPlayListData }) => {

  const [savedPlayLists, setSavedPlayLists] = useState()
  const [playlistsUpdated, setPlaylistsUpdated] = useState(false);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [hoveringSavedPlayLists, setHoveringSavedPlayLists] = useState(false)


  const navigate = useNavigate()
  const location = useLocation()

  const handleHoverOn = (event) => {
    console.log('hovered')
    const sideBarRenderedPlayListNameWrapper = event.target.closest(".sideBarRenderedPlayListNameWrapper");
    sideBarRenderedPlayListNameWrapper.style.setProperty("--toggle-color", "white");
  }

  const handleHoverOff = (event) => {
    const sideBarRenderedPlayListNameWrapper = event.target.closest(".sideBarRenderedPlayListNameWrapper");
    sideBarRenderedPlayListNameWrapper.style.setProperty("--toggle-color", "rgb(200, 200, 200)");
  }

    const handleClick = (event) => {
        event.preventDefault();
      };

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
        return allPlaylists;
      };

      useEffect(() => {
        fetchUserPlaylists(accessToken)
      },[location])

      const createPlaylist = async (token, userId, playlistName, isPublic = true) => {
        try {
          const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: playlistName,
              public: isPublic
            })
          });
      
          if (!response.ok) {
            throw new Error(`Error creating playlist: ${response.statusText}`);
          }
      
          const data = await response.json();
          console.log('Playlist created:', data);
          return data.id; // returns the created playlist's ID
        } catch (error) {
          console.error('Error:', error);
        }
      };

      const handleCreatePlaylist = async () => {
        if (isCreatingPlaylist) return; // Prevent the function from running if a playlist is being created
        setIsCreatingPlaylist(true);
      
        if (accessToken) {
          // Fetch the latest playlists before creating a new one
          const latestPlaylists = await fetchUserPlaylists(accessToken);
      
          if (userId) {
            const playlistName = `My PlayList #${latestPlaylists.length + 1}`; // change this to the desired playlist name
            const isPublic = true; // set this to false if you want to create a private playlist
            const playlistId = await createPlaylist(accessToken, userId, playlistName, isPublic);
            console.log("Created playlist ID:", playlistId);
            console.log(latestPlaylists);
            setPlaylistsUpdated(!playlistsUpdated);
            navigate(`/playlist/${playlistId}`);
          }
        }
      
        setTimeout(() => {
          setIsCreatingPlaylist(false); // Re-enable the button after a specified duration (e.g., 3000ms or 3 seconds)
        }, 3000);
      };
      

      useEffect(() => {
        if (accessToken) {
          fetchUserPlaylists(accessToken).then((playlists) => {
            // Do something with the playlists
            setSavedPlayLists(playlists)
          });
        }
      }, [accessToken, playlistsUpdated, savedPlayListData]);

      const toggleBodyScroll = (disable) => {
        console.log('true')
        document.body.style.overflow = disable ? 'hidden' : 'auto';
      };

      const handleSavedPlayListsHoverOn = () => {
        setHoveringSavedPlayLists(true)
      }

      const handleSavedPlayListsHoverOff = () => {
        setHoveringSavedPlayLists(false)
      }
      
      useEffect(() => {
        if(hoveringSavedPlayLists) {
          toggleBodyScroll(true)
        } else {
          toggleBodyScroll(false)
        }
      },[hoveringSavedPlayLists])

      if (!savedPlayLists) {
        return <div className="loadingScreenSideBar"></div>;
    }

    return (
        <div className="sideBarWrapper">
            <div className="sideBarContent">
            <div className="sideBarListWrapper">
            <ul className="sideBarList">
                <li className="sideBarItem"><Link to='/' className="linkWrapper" onMouseDown={handleClick}>
                    <img className="imgIcons" src={homeIcon}></img><span className="linkWrapperTxt">Home</span></Link></li>
                <li className="sideBarItem"><Link to='/search' className="linkWrapper" onMouseDown={handleClick}>
                    <img src={searchIcon} className="imgIcons"></img><span className="linkWrapperTxt">Search</span></Link></li>
                <li className="sideBarItem"><Link to='/collection/playlists' className="linkWrapper" onMouseDown={handleClick}>
                    <img src={collection} className="imgIcons"></img><span className="linkWrapperTxt">Your Library</span></Link></li>
                <li className="sideBarItem" id="createPlaylist">
                    <button className="createPlayListBtn" onClick={handleCreatePlaylist} disabled={isCreatingPlaylist}>
                      <img src={addNewIcon} className="imgIcons"></img><span className="linkWrapperTxt">Create Playlist</span></button></li>
                <li className="sideBarItem"><Link to='/collection/tracks' className="linkWrapper" onMouseDown={handleClick}>
                    <img src={heart} className="imgIcons"></img><span className="linkWrapperTxt">Liked Songs</span></Link></li>
            </ul>
            <div className="playListsWrapper">
                <h3 className="playListsTitle">PlayLists</h3>
                <div className="sideBarPlayListsResultsWrapper" onMouseEnter={handleSavedPlayListsHoverOn} 
                onMouseLeave={handleSavedPlayListsHoverOff}>
                    {savedPlayLists.map((playlist, index) => (
                    <Link className="linkWrapper" to={`/playlist/${playlist.id}`} key={index}>
                      <div className="sideBarRenderedPlayListNameWrapper" onMouseEnter={(event) => handleHoverOn(event)} 
                    onMouseLeave={(event) => handleHoverOff(event)}>
                      <h2 className="sideBarRenderedPlayListName" style={{ color: "var(--toggle-color)" }} 
                      key={index}>{playlist.name}</h2>
                    </div></Link>  
                    ))}
                </div>   
            </div>
            </div>
            </div>
        </div>
    )
}

export default SideBar