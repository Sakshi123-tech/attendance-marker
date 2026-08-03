import React, { useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { CameraOff, Loader2, ScanFace } from 'lucide-react';

const CameraView = ({ state, setCameraReady, onDetect }) => {
  const webcamRef = useRef(null);

  // When camera is successfully initialized
  const handleUserMedia = () => {
    setCameraReady(true);
  };

  // Simulate face detection loop when in DETECTING state
  useEffect(() => {
    let timeout;
    if (state === 'DETECTING') {
      // Wait for a simulated "scan" duration before passing the frame to the parent
      timeout = setTimeout(() => {
        if (webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          onDetect(imageSrc);
        }
      }, 2000); // 2 second mock scanning time
    }
    return () => clearTimeout(timeout);
  }, [state, onDetect]);

  return (
    <div className="relative w-full h-full max-w-4xl mx-auto flex items-center justify-center animate-in zoom-in-95 duration-500">
      {/* Background Container */}
      <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-2xl flex items-center justify-center">
        
        {/* We keep Webcam mounted for PREPARING and DETECTING to avoid re-init delays */}
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          onUserMedia={handleUserMedia}
          onUserMediaError={() => setCameraReady(false)}
          videoConstraints={{
            width: 1280,
            height: 720,
            facingMode: 'user'
          }}
          className="w-full h-full object-cover mirror-x"
          style={{ transform: 'scaleX(-1)' }} // Mirror the video for natural feel
        />

        {/* Overlays based on state */}
        
        {state === 'DETECTING' && (
          <div className="absolute inset-0 border-8 border-transparent flex flex-col items-center justify-center">
             {/* Framing guides */}
             <div className="w-[400px] h-[500px] border-4 border-dashed border-indigo-400/50 rounded-[100px] flex items-center justify-center relative">
               <div className="absolute -top-12 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase shadow-lg flex items-center gap-2">
                 <ScanFace size={16} /> Look Here
               </div>
             </div>
          </div>
        )}

        {state === 'MATCHING' && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-md flex items-center justify-center overflow-hidden">
            <div className="absolute w-[200%] h-[20px] bg-indigo-500/50 blur-xl animate-[scan_1.5s_ease-in-out_infinite_alternate] shadow-[0_0_50px_rgba(99,102,241,1)] z-0"></div>
            <div className="relative z-10 flex flex-col items-center">
              <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-4" />
              <h3 className="text-3xl font-black text-slate-800 tracking-wider">Analyzing Identity</h3>
              <p className="text-slate-500 font-medium">Matching facial vectors...</p>
            </div>
          </div>
        )}

        {state === 'OFFLINE' && (
          <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center text-slate-400">
            <CameraOff className="w-16 h-16 mb-4" />
            <p className="font-semibold text-lg">Camera Unavailable</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraView;
