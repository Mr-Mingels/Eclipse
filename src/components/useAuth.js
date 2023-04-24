import React, { useEffect, useState } from "react";
import axios from "axios";


export default function useAuth(code) {
    const [accessToken, setAccessToken] = useState(null)
    const [refreshToken, setRefreshToken] = useState(null)
    const [expiresIn, setExpiresIn] = useState(null)
    const [displayName, setDisplayName] = useState(null);
    const [userId, setUserId] = useState(null)

    useEffect(() => {
            if(code) {
                axios.post('https://eclipse-spotify-clone.herokuapp.com/login', {
                    code,
                })
                .then(res => {
                    setAccessToken(res.data.accessToken)
                    setRefreshToken(res.data.refreshToken)
                    setExpiresIn(res.data.expiresIn)
                    window.history.pushState({}, null, '/');
                })
                .catch((err) => {
                    console.log(err)
                })
            }
          },[code])

    useEffect(() => {
      if(!refreshToken || !expiresIn) return
        const interval = setInterval(() => {
            console.log('hi')
          axios
            .post("https://eclipse-spotify-clone.herokuapp.com/refresh", {
              refreshToken,
            })
            .then((res) => {
              setAccessToken(res.data.accessToken);
              setExpiresIn(res.data.expiresIn);
            })
            .catch((err) => {
              console.log(err);
            });
        }, (expiresIn - 60) * 1000);
      
        return () => clearInterval(interval);
      }, [refreshToken, expiresIn]);

    useEffect(() => {
        if (!accessToken) return;
        axios
          .get("https://api.spotify.com/v1/me", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
          .then((res) => {
            if(!res.data.display_name) {
              setDisplayName(res.data.id)
            } else {
            setDisplayName(res.data.display_name);
            }
            setUserId(res.data.id)
          })
          .catch((err) => {
            console.log(err);
          });
      }, [accessToken, displayName]);

    return { accessToken, displayName, userId }
}