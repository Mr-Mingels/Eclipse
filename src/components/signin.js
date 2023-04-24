import React from "react";
import '../styles/signin.css'
import { useState } from "react";
import backgroundImg from '../assets/backgroundImg.png'

const SignInPage = ({ code }) => {
    const [isLoading, setIsLoading] = useState(true);
    console.log(code)

    
    const handleImageLoad = () => {
        setIsLoading(false);
    }

    const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=70e61b9c800245ebab623f62752f8c06&response_type=code&redirect_uri=https://eclipse-spotify-clone.herokuapp.com/&scope=streaming%20user-read-email%20user-follow-read%20user-read-private%20playlist-modify-private%20user-library-modify%20user-library-read%20user-follow-modify%20playlist-modify-public%20user-read-playback-state%20user-modify-playback-state%20user-top-read`

    return (
        <div className="signInWrapper">
            {isLoading && <div className="loadingScreenSignIn">Invicible Space</div>}
            <img src={backgroundImg} className='backgroundImgSignIn' onLoad={handleImageLoad}></img>
            <div className="signInContent">
                {!isLoading && <form className="signInForm">
                <h1 className="formH1ElementSignIn">Welcome to Eclipse. To continue please connect to your Spotify Account</h1>
                    <a className="signInFormLogInBtn" href={AUTH_URL}><p>Log In</p></a>
                    <span className="signInNotice">Note: Without a premium subscription, you will not be 
                    able to play any music on the platform.</span>
                </form>}
            </div>
        </div>
    )
}

export default SignInPage