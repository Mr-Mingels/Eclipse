import '../styles/savedartists.css'
import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import defaultProfileImg from '../assets/profile-avatar.png'

const SavedArtists = ({ accessToken }) => {

    const [followedArtists, setFollowedArtists] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [noResults, setNoResults] = useState(false)
    const [fetchedArtists, setFetchedArtists] = useState(false)

    const handleClick = (event) => {
        event.preventDefault();
      };
  
      const handleLoad = () => {
          setIsLoading(false)
      }

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
        setFetchedArtists(true)
        if (allArtists.length === 0) {
            setTimeout(() => {
             setNoResults(true)
             setIsLoading(false)
            }, 500);
          } else {
            setNoResults(false)
          }
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

      if (!fetchedArtists) {
        return <div className='savedArtistLoadingScreen'></div>
      }

    return (
        <div className='savedArtistsWrapper'>
            {isLoading && <div className='savedArtistLoadingScreen'></div>}
            <h1 className='savedArtistsArtistsTitle'>Artists</h1>
            <div className='savedArtistsResults'>
              {noResults && (
                <div className='savedArtistsNoResultsFound'>No Results Found</div>
              )}
                {followedArtists.map((artist, index) => (
                  <Link className='linkSavedArtistBoxWrapper' to={`/artist/${artist.id}`} onMouseEnter={handleClick} key={index}>
                      <div className="savedArtistBox">
                      {artist.images.length > 0 ? (
                          <img loading="lazy" className="savedArtistImg" onLoad={handleLoad} src={artist.images[0].url} />
                      ) : (
                          <img loading="lazy" className="savedArtistImg" onLoad={handleLoad} src={defaultProfileImg} />
                      )}
                      <p className="savedArtistName">{artist.name}</p>
                      <span className="savedArtistCategoryType">{artist.type.charAt(0).toUpperCase() + artist.type.slice(1)}</span>
                      </div>
                  </Link>
                ))}
            </div>
        </div>
    )
}

export default SavedArtists