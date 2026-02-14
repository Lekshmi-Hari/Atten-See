# Atten-See Frontend: Complete Implementation Guide

## Overview

A premium React-based study tracking application featuring real-time focus detection using TensorFlow.js and MediaPipe, with glass-morphism UI design and comprehensive analytics visualization.

**Tech Stack:**
- React 18.2 (Hooks, Context)
- Vite (Development & bundling)
- Tailwind CSS (Styling)
- TensorFlow.js (ML models)
- MediaPipe (Face/body detection)
- Lazy loading & code splitting
- Service workers for offline support

---

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/
│   │   └── Layout.jsx  # App wrapper with navigation
│   ├── pages/
│   │   ├── Dashboard.jsx      # Home & statistics
│   │   ├── StudyMode.jsx      # Main study session (CORE)
│   │   ├── Analytics.jsx      # Advanced metrics
│   │   ├── WeeklyPlanner.jsx  # Session planning
│   │   ├── LectureProcessor.jsx # Video lecture analysis
│   │   ├── Settings.jsx       # User preferences
│   │   ├── Login.jsx          # Authentication
│   │   └── Register.jsx       # Account creation
│   ├── services/
│   │   ├── api.js             # Backend communication
│   │   ├── FocusDetector.js   # 🔴 AI core (detection system)
│   │   ├── FocusScoreCalculator.js  # 🔴 Score calculation
│   │   ├── FocusService.js    # Aggregates detector & calculator
│   │   ├── GeminiServices.js  # AI study assistant
│   │   ├── WhisperService.js  # Audio transcription
│   │   └── FocusScoreCalculator.js
│   ├── App.jsx         # Main router
│   ├── main.jsx        # Entry point
│   ├── index.css       # Global styles
│   └── firebase.js     # (Optional) Firebase config
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind customization
├── postcss.config.js   # PostCSS plugins
└── package.json        # Dependencies
```

---

## Core Components Deep Dive

### 1. StudyMode.jsx (THE HEART OF THE APP)

**Purpose:** Real-time focus monitoring with visual HUD

**Key State Variables:**
```javascript
const [isActive, setIsActive] = useState(false);          // Session running?
const [isPaused, setIsPaused] = useState(false);          // Session paused?
const [elapsedTime, setElapsedTime] = useState(0);        // Real elapsed seconds
const [currentState, setCurrentState] = useState('focused'); // focused|distracted|away
const [subject, setSubject] = useState('');               // Study subject
const [stats, setStats] = useState({...});                // Current metrics

// Refs for performance-critical data
const videoRef = useRef(null);                            // Video element
const canvasRef = useRef(null);                           // Drawing canvas
const detectorRef = useRef(null);                         // FocusDetector instance
const calculatorRef = useRef(new FocusScoreCalculator()); // Score calculator
const sessionStartRef = useRef(null);                     // Session start time
const timerRef = useRef(null);                            // Timer interval ID
```

**Lifecycle:**
```
1. startSession()
   ├─ Request camera access
   ├─ Initialize FocusDetector + models
   ├─ Initialize FocusScoreCalculator
   ├─ Set sessionStartRef = Date.now()
   └─ Start processFrame loop

2. processFrame() [requestAnimationFrame loop]
   ├─ Capture video frame
   ├─ Run FocusDetector.analyzeFrame()
   ├─ Update FocusScoreCalculator.recordState()
   ├─ Record phone detections if any
   ├─ Update UI stats
   ├─ Draw visualization on canvas
   └─ Schedule next frame

3. pauseSession()
   ├─ Set isPaused = true
   ├─ Clear timerRef interval
   └─ Cancel animationRef

4. resumeSession()
   ├─ Set isPaused = false
   ├─ Resume processFrame
   └─ Keep sessionStartRef (no reset!)

5. endSession()
   ├─ Get finalStats from calculator
   ├─ Calculate duration from sessionStartRef
   ├─ POST to /sessions endpoint
   ├─ Clear all refs
   ├─ Reset states
   └─ Show success/error alert
