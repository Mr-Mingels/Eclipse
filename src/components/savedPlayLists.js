import '../styles/savedplaylists.css'
import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import musicalNote from '../assets/musicalNote.png'

const SavedPlayLists = ({ accessToken, displayName, getSavedPlayListsData }) => {

    const [likedSongs, setLikedSongs] = useState()
    const [savedPlayLists, setSavedPlayLists] = useState()
    const [isLoading, setIsLoading] = useState(true)
    const [fetchedSavedPlayLists, setFetchedPlayLists] = useState(false)

    const handleClick = (event) => {
        event.preventDefault();
      };

    const handleLoad = () => {
        setIsLoading(false);
    }

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
          if (allLikedSongs.length === 0) {
            setLikedSongs([]);
          }
          return;
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
    
      if (allLikedSongs.length === 0) {
        setLikedSongs([]);
      } else {
        setLikedSongs(allLikedSongs);
      }
    };
    
      
    useEffect(() => {
        if (displayName && accessToken) {
            fetchLikedSongs(accessToken);
        }
    }, [displayName, accessToken]);

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
      }, [accessToken]);

      useEffect(() => {
        getSavedPlayListsData(savedPlayLists)
      },[savedPlayLists])
      

    if (!likedSongs || !fetchedSavedPlayLists) {
        return <div className="loadingSavedPlayLists"></div>;
    }
    
    return (
        <div className='savedPlayListsWrapper'>
          {isLoading && <div className="loadingSavedPlayLists"></div>}
            <h1 className='savedPlayListsPlayListsTitle'>Playlists</h1>
            <div className='savedPlayListsContent'>
             <Link className='savedPlayListsLikedSongsLink' to='/collection/tracks'>
                <div className='savedPlayListsLikedSongsBox'>
                    <span className='savedPlayListsLikedSongsTitle'>Liked Songs</span>
                    <span className='savedPlayListsNumberOfTracksLiked'>{likedSongs.length} liked songs</span>
                </div>
             </Link>   
             {savedPlayLists.map((playlists, index) => (
                    <Link className='linkSavedPlayListBoxWrapper' key={index} to={`/playlist/${playlists.id}`} onMouseDown={handleClick}>
                          <div className="savedPlayListBox" key={index}>
                          {playlists.images.length > 0 ? (
                              <img loading="lazy" className="savedPlayListCoverImg" onLoad={handleLoad} src={playlists.images[0].url} />  
                          ) : (
                              <img loading="lazy" className="savedPlayListCoverImg" onLoad={handleLoad} src={musicalNote}/>
                          )}
                            <p className="savedPlayListName">{playlists.name}</p>
                            {playlists.owner === null ? (
                              <div></div>
                            ) : (
                               <p className="savedPlayListDataAndArtistName">{playlists.owner.display_name} </p>
                            )}
                          </div>
                    </Link>
                      ))}
            </div>
        </div>
    )
}

export default SavedPlayLists