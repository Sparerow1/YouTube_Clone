'use client'; //This is the navbar component that appears at the top of the page and contains the logo and sign in button
//use client is used to indicate that this file is a client side file
import Image from 'next/image';
import Link from 'next/link';
import styles from './navbar.module.css';
import SignIn from './sign-in';
import { onAuthStateChangedHelper } from '../firebase/firebase';
import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import Upload from './upload';
import PopUp from './popup';

export default function Navbar() {
    //init user state
    const [user, setUser] = useState<User | null>(null); //This is the user state that is used to store the user information

    useEffect(() => { //This is the useEffect hook that is used to set the user state
        const unsubscribe = onAuthStateChangedHelper((user) => {
            setUser(user);
        });

        return () => unsubscribe(); //This is the cleanup function that is used to unsubscribe the user
    });
    return (//This is the navigation bar that appears at the top of the page
        <nav className={styles.nav}> 
            <Link href="/">
                    <Image  width={90} height={20}
                        src="/youtube-logo.svg" alt="YouTube Logo"/>
            </Link>
             {
                user && <Upload /> // This is the upload button that appears on the navbar if the user is signed in
             }
             {
                user && <PopUp /> // This is the popup button that appears on the navbar if the user is signed in
             }
            <SignIn user={user}/>
        </nav>
    )// returns the logo and the sign in button on the navbar
}