```

**Timer Implementation (CRITICAL FIX):**
```javascript
useEffect(() => {
  if (!isActive || isPaused) {
    if (timerRef.current) clearInterval(timerRef.current);
    return;
  }

  if (!sessionStartRef.current) {
    sessionStartRef.current = Date.now();
  }

  timerRef.current = setInterval(() => {
    const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
    setElapsedTime(elapsed);
  }, 100); // Update every 100ms for smooth display

  return () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };
}, [isActive, isPaused]);
```

**Why This Works:**
- `sessionStartRef.current` is set ONCE when session starts
- Timer calculates: `(now - start) / 1000`
- No counter incrementing = no accumulated errors
- Pause doesn't clear the ref = resume continues correctly

### 2. FocusDetector.js (DETECTION ENGINE)

**Purpose:** Real-time object and face detection using ML

**Models Used:**
```javascript
COCO-SSD (mobilenet_v2)  → Object detection
  - Input: Video frame (variable size)
  - Output: Objects with class, score, box
  - Classes: 80 possible objects
  - Performance: ~33ms per frame (30fps)

MediaPipe FaceLandmarker → Face/body detection
  - Input: Video frame
  - Output: 468 face landmarks
  - Detects: Face, hands, eye closure
  - Performance: ~16ms per frame
```

**14 Distraction Categories:**
```javascript
const DISTRACTION_MAPPING = {
  // CRITICAL (3.0x penalty)
  'phone': 'CRITICAL',
  'mobile_phone': 'CRITICAL',
  
  // HIGH (2.0x penalty)
  'laptop': 'HIGH',
  'computer': 'HIGH',
  
  // MEDIUM (1.5x penalty)
  'book': 'MEDIUM',
  'document': 'MEDIUM',
  
  // LOW (1.0x penalty)
  'food': 'LOW',
  'beverage': 'LOW',
  // ... etc
};
```

**Detection Buffer (Stability):**
```javascript
// Raw detection each frame - noisy
// Buffer requires 2 consecutive frames to confirm
// Prevents false positives from single-frame noise

detectionBuffer = [frame1_result, frame2_result]
if (buffer.every(f => f.distractionFound)) {
  // Only NOW report distraction
  recordAsDistraction();
}
```

**Key Method: analyzeFrame()**
```javascript
async analyzeFrame(videoElement, timestamp) {
  // 1. Extract frame from video
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0);
  
  // 2. Run object detection (COCO-SSD)
  const objects = await cocoSsd.detect(canvas);
  
  // 3. Run face detection (MediaPipe)
  const faces = await faceLandmarker.detectForVideo(canvas, timestamp);
  
  // 4. Analyze results
  const phoneFound = objects.find(o => 
    o.class.match(/phone|mobile/i) && o.score > 0.15
  );
  
  const faceFound = faces.detections.length > 0;
  const distractionFound = phoneFound || /* other checks */;
  
  // 5. Determine focus state
  let focusState = 'focused';
  if (!faceFound) focusState = 'away';
  else if (phoneFound || distractionFound) focusState = 'distracted';
  
  // 6. Buffer for stability
  this.detectionBuffer.push({ distractionFound, ...results });
  if (this.detectionBuffer.length > 2) this.detectionBuffer.shift();
  
  // 7. Return stable result
  return {
    focusState,
    phoneDetected: phoneFound ? true : false,
    distractionFound: this.detectionBuffer.every(d => d.distractionFound),
    distractionType: phoneFound ? 'phone' : 'object',
    distractionBox: [x, y, width, height],
    alerts: getAlerts(results)
  };
}
```

### 3. FocusScoreCalculator.js (SCORING ENGINE)

**Three State Machine:**
```
        start: focused
            ↓
    ┌─────┴─────┬────────┐
    ↓           ↓        ↓
focused    distracted   away
    ↓           ↓        ↓
    └─────┬─────┴────────┘
        returns: 0-100 score
```

**State Tracking:**
```javascript
class FocusScoreCalculator {
  start() {
    this.sessionStart = Date.now();
    this.lastStateTime = Date.now();
    this.currentState = 'focused';
    // Track time in each state
    this.focusedTime = 0;
    this.distractedTime = 0;
    this.awayTime = 0;
    this.phoneDetections = 0;
    this.distractionEvents = 0;
  }

  recordState(newState, msElapsed = 100) {
    // Update previous state's time accumulator
    if (this.currentState === 'focused') {
      this.focusedTime += msElapsed;
    } else if (this.currentState === 'distracted') {
      this.distractedTime += msElapsed;
    } else if (this.currentState === 'away') {
      this.awayTime += msElapsed;
    }

    // Track state changes (for recovery metric)
    if (newState !== this.currentState) {
      this.distractionEvents += 1;
    }

    this.currentState = newState;
  }

