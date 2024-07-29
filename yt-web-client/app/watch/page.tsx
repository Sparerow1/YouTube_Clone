"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from 'react';

export default function Watch() {
    const videoPrefix = "https://storage.googleapis.com/yc-processed-videos/"; // define the video prefix
    const videoSrc = useSearchParams().get("v"); // get the video source from the search params


    return (
        <Suspense fallback = {<div>Loading...</div>}>
            <div>
                <h1>Watch Page</h1>
                <video controls src={videoPrefix + videoSrc} />
            </div>
        </Suspense>
    )
}