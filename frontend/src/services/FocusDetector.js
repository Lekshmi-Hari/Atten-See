import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export class FocusDetector {
  constructor() {
    this.cocoModel = null;
    this.faceLandmarker = null;
    this.isInitialized = false;
    this.frameCounter = 0;
    this.lastFaceDetectedTime = Date.now();
    this.detectionBuffer = [];
    this.bufferSize = 5; // Hold last 5 detections for stability

    // Expanded distraction categories - more sensitive detection
    this.distractionCategories = {
      'cell phone': { priority: 'critical', score: 1.0 },
      'phone': { priority: 'critical', score: 1.0 },
      'laptop': { priority: 'high', score: 0.8 },
      'cup': { priority: 'medium', score: 0.5 },
      'bottle': { priority: 'medium', score: 0.5 },
      'book': { priority: 'medium', score: 0.6 },
      'remote': { priority: 'high', score: 0.7 },
      'keyboard': { priority: 'high', score: 0.7 },
      'mouse': { priority: 'high', score: 0.7 },
      'scissors': { priority: 'medium', score: 0.5 },
      'tv': { priority: 'high', score: 0.8 },
      'monitor': { priority: 'high', score: 0.8 },
      'tablet': { priority: 'critical', score: 1.0 },
      'screen': { priority: 'high', score: 0.8 }
    };

    this.currentObjects = [];
    this.headTurnBuffer = [];
    this.eyeGazeBuffer = [];
    this.bufferMaxSize = 10;
  }

  async initialize() {
    console.log('[AI] Initializing Advanced Detection Suite...');
    try {
      await tf.ready();
      console.log('✅ TensorFlow.js ready');

      // Load COCO-SSD with standard model (better accuracy)
      if (!this.cocoModel) {
        console.log('[AI] Loading COCO-SSD model...');
        this.cocoModel = await cocoSsd.load({
          base: 'mobilenet_v2' // Standard model for better detection
        });
        console.log('✅ COCO-SSD Object Detection Ready');
      }

      // Load MediaPipe Face Detection
      if (!this.faceLandmarker) {
        console.log('[AI] Loading MediaPipe Face Landmarker...');
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
        );

        this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          numFaces: 1,
          runningMode: "VIDEO",
          minFaceDetectionConfidence: 0.3,
          minFacePresenceConfidence: 0.3,
          minTrackingConfidence: 0.3,
          outputFaceBlendshapes: true,
        });
        console.log('✅ Face Landmark Tracking Ready');
      }

      this.isInitialized = true;
      console.log('🚀 [AI] All detection models initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ AI Initialization Error:', error);
      console.error('Error stack:', error.stack);
      return false;
    }
  }

  async analyzeFrame(videoElement, timestamp) {
    if (!this.isInitialized || !videoElement) {
      console.warn('[AI] Detector not initialized or no video element');
      return null;
    }
    
    // Check if video is actually playing and ready
    if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      console.warn('[AI] Video not ready yet:', { width: videoElement.videoWidth, height: videoElement.videoHeight });
      return null;
    }

    this.frameCounter++;
    const results = {
      focusState: 'focused',
      faceDetected: false,
      phoneDetected: false,
      distractionFound: false,
      distractionType: null,
      distractionBox: null,
      allDetections: [],
      alerts: [],
      confidence: 0
    };

    try {
      // 1. Object Detection - RUN EVERY 2 FRAMES (COCO-SSD)
      if (this.frameCounter % 2 === 0) { // Run every 2 frames for performance
        try {
          if (this.cocoModel) {
            console.log(`[AI] Running COCO-SSD detection on frame ${this.frameCounter}, video: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
            const predictions = await this.cocoModel.detect(videoElement);
            console.log(`[AI] COCO predictions: ${predictions.length} objects detected`);
            
            if (predictions && predictions.length > 0) {
              let maxPriorityDistraction = null;
              let maxPriority = -1;
              
              for (const obj of predictions) {
                const objClassLower = obj.class.toLowerCase();
                const distractionData = this.distractionCategories[objClassLower];
                
                console.log(`[AI] Found object: ${obj.class} (${Math.round(obj.score * 100)}%), score threshold: 0.3, is distraction: ${!!distractionData}`);
                
                if (distractionData && obj.score >= 0.3) { // Confidence threshold
                  results.allDetections.push({
                    class: obj.class,
                    score: obj.score,
                    confidence: distractionData.score,
                    priority: distractionData.priority,
                    bbox: obj.bbox
                  });
                  
                  // Determine highest priority distraction
                  const priorityValue = { critical: 3, high: 2, medium: 1 }[distractionData.priority] || 0;
                  if (priorityValue > maxPriority) {
                    maxPriority = priorityValue;
                    maxPriorityDistraction = {
                      class: obj.class,
                      bbox: obj.bbox,
                      score: obj.score,
                      confidence: distractionData.score,
                      priority: distractionData.priority
                    };
                  }
                  
                  console.log(`🚨 [AI] DISTRACTION DETECTED: ${obj.class} (${Math.round(obj.score * 100)}% confidence, priority: ${distractionData.priority})`);
                }
              }
              
              if (maxPriorityDistraction) {
                this.detectionBuffer.push(maxPriorityDistraction);
                if (this.detectionBuffer.length > this.bufferSize) {
                  this.detectionBuffer.shift();
                }

                // Check if distraction is consistent
                const consistentDetections = this.detectionBuffer.filter(d => 
                  d.class === maxPriorityDistraction.class
                ).length;

                console.log(`[AI] Consistent detections: ${consistentDetections}/${this.bufferSize}`);

                if (consistentDetections >= 2) { // Requires 2 consistent detections
                  results.distractionFound = true;
                  results.distractionType = maxPriorityDistraction.class;
                  results.distractionBox = maxPriorityDistraction.bbox;
                  results.phoneDetected = maxPriorityDistraction.priority === 'critical';
                  results.confidence = Math.round(maxPriorityDistraction.score * 100);
                  
                  if (results.focusState === 'focused') {
                    results.focusState = 'distracted';
                  }

                  results.alerts.push({
                    type: maxPriorityDistraction.priority === 'critical' ? 'phone' : 'warning',
                    message: `🚨 ${maxPriorityDistraction.class.toUpperCase()} DETECTED (${results.confidence}%)`
                  });
                  
                  console.log(`🔔 [AI] ALERT TRIGGERED: ${results.distractionType} with ${results.confidence}% confidence`);
                }
              }
            } else {
              console.log('[AI] No predictions from COCO-SSD');
            }
          } else {
            console.warn('[AI] COCO model not loaded yet');
          }
        } catch (objErr) {
          console.warn('Object detection frame error:', objErr);
        }
      }

      // 2. Face & Gaze Tracking - RUN EVERY FRAME
      const faceResult = this.faceLandmarker.detectForVideo(videoElement, timestamp);

      if (faceResult.faceLandmarks && faceResult.faceLandmarks.length > 0) {
        results.faceDetected = true;
        this.lastFaceDetectedTime = Date.now();

        const landmarks = faceResult.faceLandmarks[0];
        const headPose = this.calculateHeadPose(landmarks);

        // Buffer head turn data for stability
        this.headTurnBuffer.push(headPose);
        if (this.headTurnBuffer.length > this.bufferMaxSize) {
          this.headTurnBuffer.shift();
        }

        // More lenient head turn detection
        const LIMIT = 25; // Increased tolerance
        const avgYaw = this.headTurnBuffer.reduce((a, h) => a + h.yaw, 0) / this.headTurnBuffer.length;
        const avgPitch = this.headTurnBuffer.reduce((a, h) => a + h.pitch, 0) / this.headTurnBuffer.length;
        const headAway = Math.abs(avgYaw) > LIMIT || Math.abs(avgPitch) > LIMIT;

        // Eye state detection - improved
        let gazeAway = false;
        let eyesClosed = false;
        if (faceResult.faceBlendshapes && faceResult.faceBlendshapes.length > 0) {
          const shapes = faceResult.faceBlendshapes[0].categories;
          
          const eyeUp = shapes.find(c => c.categoryName === 'eyeLookUpLeft')?.score || 0;
          const eyeDown = shapes.find(c => c.categoryName === 'eyeLookDownLeft')?.score || 0;
          const eyeLeft = shapes.find(c => c.categoryName === 'eyeLookOutLeft')?.score || 0;
          const eyeRight = shapes.find(c => c.categoryName === 'eyeLookInLeft')?.score || 0;
          const eyeClosed = shapes.find(c => c.categoryName === 'eyeBlinkLeft')?.score || 0;

          this.eyeGazeBuffer.push({ away: Math.max(eyeUp, eyeDown, eyeLeft, eyeRight), closed: eyeClosed });
          if (this.eyeGazeBuffer.length > this.bufferMaxSize) {
            this.eyeGazeBuffer.shift();
          }

          const avgGaze = this.eyeGazeBuffer.reduce((a, e) => a + e.away, 0) / this.eyeGazeBuffer.length;
          const avgClosed = this.eyeGazeBuffer.reduce((a, e) => a + e.closed, 0) / this.eyeGazeBuffer.length;
          
          gazeAway = avgGaze > 0.3;
          eyesClosed = avgClosed > 0.6;
        }

        if (eyesClosed) {
          results.focusState = 'away';
          results.alerts.push({ type: 'error', message: 'Eyes Closed - Stay Alert!' });
        } else if (headAway) {
          results.focusState = 'distracted';
          results.alerts.push({ type: 'warning', message: 'Face screen please' });
        } else if (gazeAway) {
          results.focusState = 'distracted';
          results.alerts.push({ type: 'warning', message: 'Focus on work' });
        }
      } else {
        if (Date.now() - this.lastFaceDetectedTime > 2000) {
          results.focusState = 'away';
          results.alerts.push({ type: 'error', message: 'No face detected' });
        }
      }

      // 2. Object Detection - RUN EVERY FRAME (not every 2 frames)
      const objects = await this.cocoModel.detect(videoElement);
      results.allDetections = objects;

      // Filter objects and find highest-priority distraction
      let maxPriorityDistraction = null;
      let maxScore = 0;

      for (const obj of objects) {
        const normalized = obj.class.toLowerCase().trim();
        
        // Check all registered distractions
        for (const [distractionKey, distractionData] of Object.entries(this.distractionCategories)) {
          if (normalized.includes(distractionKey.toLowerCase()) && obj.score > 0.15) { // LOWERED THRESHOLD
            if (distractionData.score > maxScore) {
              maxScore = distractionData.score;
              maxPriorityDistraction = {
                class: obj.class,
                score: obj.score,
                confidence: distractionData.score,
                priority: distractionData.priority,
                bbox: obj.bbox
              };
            }
            
            // Log all detections for debugging
            console.log(`[AI] Detected: ${obj.class} (${Math.round(obj.score * 100)}% confidence)`);
          }
        }
      }

      if (maxPriorityDistraction) {
        this.detectionBuffer.push(maxPriorityDistraction);
        if (this.detectionBuffer.length > this.bufferSize) {
          this.detectionBuffer.shift();
        }

        // Check if distraction is consistent (appears in multiple frames)
        const consistentDetections = this.detectionBuffer.filter(d => 
          d.class === maxPriorityDistraction.class
        ).length;

        if (consistentDetections >= 2) { // Requires 2 consistent frames
          results.distractionFound = true;
          results.distractionType = maxPriorityDistraction.class;
          results.distractionBox = maxPriorityDistraction.bbox;
          results.phoneDetected = maxPriorityDistraction.priority === 'critical';
          results.confidence = Math.round(maxPriorityDistraction.score * 100);
          
          if (results.focusState === 'focused') {
            results.focusState = 'distracted';
          }

          results.alerts.push({
            type: maxPriorityDistraction.priority === 'critical' ? 'phone' : 'warning',
            message: `🚨 ${maxPriorityDistraction.class.toUpperCase()} DETECTED (${results.confidence}%)`
          });
        }
      }

    } catch (err) {
      console.error('Frame Processing Error:', err);
    }

    return results;
  }

  calculateHeadPose(landmarks) {
    // Key facial landmarks
    const nose = landmarks[1];
    const lEye = landmarks[33];
    const rEye = landmarks[263];
    const lEar = landmarks[234];
    const rEar = landmarks[454];
    const mouth = landmarks[11];

    const eyeMidX = (lEye.x + rEye.x) / 2;
    const eyeMidY = (lEye.y + rEye.y) / 2;
    const earMidX = (lEar.x + rEar.x) / 2;

    return {
      yaw: (nose.x - eyeMidX) * 120,
      pitch: (nose.y - eyeMidY) * 120,
      roll: (rEar.x - lEar.x) * 100
    };
  }

  destroy() {
    if (this.faceLandmarker) this.faceLandmarker.close();
    this.isInitialized = false;
  }
}

export default FocusDetector;