import smileyJson from '../public/smiley.json';
import dynamic from 'next/dynamic';

// Import react-lottie-player dynamically, disabling SSR
const LottiePlayer = dynamic(() => import('react-lottie-player'), {
  ssr: false,
});

function Loading() {
  return (
    <div className='h-screen w-screen flex flex-col items-center justify-center'>
      <LottiePlayer
        play
        loop
        animationData={smileyJson}
        style={{ height: '200px', width: '200px' }}
      ></LottiePlayer>
    </div>
  );
}

export default Loading;