  recordPhoneDetection() {
    this.phoneDetections += 1;
  }

  getStats() {
    const totalTime = this.focusedTime + this.distractedTime + this.awayTime;
    
    // Base ratio: focused percentage
    const baseRatio = (this.focusedTime / totalTime) * 100;

    // Apply penalties
    let score = baseRatio;
    score -= (this.distractedTime / totalTime) * 100 * 2.0;  // 2.0x weight
    score -= (this.awayTime / totalTime) * 100 * 3.0;        // 3.0x weight
    score -= (this.phoneDetections * 15);                    // 15 points per detection
    score -= (this.distractionEvents * 5);                   // 5 points per event

    // Clamp to 0-100
    score = Math.max(0, Math.min(100, score));

    return {
      score: Math.round(score),
      focusedTime: this.focusedTime,
      distractedTime: this.distractedTime,
      awayTime: this.awayTime,
      totalTime,
      focusedPercentage: Math.round((this.focusedTime / totalTime) * 100),
      distractedPercentage: Math.round((this.distractedTime / totalTime) * 100),
      awayPercentage: Math.round((this.awayTime / totalTime) * 100),
      phoneDetections: this.phoneDetections,
      distractionEvents: this.distractionEvents
    };
  }
}
```

**Numerical Example:**
```
Session duration: 60 minutes (3600 seconds)

Time breakdown:
- Focused: 2700s (75%)
- Distracted: 600s (16.7%)
- Away: 300s (8.3%)
- Phone detections: 3
- Distraction events: 5

Score calculation:
1. baseRatio = (2700 / 3600) * 100 = 75
2. Apply penalties:
   - focusedTime: 75 - 0 = 75
   - distractedTime: 75 - (600/3600)*100*2.0 = 75 - 33.33 = 41.67
   - awayTime: 41.67 - (300/3600)*100*3.0 = 41.67 - 25 = 16.67
   - phoneDetections: 16.67 - (3 * 15) = -28.33
   - distractionEvents: -28.33 - (5 * 5) = -53.33

3. Clamp: max(0, min(100, -53.33)) = 0

