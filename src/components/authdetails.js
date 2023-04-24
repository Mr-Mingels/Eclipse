import React, { useEffect, useState } from "react";
import sortUp from '../assets/sortUp.png'
import '../styles/authdetails.css'



const AuthDetails = ({ displayName }) => {
   const [authUser, setAuthUser] = useState(null)
    const [openMenu, setOpenMenu] = useState(false)

    const userSignOut = () => {
        window.location = '/login'
    }

    useEffect(() => {
        if(displayName) {
            setAuthUser(displayName)
        } else {
            setAuthUser(null)
        }
    })


    const menuOpen = () => {
        if (openMenu === true) {
            setOpenMenu(false)
        } else {
            setOpenMenu(true)
        }
    }
    return (
        <div>
            {authUser &&(
                <div onClick={() => menuOpen()} className="displayNameWrapper">
                    <p className="displayName">{authUser}<img className={`sortUpImg ${openMenu ? 'menuOpen' : ''}`} src={sortUp}></img></p>
                </div>
            )}
            {openMenu &&(
                <div className="menuWrapper">
                    <button className="userSignOutBtn" onClick={userSignOut}>Sign Out</button>
                </div>
            )}
        </div>
    )
}

export default AuthDetails