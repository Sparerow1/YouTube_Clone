import styles from "./page.module.css";
import Link from "next/link";
import Image from "next/image";
import { getThumbnail, getVideos } from "./firebase/functions";


export default async function Home() {
  const videos = await getVideos(); // Call the getVideos function to get the list of videos


  return (
    <main>
    {
      videos.map(async (video) => (
        <Link href={`/watch?v=${video.filename}`} key={video.id}>
        <Image src={await getThumbnail(video)} alt='video' width={120} height={80}
          className={styles.thumbnail}/>
      </Link>
      ))
    }
    </main>
  );
}

export const revalidate = 30; // revalidate is a property of the default export that tells Next.js how often to revalidate the page. In this case, the page will be revalidated every 30 seconds. This is useful for pages that are updated frequently.