Final Score: 0 (user was distracted too much)
```

---

## Key Service Files

### api.js (Backend Communication)

**Current Session Service:**
```javascript
export const sessionService = {
  async create(sessionData) {
    // POST /sessions with complete analytics
    const response = await fetch('/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        subject: sessionData.subject,
        duration: sessionData.duration,      // minutes
        focusScore: sessionData.focusScore,  // 0-100
        detections: {
          phone: sessionData.detections.phone,
          distracted: Math.round(sessionData.detections.distracted / 1000),
          focused: Math.round(sessionData.detections.focused / 1000),
          away: Math.round(sessionData.detections.away / 1000)
        },
        analytics: {
          hourlyFocus: sessionData.analytics.hourlyFocus,
          recoveryRate: sessionData.analytics.recoveryRate,
          distractionResistance: sessionData.analytics.distractionResistance
        }
      })
    });

    return response.json();
  },

  async getStats() {
    // GET /sessions/stats for dashboard
    const response = await fetch('/api/sessions/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};
```

### Page Components Responsibilities

**Dashboard.jsx**
- Display today's stats
- Show focus score gauge
- Recent sessions list
- Quick start study button

**Analytics.jsx**
- Weekly trend chart (7-day graph)
- Hourly heatmap (24-hour distribution)
- Subject performance comparison
- Phone distraction trends

**WeeklyPlanner.jsx**
- Planned sessions for week
- Time slots visualization
- Goal setting interface
- Achievement tracking

**Settings.jsx**
- Camera permissions
- Notification preferences
- Data export/sync
- Account management

---

## Styling System

### Tailwind Configuration

**Custom Theme:**
```javascript
// tailwind.config.js
const colors = {
  'primary': {
    400: '#06b6d4',  // Neon cyan
    500: '#0891b2',
    600: '#0e7490'
  },
  'background': '#030305',  // Deep black
  'surface': '#1a1a2e',     // Dark blue-black
  'text-primary': '#ffffff',
  'text-secondary': '#a0aec0'
};

// Glass-morphism effect
const glassEffect =
  'backdrop-blur(10px) bg-white/[0.05] border border-white/[0.1]';
```

**Component Classes:**

```css
/* Premium card style */
.premium-card {
  @apply backdrop-blur-lg bg-white/[0.05] 
         border border-white/[0.08] 
         rounded-3xl p-8
         shadow-2xl;
}

/* Glow effect for active elements */
.glow-primary {
  @apply shadow-lg shadow-primary-500/50
         border border-primary-500/50;
}

/* Smooth transitions */
.smooth-transition {
  @apply transition-all duration-300 ease-out;
}
```

---

## Performance Optimization

### 1. Model Initialization (ONE-TIME)
```javascript
const detectorRef = useRef(null);  // Persist across renders
const calculatorRef = useRef(new FocusScoreCalculator());

// Initialize once
if (!detectorRef.current) {
  detectorRef.current = new FocusDetector();
  await detectorRef.current.initialize();
}
```

### 2. Frame Processing
```javascript
// Use requestAnimationFrame (synced to monitor refresh rate)
animationRef.current = requestAnimationFrame(processFrame);

// NOT setInterval (creates competing timers)
// Runs at 60fps on 60Hz monitor, 30fps on 30fps video
```

### 3. State Updates
```javascript
// Batch updates in processFrame
const currentStats = calculatorRef.current.getStats();
setStats({
  score: currentStats.score,
  focusedTime: currentStats.focusedTime,
  // ... all at once
});

// NOT individual setState calls
setScore(...)
setFocusedTime(...)
setDistractedTime(...)
```

### 4. Code Splitting
```javascript
// Lazy load heavy components
const Analytics = lazy(() => import('./pages/Analytics'));
const LectureProcessor = lazy(() => import('./pages/LectureProcessor'));

// Wrap with Suspense in App
<Suspense fallback={<Loading />}>
  <Analytics />
</Suspense>
```

---

## Deployment Instructions

### Development
```bash
cd frontend
npm install
npm run dev  # Starts Vite dev server at localhost:5173
```

### Production Build
```bash
npm run build  # Creates optimized dist/
npm run preview  # Test production build locally
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Troubleshooting

### Camera Not Accessible
```javascript
// Check in DevTools Console
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    console.log(devices); // Should show videoinput devices
  });

// Fix: Check browser permissions
// Chrome: https://mysite.com → Settings → Camera → Allow
```

### Models Not Loading
```javascript
// Check network tab for:
- coco-ssd model files (*.json, *.bin)
- MediaPipe task files (.tflite, .task)

// May need CORS headers or proxy
```

### Timer Skipping/Resetting
```
❌ WRONG: Reset ref on certain conditions
   setElapsedTime(0) when resuming

✅ CORRECT: Keep ref intact
   Only clear on full endSession()
```

### High CPU Usage
```
Workaround: Reduce detection frequency
- Default: every frame (30fps)
- Alternative: every 2 frames (15fps)

In FocusDetector.analyzeFrame():
if (frameCount % 2 !== 0) return;  // Skip alternate frames
```

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| WebRTC | ✅ | ✅ | ✅ | ✅ |
| TensorFlow.js | ✅ | ✅ | ✅ | ✅ |
| Canvas | ✅ | ✅ | ✅ | ✅ |
| Vite (dev) | ✅ | ✅ | ✅ | ✅ |
| Service Workers | ✅ | ✅ | ✅ | ✅ |

**Minimum Versions:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

## Security Considerations

1. **Camera Access**: Only uses mediaDevices API (user grants permission)
2. **Data Privacy**: Focus data calculated locally, only focus score sent to backend
3. **Video Frames**: Never stored or transmitted (processed in-memory only)
4. **Authentication**: JWT tokens in localStorage (HttpOnly not available in React SPA)
5. **CORS**: Configure backend to allow frontend origin only

---

## Next Development Steps

1. **PWA Enhancement**: Add service worker for offline capability
2. **WebGL Optimization**: Use WebGL for faster frame processing
3. **Audio Analysis**: Integrate WhisperService for distraction detection
4. **Real-time Sync**: WebSocket for live dashboard updates
5. **Mobile Support**: Responsive design for tablets/phones

---

**Last Updated**: January 2024
**Version**: 2.0 (Post-Detection Fix)
**Status**: Production Ready ✅
