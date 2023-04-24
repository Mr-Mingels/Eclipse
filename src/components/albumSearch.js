import '../styles/albumSearch.css'
import React, { useEffect, useState } from "react";
import { Link, useLocation } from 'react-router-dom';
import musicalNote from '../assets/musicalNote.png'

const AlbumSearch = ({ searchInput, accessToken }) => {

    const [albums, setAlbums] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [noResults, setNoResults] = useState(false)
    const location = useLocation()

    const handleLoad = () => {
        setIsLoading(false)
    }

    const handleClick = (event) => {
      event.preventDefault();
    };

    useEffect(() => {
      console.log(albums)
    },[albums])

      useEffect(() => { 
        if (accessToken === '') {
            console.log('returned')
            return;
        }
        searchAlbums(searchInput)
        console.log(searchInput)
    },[searchInput, location, accessToken])

    
    const searchAlbums = async (input) => {
        const searchParameters = {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          };
        try {
          const response = await fetch(
            `https://api.spotify.com/v1/search?q=${input}&type=album&limit=50`,
            searchParameters
          );
        const data = await response.json();
       const newTopResults = [...data.albums.items];
        
        newTopResults.sort((a, b) => b.popularity - a.popularity)
          setAlbums(newTopResults)
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
        }
      };
    
    return(
        <div className='albumsSearchWrapper'>
            {isLoading && <div className='albumsLoadingScreen'>Invicible Space</div>}
            <div className='albumResults'>
            {noResults && (
                <div className='albumNoResultsFound'>No Results Found</div>
              )}
            {albums.map((album, index) => (
                       <Link className='linkAlbumBoxWrapper' to={`/album/${album.id}`} key={index} onMouseDown={handleClick}>
                        <div className="albumBox">
                       {album.images.length > 0 ? (
                         <img loading="lazy" className="albumCoverImg" onLoad={handleLoad} src={album.images[0].url} />
                       ) : (
                         <img loading="lazy" className="albumCoverImg" onLoad={handleLoad} src={musicalNote} />
                       )}
                         <p className="albumName">{album.name}</p>
                         <p className="albumDataAndArtistName">{album.release_date.slice(0, 4)} <span className='circleElement'>●</span> {album.artists[0].name}</p>
                       </div></Link>   
                      ))}
            </div>
        </div>
    )
}

export default AlbumSearch