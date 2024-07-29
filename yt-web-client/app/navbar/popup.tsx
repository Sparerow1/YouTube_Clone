"use client";
import React, { Fragment, Suspense } from "react";
import Popup from "reactjs-popup";
import 'reactjs-popup/dist/index.css';
import styles from "./popup.module.css";
import Select from "./select";


export default function PopUp() {


    return (
        <Popup trigger= {
            <label htmlFor="edit" className={styles.editButton} >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                </svg>
            </label>
        } 
        position="right center" modal nested>{

            <Fragment>
                <div>
                    Update Video Information
                </div>
                <div>
                    <Suspense fallback={<div>Loading...</div>}>
                        <Select/>
                    </Suspense>
                </div>
               


            </Fragment>
        }
                
        </Popup>
        
    ); // this is the popup component that is used to display the popup content
}
