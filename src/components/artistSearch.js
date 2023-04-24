import '../styles/artistSearch.css'
import React, { useEffect, useState } from "react";
import { Link, useLocation } from 'react-router-dom';
import defaultProfileImg from '../assets/profile-avatar.png'

const ArtistSearch = ({ searchInput, accessToken }) => {

    const [artists, setArtists] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [noResults, setNoResults] = useState(false)
    const location = useLocation()

    const handleClick = (event) => {
      event.preventDefault();
    };

    const handleLoad = () => {
        setIsLoading(false)
    }

    useEffect(() => { 
        if (accessToken === '') {
            console.log('returned')
            return;
        }
        searchArtists(searchInput)
        console.log(searchInput)
    },[searchInput, location, accessToken])


    const searchArtists = async (input) => {
        const searchParameters = {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          };
        try {
          const response = await fetch(
            `https://api.spotify.com/v1/search?q=${input}&type=artist&limit=50`,
            searchParameters
          );
        const data = await response.json();
        console.log(data.artists.items.length)
        const newTopResults = [...data.artists.items];
        
        newTopResults.sort((a, b) => b.popularity - a.popularity)
          setArtists(newTopResults)
          if (newTopResults.length === 0) {
            setTimeout(() => {
             setNoResults(true)
            }, 500);
          } else {
            setNoResults(false)
          }
        } catch (error) {
              console.error(error)
              setTimeout(() => {
                setNoResults(true)
              }, 500);
            };
    }

    return(
        <div className='artistsSearchWrapper'>
            {isLoading && <div className='artistLoadingScreen'>Invicible Space</div>}
            <div className='artistsResults'>
              {noResults && (
                <div className='artistsNoResultsFound'>No Results Found</div>
              )}
                {artists.map((artist, index) => (
                  <Link className='linkArtistBoxWrapper' to={`/artist/${artist.id}`} onMouseEnter={handleClick} key={index}>
                      <div className="artistBox">
                      {artist.images.length > 0 ? (
                          <img loading="lazy" className="artistImg" onLoad={handleLoad} src={artist.images[0].url} />
                      ) : (
                          <img loading="lazy" className="artistImg" onLoad={handleLoad} src={defaultProfileImg} />
                      )}
                      <p className="artistName">{artist.name}</p>
                      <span className="categoryType">{artist.type.charAt(0).toUpperCase() + artist.type.slice(1)}</span>
                      </div>
                  </Link>
                ))}
            </div>
        </div>
    )
}

export default ArtistSearch;