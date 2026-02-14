import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, Eye, EyeOff, Phone, AlertCircle, TrendingUp, Loader2, Zap, Activity, Clock, ShieldCheck, Sparkles, ChevronRight, Target } from 'lucide-react';
import { FocusDetector } from '../services/FocusDetector';
import { FocusScoreCalculator } from '../services/FocusScoreCalculator';
import { sessionService } from '../services/api';

const StudyMode = () => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentState, setCurrentState] = useState('focused');
  const [elapsedTime, setElapsedTime] = useState(0); // Timer state
  const [stats, setStats] = useState({
    score: 100,
    focusedTime: 0,
    distractedTime: 0,
    awayTime: 0,
    phoneDetections: 0,
    totalTime: 0,
    focusedPercentage: 100,
    distractedPercentage: 0,
    awayPercentage: 0
  });

  const [alerts, setAlerts] = useState([]);
  const [showCamera, setShowCamera] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [subject, setSubject] = useState('General Focus');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const calculatorRef = useRef(new FocusScoreCalculator());
  const animationRef = useRef(null);
  const timerRef = useRef(null); // Timer reference
  const sessionStartRef = useRef(null); // Session start time
  const audioContextRef = useRef(null);
  const alertAudioRef = useRef(null);

  // Initialize Web Audio API for alert sounds
  const playAlertSound = (type = 'warning') => {
    try {
      // Try using Web Audio API to generate a beep
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const now = ctx.currentTime;
      
      if (type === 'critical') {
        // Phone detection - rapid beeping
        for (let i = 0; i < 3; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 800;
          gain.gain.setValueAtTime(0.3, now + i * 0.2);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.2 + 0.15);
          osc.start(now + i * 0.2);
          osc.stop(now + i * 0.2 + 0.15);
        }
      } else {
        // Warning - single tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 600;
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (err) {
      console.warn('Audio alert failed:', err);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Timer effect - updates every second
  useEffect(() => {
    if (!isActive || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Set start time on first run
    if (!sessionStartRef.current) {
      sessionStartRef.current = Date.now();
    }

    // Update timer every 100ms for smooth display
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      setElapsedTime(elapsed);
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isPaused]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, frameRate: 30 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        return new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().then(() => {
              console.log('✅ Camera stream started, video ready');
              resolve(true);
            }).catch((err) => {
              console.error('Video play error:', err);
              resolve(false);
            });
          };
        });
      }
      streamRef.current = stream;
      return true;
    } catch (error) {
      console.error('Camera Access Failed:', error);
      setAlerts(prev => [{
        type: 'error',
        message: 'Neural Feed Offline',
        description: 'Sensor access denied. Check system permissions.',
        icon: '⚠️',
        timestamp: Date.now()
      }, ...prev]);
      return false;
    }
  };

  const startSession = async () => {
    setIsInitializing(true);

    const cameraStarted = await startCamera();
    if (!cameraStarted) {
      setIsInitializing(false);
      return;
    }

    try {
      if (!detectorRef.current) {
        detectorRef.current = new FocusDetector();
        await detectorRef.current.initialize();
      }

      setIsActive(true);
      setIsPaused(false);
      calculatorRef.current.start();
      processFrame();
    } catch (err) {
      console.error('AI Boot Failed:', err);
      setAlerts(prev => [{
        type: 'error',
        message: 'AI Core Fault',
        description: 'Neural models failed to initialize.',
        icon: '🚫',
        timestamp: Date.now()
      }, ...prev]);
    } finally {
      setIsInitializing(false);
    }
  };

  const pauseSession = () => {
    setIsPaused(true);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const resumeSession = () => {
    setIsPaused(false);
    processFrame();
  };

  const endSession = async () => {
    setIsActive(false);
    setElapsedTime(0);
    sessionStartRef.current = null;
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    const finalStats = calculatorRef.current.getStats();

    try {
      const durationMinutes = Math.round(elapsedTime / 60);
      await sessionService.create({
        subject,
        duration: durationMinutes,
        focusScore: finalStats.score,
        detections: {
          phone: finalStats.phoneDetections,
          distracted: Math.round(finalStats.distractedTime),
          focused: Math.round(finalStats.focusedTime),
          away: Math.round(finalStats.awayTime)
        },
        analytics: {
          hourlyFocus: Array(24).fill(0),
          recoveryRate: finalStats.score > 70 ? 0.85 : 0.65,
          distractionResistance: 100 - finalStats.distractionEvents * 5
        }
      });
      
      setAlerts(prev => [{
        type: 'success',
        message: 'Session Saved Successfully',
        description: `${durationMinutes} min session saved with ${finalStats.score}% focus score`,
        icon: '✅',
        timestamp: Date.now()
      }, ...prev]);
    } catch (error) {
      console.error('Data Sync Failed:', error);
      setAlerts(prev => [{
        type: 'error',
        message: 'Save Failed',
        description: 'Could not save session data',
        icon: '❌',
        timestamp: Date.now()
      }, ...prev]);
    }
  };

  const processFrame = async () => {
    if (!isActive || isPaused || !videoRef.current || !detectorRef.current) {
      return;
    }

    // Wait for video to be properly playing
    if (videoRef.current.paused || videoRef.current.ended || videoRef.current.readyState < 2) {
      console.log('⏳ Waiting for video to be ready...');
      animationRef.current = requestAnimationFrame(processFrame);
      return;
    }

    try {
      const results = await detectorRef.current.analyzeFrame(videoRef.current, performance.now());

      if (results) {
        setCurrentState(results.focusState);

        // Update calculator with detector results
        calculatorRef.current.recordState(results.focusState, 100);

        if (results.phoneDetected) {
          calculatorRef.current.recordPhoneDetection();
        }

        // Update state for UI
        const currentStats = calculatorRef.current.getStats();
        setStats({
          score: currentStats.score,
          focusedTime: currentStats.focusedTime,
          distractedTime: currentStats.distractedTime,
          awayTime: currentStats.awayTime,
          phoneDetections: currentStats.phoneDetections,
          totalTime: currentStats.totalTime,
          focusedPercentage: currentStats.focusedPercentage,
          distractedPercentage: currentStats.distractedPercentage,
          awayPercentage: currentStats.awayPercentage
        });

        // Handle alerts
        if (results.alerts && results.alerts.length > 0) {
          setAlerts(prev => [...results.alerts.map(a => ({ ...a, timestamp: Date.now(), icon: a.type === 'phone' ? '📱' : '⚠️' })), ...prev].slice(0, 5));

          // Critical alerts play sound
          if (results.alerts.some(a => a.type === 'phone')) {
            playAlertSound('critical');
          } else if (results.alerts.some(a => a.type === 'critical' || a.type === 'warning')) {
            playAlertSound('warning');
          }
        }

        drawVisualization(results);
      }

    } catch (error) {
      console.error('Telemetry Fault:', error);
    }

    animationRef.current = requestAnimationFrame(processFrame);
  };

  const drawVisualization = (results) => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw HUD Elements
    if (results.distractionFound && results.distractionBox) {
      const [x, y, w, h] = results.distractionBox;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, w, h);

      // Alert Corners
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 14px "JetBrains Mono"';
      ctx.fillText(`🚨 PROHIBITED: ${results.distractionType.toUpperCase()}`, x, y - 10);
    }

    // Scanning Line Effect
    const scanPos = (Date.now() % 2000) / 2000 * canvas.height;
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, scanPos);
    ctx.lineTo(canvas.width, scanPos);
    ctx.stroke();
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header HUD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Live Focus Tracking</p>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">Study <span className="text-primary-500">Session</span></h1>
          
          {isActive && (
            <div className="mt-4 flex items-center gap-3">
              <input
                type="text"
                placeholder="Subject (e.g., Math, Physics)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isActive}
                className="px-4 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500/50"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-3 rounded-2xl backdrop-blur-md">
          <div className="px-4 py-2 bg-dark-base rounded-xl border border-white/5">
            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1">System Status</p>
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${isActive ? (isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse') : 'bg-gray-700'}`} />
              <span className="text-[10px] font-bold text-white uppercase">{isActive ? (isPaused ? 'Paused' : 'Recording') : 'Ready'}</span>
            </div>
          </div>
          
          {isActive && (
            <div className="px-4 py-2 bg-dark-base rounded-xl border border-white/5">
              <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1">Phone Detections</p>
              <p className={`text-lg font-black font-mono ${stats.phoneDetections > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                {stats.phoneDetections}
              </p>
            </div>
          )}

          <button
            onClick={() => {
              audioRef.current.play().catch(e => console.log("Audio not available"));
            }}
            className="p-3 hover:bg-white/5 rounded-xl transition-colors group"
            title="Test Audio"
          >
            <Activity className="w-5 h-5 text-primary-400 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Neural Feed */}
        <div className="lg:col-span-8 space-y-6">
          <div className="premium-card !p-2 !rounded-[2rem] bg-dark-base border-white/[0.03] shadow-2xl overflow-hidden group">
            <div className="relative aspect-video rounded-[1.8rem] overflow-hidden bg-dark-surface">

              {/* Visual Indicators Layer */}
              {!isActive && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-dark-base/40 backdrop-blur-sm">
                  <div className="text-center space-y-6 max-w-sm animate-in zoom-in-95 duration-700">
                    <div className="w-20 h-20 bg-primary-500/10 rounded-[2rem] flex items-center justify-center mx-auto border border-primary-500/20 relative group">
                      <div className="absolute inset-0 bg-primary-500 blur-2xl opacity-20 group-hover:opacity-40" />
                      <Play className="w-8 h-8 text-primary-400 fill-primary-400 relative z-10" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tight">Initialize Link?</h3>
                      <p className="text-gray-500 text-sm mt-2 font-medium">System will calibrate biometric sensors and begin behavioral synthesis.</p>
                    </div>
                  </div>
                </div>
              )}

              <video
                ref={videoRef}
                className={`w-full h-full object-cover transition-all duration-1000 ${showCamera && isActive ? 'opacity-40 grayscale-[20%]' : 'opacity-0'}`}
                playsInline
                muted
              />

              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full z-20 pointer-events-none"
              />

              {/* Corner HUD Markers */}
              <div className="absolute top-8 left-8 right-8 bottom-8 pointer-events-none flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 border-t-2 border-l-2 border-primary-500/30 rounded-tl-xl" />
                  <div className="w-12 h-12 border-t-2 border-r-2 border-primary-500/30 rounded-tr-xl" />
                </div>

                {/* Live Waveform Mock */}
                {isActive && (
                  <div className="flex items-center gap-1 justify-center opacity-30 px-20">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-primary-400 rounded-full animate-pulse-slow"
                        style={{ height: `${Math.random() * 40 + 5}px`, animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-end">
                  <div className="w-12 h-12 border-b-2 border-l-2 border-primary-500/30 rounded-bl-xl" />
                  <div className="w-12 h-12 border-b-2 border-r-2 border-primary-500/30 rounded-br-xl" />
                </div>
              </div>

              {/* HUD Overlays */}
              {isActive && (
                <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none z-30">
                  <div className="flex justify-between items-start">
                    <div className="glass-card border-none !rounded-2xl px-5 py-2.5 flex items-center gap-4 bg-black/40">
                      <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${currentState === 'focused' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">{currentState}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowCamera(!showCamera); }}
                      className="pointer-events-auto w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors border border-white/10"
                    >
                      {showCamera ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="flex justify-center">
                    <div className="glass-card !rounded-2xl border-none bg-black/40 px-8 py-3 flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Focus Score</p>
                        <p className="text-3xl font-black text-primary-400 font-mono">{stats.score}%</p>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="text-center">
                        <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Elapsed Time</p>
                        <p className="text-3xl font-black text-white font-mono">{formatTime(elapsedTime)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controls HUD */}
          <div className="flex items-center justify-center gap-6 py-4">
            {!isActive ? (
              <button
                onClick={startSession}
                disabled={isInitializing}
                className="btn-primary px-16 py-6 text-2xl shadow-primary-500/30 group"
              >
                {isInitializing ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-7 h-7 fill-white group-hover:scale-125 transition-transform" />
                    <span className="tracking-tighter">ESTABLISH LINK</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-4 animate-in slide-in-from-bottom-4">
                <button
                  onClick={isPaused ? resumeSession : pauseSession}
                  className="btn-secondary px-10 py-5 text-sm uppercase tracking-[0.2em] bg-white/[0.03]"
                >
                  {isPaused ? <Play className="w-5 h-5 text-green-400" /> : <Pause className="w-5 h-5" />}
                  {isPaused ? 'Resume' : 'Signal Pause'}
                </button>

                <button
                  onClick={endSession}
                  className="bg-red-500/10 text-red-400 border border-red-500/20 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-red-500 transition-all hover:text-white"
                >
                  <Square className="w-5 h-5" />
                  Terminate
                </button>
              </div>
            )}
          </div>

          {/* Live Telemetry Alerts */}
          <div className="premium-card p-8">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary-400" />
              Signal Integrity Log
            </h3>
            <div className="space-y-4">
              {alerts.length > 0 ? alerts.slice(0, 3).map((alert, idx) => (
                <div key={idx} className="flex gap-5 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] animate-in slide-in-from-left-4">
                  <div className="text-2xl mt-1">{alert.icon || '🛸'}</div>
                  <div>
                    <h4 className="font-black text-white uppercase text-xs tracking-widest">{alert.message || alert.title}</h4>
                    <p className="text-[10px] text-gray-500 font-bold mt-1 leading-relaxed">{alert.description || alert.message}</p>
                  </div>
                  <span className="ml-auto text-[8px] font-black text-gray-700 font-mono">
                    {new Date(alert.timestamp || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
              )) : (
                <div className="text-center py-10 opacity-20">
                  <Target className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Listening for biometric variations...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sensory Metrics Radar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="premium-card p-8 bg-gradient-to-br from-primary-600/10 to-transparent">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-8">Performance Synthesis</h3>

            <div className="space-y-10">
              {/* Radial Progress Logic */}
              <div className="relative w-40 h-40 mx-auto">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="80" cy="80" r="70" className="stroke-white/5" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    className="stroke-primary-500 transition-all duration-1000"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * stats.score) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-white font-mono">{stats.score}</span>
                  <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none">Global Efficiency</span>
                </div>
              </div>

              {/* Bar Metrics */}
              <div className="space-y-6">
                {[
                  { label: 'Deep Work', value: stats.focusedPercentage, color: 'bg-green-500', time: stats.focusedTime },
                  { label: 'Surface Focus', value: stats.distractedPercentage, color: 'bg-yellow-500', time: stats.distractedTime },
                  { label: 'No Presence', value: stats.awayPercentage, color: 'bg-red-500', time: stats.awayTime }
                ].map((m, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-end mb-2 px-1">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{m.label}</p>
                      <p className="text-xs font-mono font-bold text-white">{formatTime(m.time)}</p>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${m.color} transition-all duration-700`} style={{ width: `${m.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Phone Trap HUD */}
          <div className={`premium-card p-8 border-none relative overflow-hidden transition-all duration-700 ${stats.phoneDetections > 0 ? 'bg-orange-600/20' : 'bg-white/[0.02]'}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stats.phoneDetections > 0 ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-gray-700'}`}>
                  <Phone className={`w-6 h-6 ${stats.phoneDetections > 0 ? 'animate-bounce' : ''}`} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Phone Detections</h4>
                  <p className={`text-3xl font-black font-mono tracking-tighter ${stats.phoneDetections > 0 ? 'text-orange-400' : 'text-white'}`}>
                    {stats.phoneDetections.toString().padStart(2, '0')}
                  </p>
                </div>
              </div>
              {stats.phoneDetections > 0 && <span className="text-[8px] font-black text-orange-500 animate-pulse bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20 uppercase tracking-widest">Breach Detected</span>}
            </div>
          </div>

          {/* AI Projections */}
          <div className="glass-card !rounded-3xl p-8 border-white/5 flex items-center justify-between">
            <div>
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Projected Peak</h4>
              <p className="text-xl font-bold text-white">4:30 PM</p>
            </div>
            <Sparkles className="w-8 h-8 text-primary-500/30" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyMode;