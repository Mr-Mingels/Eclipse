import React, { useEffect, useState } from "react";
import '../styles/player.css'
import axios from "axios";
import SpotifyPlayer from 'react-spotify-web-playback'

const Player = ({accessToken, trackUri, getPlay, getCurrentTrackPlaying, togglePlay, getPremiumData }) => {
    const [isPremium, setIsPremium] = useState(false);
    const [play, setPlay] = useState(null)

    useEffect(() => {
        setPlay(true)
        getCurrentTrackPlaying(trackUri)
    },[trackUri])

    useEffect(() => {
        if (play === null) {
        }
        if (!trackUri || play === null) return
            setPlay(togglePlay);
    },[togglePlay])

    useEffect(() =>{
        
        if (play === null) {
        }
        if (!trackUri || play === null) return
        getPlay(play)
    },[play])

    useEffect(() => {
        if(!accessToken) return
        axios.get('https://api.spotify.com/v1/me', { 
            headers: { 
                'Authorization': `Bearer ${accessToken}` 
            }
        })
            .then(response => setIsPremium(true))
            .catch((err) => {
                console.log(err);
              });
    }, [accessToken])
    
    useEffect(() => {
        getPremiumData(isPremium)
    },[isPremium])
 
    const styles = {
        bgColor: '#222',
        color: '#fff',
        trackNameColor: '#fff',
        trackArtistColor: '#ccc',
        loaderColor: '#fff',
        sliderColor: '#54345c',
        trackSeparatorColor: '#444',
        altColor: '#444',
        errorColor: 'transparent',
        premiumColor: '#ff1f1f',
        upgradeButtonColor: '#1cb954',
        upgradeButtonTextColor: '#fff',
    };


    if (!isPremium) {
        return (
            <div className="spotifyErrorPlayerWrapper">
                <div className="spotifyErrorPlayerContent">
                <div className="emptySpace">Note: Without a premium subscription, you will not be able to play any music on the platform.</div>
                <div className="playWrapper">
                    <div className="playButtonsWrapper">
                            <div className="previousBtnWrapper">
                                <svg role="img" height="16" width="16" aria-hidden="true" viewBox="0 0 16 16" data-encore-id="icon" 
                                className="previousBtn fillColor"><path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 
                                1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h1.6z"></path></svg>
                            </div>
                            <div className="pauseBtnWrapper">
                                <svg role="img" height="16" width="16" aria-hidden="true" viewBox="0 0 16 16" data-encore-id="icon" 
                                className="pauseBtn"><path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0
                                0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"></path></svg>
                            </div>
                            <div className="nextBtnWrapper">
                                <svg role="img" height="16" width="16" aria-hidden="true" viewBox="0 0 16 16" data-encore-id="icon" 
                                className="nextBtn fillColor"><path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 
                                0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z"></path></svg>
                            </div>
                        </div>
                        <div className="playBackBarWrapper">
                                <p className="playBackTimer">0.00</p>
                                <div className="playBackLineWrapper">
                                    <div className="playBackLine"></div>
                                </div>
                                <p className="playBackTimer">0.00</p>
                        </div>
                </div>
                

                <div className="soundWrapper">
                    <div className="soundContent">
                        <div className="muteBtnWrapper">
                            <svg role="presentation" height="16" width="16" aria-hidden="true" aria-label="Volume low" id="volume-icon" 
                            viewBox="0 0 16 16" data-encore-id="icon" className="muteBtn fillColor"><path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75
                            0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924
                            5.3a2.139 2.139 0 0 0 0 3.7l5.8 3.35V2.8l-5.8 3.35zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88z"></path></svg>
                        </div>
                        <div className="volumeBarWrapper">
                            <div className="volumeBar"></div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        )
    }

    return (
        <div className="spotifyPlayerWrapper">
            <SpotifyPlayer 
            token={accessToken}
            styles={styles}
            callback={state => {
                if(!state.isPlaying && state.progressMs === 0) {
                    setPlay(null)
                    getPlay(null);
                } else {
                    if (play === null) {
                        setPlay(!state.isPlaying);
                        return
                    }
                    setPlay(state.isPlaying);   
                }
            }}
            play={play}
            uris={Array.isArray(trackUri) ? [...trackUri] : trackUri ? [trackUri] : []}
            />
        </div>
    )
}

export default Player