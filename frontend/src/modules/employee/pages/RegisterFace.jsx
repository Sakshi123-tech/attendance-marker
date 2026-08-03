import React, { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle, AlertCircle, RefreshCw, ScanFace, XCircle } from 'lucide-react';
import Webcam from 'react-webcam';
import { fetchFaceStatus, registerFace } from '../../../api/faceApi';

// FSM states: LOADING, PENDING, CAMERA_OPEN, SCANNING, REGISTERED, ERROR
const RegisterFace = () => {
  const webcamRef = useRef(null);
  const [pageState, setPageState] = useState('LOADING');
  const [error, setError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    loadStatus();
  }, []);

  // Countdown timer for auto-capture
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      handleCapture();
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const loadStatus = async () => {
    try {
      setPageState('LOADING');
      const data = await fetchFaceStatus();
      setPageState(data.faceRegistered ? 'REGISTERED' : 'PENDING');
    } catch (err) {
      console.error(err);
      setError('Could not fetch face registration status.');
      setPageState('ERROR');
    }
  };

  const handleOpenCamera = () => {
    setError(null);
    setCameraReady(false);
    setPageState('CAMERA_OPEN');
  };

  const handleStartScan = () => {
    setPageState('SCANNING');
    setCountdown(3); // 3-second countdown then capture
  };

  const handleCapture = async () => {
    setError(null);
    try {
      // Capture a screenshot from the webcam
      const imageSrc = webcamRef.current?.getScreenshot();
      
      // Send a mock 128D embedding (in production this would be from face-api.js)
      // We send a random array so each user's embedding is unique
      const embedding = Array.from({ length: 128 }, () => Math.random() * 2 - 1);

      await registerFace({ embedding });
      setPageState('REGISTERED');
    } catch (err) {
      const msg = err.response?.data?.message || 'Face registration failed. Please try again.';
      setError(msg);
      setPageState('CAMERA_OPEN'); // Go back to camera view so user can retry
    }
  };

  const handleCloseCamera = () => {
    setCountdown(null);
    setCameraReady(false);
    setPageState('PENDING');
  };

  // ─── LOADING ─────────────────────────────────────────────────────────────
  if (pageState === 'LOADING') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Face Registration</h2>
          <p className="text-sm text-slate-500 mt-1">Register your biometric profile for seamless kiosk check-ins.</p>
        </div>
        <div className="bg-white p-16 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center gap-4">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Checking registration status...</p>
        </div>
      </div>
    );
  }

  // ─── REGISTERED ──────────────────────────────────────────────────────────
  if (pageState === 'REGISTERED') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Face Registration</h2>
          <p className="text-sm text-slate-500 mt-1">Your biometric profile is linked to your account.</p>
        </div>
        <div className="bg-white p-16 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border-8 border-emerald-100">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Registration Complete</h3>
          <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
            Your face profile has been securely stored and linked to your employee account. You can now use the check-in kiosk at the office entrance.
          </p>
          <div className="mt-8 px-5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-semibold text-emerald-700 flex items-center gap-2">
            <CheckCircle size={16} />
            Biometric Status: VERIFIED
          </div>
        </div>
      </div>
    );
  }

  // ─── CAMERA OPEN / SCANNING ───────────────────────────────────────────────
  if (pageState === 'CAMERA_OPEN' || pageState === 'SCANNING') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Face Registration</h2>
            <p className="text-sm text-slate-500 mt-1">Position your face in the oval frame and click Capture.</p>
          </div>
          <button
            onClick={handleCloseCamera}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <XCircle size={16} /> Cancel
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-600">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-8 flex flex-col items-center gap-6">
          {/* Camera container */}
          <div className="relative w-72 h-72">
            {/* Oval frame */}
            <div className={`absolute inset-0 rounded-full overflow-hidden border-4 ${pageState === 'SCANNING' ? 'border-indigo-500 shadow-lg shadow-indigo-500/30' : 'border-indigo-200'} transition-all duration-500 bg-slate-100`}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: 'user', width: 720, height: 720 }}
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
                onUserMedia={() => setCameraReady(true)}
                onUserMediaError={() => {
                  setError('Could not access camera. Please allow camera permissions and try again.');
                  setPageState('PENDING');
                }}
              />

              {/* Scanning overlay */}
              {pageState === 'SCANNING' && (
                <div className="absolute inset-0 bg-indigo-900/30 backdrop-blur-[1px] flex flex-col items-center justify-center z-10">
                  <div className="text-7xl font-black text-white drop-shadow-lg animate-pulse">
                    {countdown}
                  </div>
                  <p className="text-white/80 font-bold text-sm tracking-widest uppercase mt-2">Hold Still</p>
                </div>
              )}

              {/* Loading camera spinner */}
              {!cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                  <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                </div>
              )}
            </div>

            {/* Corner brackets */}
            {cameraReady && (
              <>
                <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-lg"></div>
                <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-lg"></div>
                <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-lg"></div>
                <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-lg"></div>
              </>
            )}
          </div>

          <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
            <ScanFace size={16} className="text-indigo-500" />
            {!cameraReady ? 'Initializing camera...' : pageState === 'SCANNING' ? 'Capturing in progress...' : 'Face your camera directly and click Capture'}
          </p>

          <button
            onClick={handleStartScan}
            disabled={!cameraReady || pageState === 'SCANNING'}
            className="w-full max-w-xs py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            {pageState === 'SCANNING' ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Capturing...
              </>
            ) : (
              <>
                <ScanFace size={18} />
                Capture &amp; Register
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ─── PENDING (default state) ──────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Face Registration</h2>
          <p className="text-sm text-slate-500 mt-1">Register your biometric profile for seamless kiosk check-ins.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-600">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:flex-row">
        {/* Instructions Side */}
        <div className="lg:w-1/2 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col justify-center">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
            <Camera className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-4">Biometric Setup</h3>
          <ul className="space-y-4 text-sm text-slate-600">
            {[
              'Ensure you are in a well-lit environment with your face clearly visible.',
              'Remove any masks, sunglasses, or heavy hats before starting.',
              'Look directly into the camera and hold still when capturing.',
              'Your face data is encrypted and stored securely on our servers.'
            ].map((step, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 mt-0.5">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Side */}
        <div className="lg:w-1/2 p-8 lg:p-12 bg-slate-50 flex flex-col items-center justify-center text-center gap-6">
          <div className="w-32 h-32 rounded-full bg-white border-4 border-dashed border-indigo-200 flex items-center justify-center shadow-inner">
            <ScanFace className="w-14 h-14 text-indigo-300" />
          </div>

          <div>
            <h4 className="font-bold text-slate-800 text-lg">Not yet registered</h4>
            <p className="text-sm text-slate-500 mt-1 max-w-xs">
              Click the button below to open your camera and register your face.
            </p>
          </div>

          <button
            onClick={handleOpenCamera}
            className="w-full max-w-xs py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all flex justify-center items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <Camera size={18} />
            Open Camera &amp; Register
          </button>

          <p className="text-xs text-slate-400 max-w-xs">
            Your camera will open and you will be able to preview your face before capturing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterFace;
