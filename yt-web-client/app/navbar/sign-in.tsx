'use client'; //This is the sign in component that is used to sign in the user

import { Fragment } from "react";
import styles from "./sign-in.module.css";
import { signInWithGoogle, signOut } from "../firebase/firebase";
import { User } from "firebase/auth";

interface SignInProps { //This is the interface that is used to define the props for the sign in component
    user: User | null;
}

export default function SignIn({user}: SignInProps) { //This is the sign in component that is used to sign in the user

    return (
        <Fragment>
            {user ? //This is the conditional rendering that is used to check if the user is signed in or not
                (//This is the sign out button that appears on the navbar
                    //This is rendered when the user is signed in      
                <button className={styles.signin} onClick={(signOut)}>
                    Sign Out 
                </button>

                ): (//This is the sign in button that appears on the navbar
                    //This is rendered when the user is not signed in
                <button className={styles.signin} onClick={signInWithGoogle}>
                    Sign In
                </button>
                )

            }



        </Fragment>
    )
}