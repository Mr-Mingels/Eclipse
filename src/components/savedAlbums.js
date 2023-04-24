import '../styles/savedalbums.css'
import React, { useEffect, useState } from "react";
import { Link, useLocation } from 'react-router-dom';
import musicalNote from '../assets/musicalNote.png'

const SavedAlbums = ({ accessToken, displayName }) => {

    const [savedAlbums, setSavedAlbums] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [noResults, setNoResults] = useState(false)
    const [fetchedAlbums, setFetchedAlbums] = useState(false)
    const location = useLocation()

    const handleLoad = () => {
        setIsLoading(false)
    }

    const handleClick = (event) => {
      event.preventDefault();
    };

    const fetchSavedAlbums = async (token) => {
        const limit = 50; // maximum allowed by the API
        let offset = 0;
        let allAlbums = [];
        let shouldFetchMore = true;
      
        while (shouldFetchMore) {
          const response = await fetch(`https://api.spotify.com/v1/me/albums?limit=${limit}&offset=${offset}`, {
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
          allAlbums = [...allAlbums, ...fetchedItems];
      
          if (fetchedItems.length === limit) {
            offset += limit;
          } else {
            shouldFetchMore = false;
          }
        }
        setFetchedAlbums(true)
        if (allAlbums.length === 0) {
          setTimeout(() => {
           setNoResults(true)
           setIsLoading(false)
          }, 500);
        } else {
          setNoResults(false)
        }
        return allAlbums;
      };

      useEffect(() => {
        if (accessToken) {
            fetchSavedAlbums(accessToken).then((albums) => {
            // Do something with the playlists
            console.log(albums)
            setSavedAlbums(albums)
          });
        }
      }, [accessToken]);

      useEffect(() => {
        console.log(savedAlbums)
      },[savedAlbums])
    
      if (!fetchedAlbums) {
        return <div className='savedAlbumsLoadingScreen'>Invicible Space</div>;
    }
    
    return(
        <div className='savedAlbumsSearchWrapper'>
            {isLoading && <div className='savedAlbumsLoadingScreen'>Invicible Space</div>}
            <h1 className='savedAlbumsAlbumsTitle'>Albums</h1>
            <div className='savedAlbumResults'>
            {noResults && (
                <div className='savedAlbumNoResultsFound'>No Results Found</div>
              )}
            {savedAlbums.map((album, index) => (
                       <Link className='savedAlbumsLinkAlbumBoxWrapper' to={`/album/${album.album.id}`} key={index} onMouseDown={handleClick}>
                        <div className="savedAlbumBox">
                       {album.album.images.length > 0 ? (
                         <img loading="lazy" className="savedAlbumCoverImg" onLoad={handleLoad} src={album.album.images[0].url} />
                       ) : (
                         <img loading="lazy" className="savedAlbumCoverImg" onLoad={handleLoad} src={musicalNote} />
                       )}
                         <p className="savedAlbumName">{album.album.name}</p>
                         <p className="savedAlbumDataAndArtistName">{album.album.release_date.slice(0, 4)} <span className='circleElement'>●</span> {album.album.artists[0].name}</p>
                       </div></Link>   
                      ))}
            </div>
        </div>
    )
}   

export default SavedAlbums