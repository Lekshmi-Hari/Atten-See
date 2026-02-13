import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, Eye, EyeOff, Phone, AlertCircle, TrendingUp } from 'lucide-react';
import { FocusDetector } from '../services/FocusDetector';
import { FocusScoreCalculator } from '../services/FocusScoreCalculator';

const StudyMode = () => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentState, setCurrentState] = useState('focused');
  const [stats, setStats] = useState({
    score: 100,
    focusedTime: 0,
    distractedTime: 0,
    awayTime: 0,
    phoneDetections: 0,
    totalTime: 0
  });
  const [alerts, setAlerts] = useState([]);
  const [showCamera, setShowCamera] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const calculatorRef = useRef(null);
  const animationRef = useRef(null);
  const lastStateRef = useRef('focused');
  const lastStateChangeRef = useRef(Date.now());

  useEffect(() => {
    calculatorRef.current = new FocusScoreCalculator();
    
    return () => {
      stopCamera();
      if (detectorRef.current) {
        detectorRef.current.destroy();
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setIsInitializing(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = resolve;
        });
        
        await videoRef.current.play();
      }
      
      // Initialize AI detector
      if (!detectorRef.current) {
        detectorRef.current = new FocusDetector();
        await detectorRef.current.initialize();
      }
      
      setIsInitializing(false);
      return true;
    } catch (error) {
      console.error('Error accessing camera:', error);
      setAlerts(prev => [...prev, {
        type: 'error',
        message: 'Could not access camera. Please grant permission.'
      }]);
      setIsInitializing(false);
      return false;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const startSession = async () => {
    const cameraStarted = await startCamera();
    if (!cameraStarted) return;
    
    setIsActive(true);
    setIsPaused(false);
    calculatorRef.current.start();
    lastStateChangeRef.current = Date.now();
    
    processFrame();
  };

  const pauseSession = () => {
    setIsPaused(true);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const resumeSession = () => {
    setIsPaused(false);
    lastStateChangeRef.current = Date.now();
    processFrame();
  };

  const endSession = () => {
    setIsActive(false);
    setIsPaused(false);
    stopCamera();
    
    // Save session to Firebase here
    const finalStats = calculatorRef.current.getStats();
    console.log('Session ended:', finalStats);
    
    // Show summary modal or redirect to analytics
  };

  const processFrame = async () => {
    if (!isActive || isPaused || !videoRef.current || !detectorRef.current) {
      return;
    }

    try {
      const timestamp = performance.now();
      const results = await detectorRef.current.analyzeFrame(videoRef.current, timestamp);
      
      // Update current state
      setCurrentState(results.focusState);
      
      // Record state change duration
      const now = Date.now();
      const duration = now - lastStateChangeRef.current;
      
      if (results.focusState !== lastStateRef.current) {
        calculatorRef.current.recordState(lastStateRef.current, duration);
        lastStateRef.current = results.focusState;
        lastStateChangeRef.current = now;
      }
      
      // Handle phone detection
      if (results.phoneDetected) {
        calculatorRef.current.recordPhoneDetection();
      }
      
      // Handle alerts
      if (results.alerts && results.alerts.length > 0) {
        setAlerts(prev => [...results.alerts, ...prev].slice(0, 5));
      }
      
      // Update stats every second
      const updatedStats = calculatorRef.current.getStats();
      setStats(updatedStats);
      
      // Draw visualization on canvas
      drawVisualization(results);
      
      // Check for achievements
      const achievements = calculatorRef.current.checkForStreaks();
      if (achievements.length > 0) {
        setAlerts(prev => [...achievements, ...prev].slice(0, 5));
      }
      
    } catch (error) {
      console.error('Error processing frame:', error);
    }

    // Continue processing
    animationRef.current = requestAnimationFrame(processFrame);
  };

  const drawVisualization = (results) => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Draw face indicator
    if (results.faceDetected) {
      ctx.strokeStyle = results.focusState === 'focused' ? '#10b981' : 
                        results.focusState === 'distracted' ? '#f59e0b' : '#ef4444';
      ctx.lineWidth = 3;
      ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);
    }
    
    // Draw phone warning
    if (results.phoneDetected) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📱 Phone Detected', canvas.width / 2, canvas.height / 2);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getFocusColor = () => {
    switch (currentState) {
      case 'focused': return 'text-focus-green';
      case 'distracted': return 'text-focus-yellow';
      case 'away': return 'text-focus-red';
      default: return 'text-gray-500';
    }
  };

  const getFocusLabel = () => {
    switch (currentState) {
      case 'focused': return 'Focused';
      case 'distracted': return 'Distracted';
      case 'away': return 'Away';
      default: return 'Initializing';
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Mode</h1>
          <p className="text-gray-600">AI-powered focus tracking and behavior analysis</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Video Panel */}
          <div className="col-span-2 space-y-6">
            <div className="card">
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                {!isActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center">
                      <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-300 text-lg">Click Start to begin your study session</p>
                    </div>
                  </div>
                )}
                
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover ${showCamera ? 'block' : 'hidden'}`}
                  playsInline
                  muted
                />
                
                <canvas
                  ref={canvasRef}
                  className={`absolute inset-0 w-full h-full ${!showCamera ? 'block' : 'hidden'}`}
                />
                
                {/* Status Overlay */}
                {isActive && (
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2">
                      <div className={`focus-indicator ${
                        currentState === 'focused' ? 'focus-green' :
                        currentState === 'distracted' ? 'focus-yellow' :
                        'focus-red'
                      }`} />
                      <span className={`font-medium ${getFocusColor()}`}>
                        {getFocusLabel()}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => setShowCamera(!showCamera)}
                      className="bg-black/60 backdrop-blur-sm rounded-lg p-2 text-white hover:bg-black/80 transition"
                    >
                      {showCamera ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mt-6">
                {!isActive ? (
                  <button
                    onClick={startSession}
                    disabled={isInitializing}
                    className="btn-primary flex items-center gap-2 px-8 py-3 text-lg"
                  >
                    <Play className="w-5 h-5" />
                    {isInitializing ? 'Initializing AI...' : 'Start Session'}
                  </button>
                ) : (
                  <>
                    {isPaused ? (
                      <button
                        onClick={resumeSession}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Play className="w-5 h-5" />
                        Resume
                      </button>
                    ) : (
                      <button
                        onClick={pauseSession}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <Pause className="w-5 h-5" />
                        Pause
                      </button>
                    )}
                    
                    <button
                      onClick={endSession}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition flex items-center gap-2"
                    >
                      <Square className="w-5 h-5" />
                      End Session
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Alerts Feed */}
            {alerts.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Live Alerts
                </h3>
                <div className="space-y-2">
                  {alerts.slice(0, 3).map((alert, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        alert.type === 'error' ? 'bg-red-50 text-red-700' :
                        alert.type === 'phone' ? 'bg-orange-50 text-orange-700' :
                        alert.type === 'streak' ? 'bg-green-50 text-green-700' :
                        'bg-yellow-50 text-yellow-700'
                      }`}
                    >
                      <p className="text-sm font-medium">
                        {alert.icon && <span className="mr-2">{alert.icon}</span>}
                        {alert.title || alert.message}
                      </p>
                      {alert.description && (
                        <p className="text-xs mt-1 opacity-80">{alert.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Timer */}
            <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white">
              <p className="text-sm opacity-90 mb-2">Session Time</p>
              <p className="text-4xl font-bold font-mono">{formatTime(stats.totalTime)}</p>
            </div>

            {/* Focus Score */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Focus Score</h3>
                <TrendingUp className="w-5 h-5 text-primary-600" />
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-primary-600 mb-2">{stats.score}%</div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
                    style={{ width: `${stats.score}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Time Breakdown */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Time Breakdown</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Focused</span>
                    <span className="text-sm font-medium text-focus-green">
                      {formatTime(stats.focusedTime)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-focus-green transition-all"
                      style={{ width: `${stats.focusedPercentage}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Distracted</span>
                    <span className="text-sm font-medium text-focus-yellow">
                      {formatTime(stats.distractedTime)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-focus-yellow transition-all"
                      style={{ width: `${stats.distractedPercentage}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Away</span>
                    <span className="text-sm font-medium text-focus-red">
                      {formatTime(stats.awayTime)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-focus-red transition-all"
                      style={{ width: `${stats.awayPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Phone Detections */}
            <div className="card bg-orange-50 border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <Phone className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-orange-900">Phone Detections</h3>
              </div>
              <p className="text-3xl font-bold text-orange-600">{stats.phoneDetections}</p>
              <p className="text-xs text-orange-700 mt-1">Keep your phone out of sight!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyMode;