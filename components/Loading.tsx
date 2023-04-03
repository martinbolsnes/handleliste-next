import Lottie from 'react-lottie-player';
import smileyJson from '../public/smiley.json';

function Loading() {
  return (
    <div className='h-screen w-screen flex flex-col items-center justify-center'>
      <Lottie
        play
        loop
        animationData={smileyJson}
        style={{ height: '200px', width: '200px' }}
      ></Lottie>
    </div>
  );
}

export default Loading;
