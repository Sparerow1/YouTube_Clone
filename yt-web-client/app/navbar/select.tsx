import Link from "next/link";
import { getAuthenticatdUser } from "../firebase/firebase";
import { getVideosByUser } from "../firebase/functions";
import { getThumbnail } from "../firebase/functions";
import Image from "next/image";
import styles from "./select.module.css";

export default async function Select() {
        
    const user = getAuthenticatdUser(); // get the uid of the user that is currently logged in, if it's null, assign an empty object
    const uid = user?.uid ?? '';
    const videoInfo = await getVideosByUser(uid); // get the list of videos uploaded by the user
    return (
        <div>
        {
            
            videoInfo.map(async (info) => (
                <Link href = {`/edit?v=${info.filename}`} key={info.id}>
                    <Image src={await getThumbnail(info)} alt='video' width={120} height={80} className={styles.thumbnail}/>
                    
                </Link>))
        }
    </div>

    );
}