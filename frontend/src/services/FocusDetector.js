import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export class FocusDetector {
  constructor() {
    this.cocoModel = null;
    this.faceLandmarker = null;
    this.isInitialized = false;
    this.lastGazePosition = { x: 0, y: 0 };
    this.gazeHistory = [];
    this.focusState = 'focused'; // 'focused', 'distracted', 'away'
    this.phoneDetectedTime = 0;
    this.awayTime = 0;
    this.lastFaceDetectedTime = Date.now();
  }

  async initialize() {
    try {
      // Initialize TensorFlow.js
      await tf.ready();
      
      // Load COCO-SSD model for phone detection
      this.cocoModel = await cocoSsd.load();
      
      // Load MediaPipe Face Landmarker
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      
      this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU"
        },
        numFaces: 1,
        runningMode: "VIDEO",
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true,
      });
      
      this.isInitialized = true;
      console.log('FocusDetector initialized successfully');
    } catch (error) {
      console.error('Error initializing FocusDetector:', error);
      throw error;
    }
  }

  async analyzeFrame(videoElement, timestamp) {
    if (!this.isInitialized) {
      throw new Error('FocusDetector not initialized');
    }

    const results = {
      focusState: 'focused',
      faceDetected: false,
      gazeDirection: { x: 0, y: 0 },
      headPose: { pitch: 0, yaw: 0, roll: 0 },
      phoneDetected: false,
      phoneConfidence: 0,
      blinkRate: 0,
      gazeVelocity: 0,
      alerts: []
    };

    try {
      // Detect face and landmarks
      const faceLandmarks = this.faceLandmarker.detectForVideo(videoElement, timestamp);
      
      if (faceLandmarks.faceLandmarks && faceLandmarks.faceLandmarks.length > 0) {
        results.faceDetected = true;
        this.lastFaceDetectedTime = Date.now();
        this.awayTime = 0;
        
        const landmarks = faceLandmarks.faceLandmarks[0];
        
        // Calculate head pose from landmarks
        const headPose = this.calculateHeadPose(landmarks);
        results.headPose = headPose;
        
        // Calculate gaze direction (using eye landmarks)
        const gazeDirection = this.calculateGazeDirection(landmarks);
        results.gazeDirection = gazeDirection;
        
        // Calculate gaze velocity
        const gazeVelocity = this.calculateGazeVelocity(gazeDirection);
        results.gazeVelocity = gazeVelocity;
        
        // Calculate blink rate from blendshapes if available
        if (faceLandmarks.faceBlendshapes && faceLandmarks.faceBlendshapes.length > 0) {
          results.blinkRate = this.calculateBlinkRate(faceLandmarks.faceBlendshapes[0]);
        }
        
        // Determine focus state based on head pose
        if (Math.abs(headPose.pitch) < 15 && Math.abs(headPose.yaw) < 15) {
          results.focusState = 'focused';
        } else if (Math.abs(headPose.pitch) < 30 && Math.abs(headPose.yaw) < 30) {
          results.focusState = 'distracted';
        } else {
          results.focusState = 'distracted';
        }
        
        // Check for zoning out (minimal eye movement)
        if (gazeVelocity < 0.5 && results.blinkRate < 10) {
          results.alerts.push({
            type: 'warning',
            message: 'Lapse in Active Engagement detected'
          });
        }
        
      } else {
        results.faceDetected = false;
        this.awayTime = Date.now() - this.lastFaceDetectedTime;
        
        if (this.awayTime > 10000) {
          results.focusState = 'away';
          
          if (this.awayTime > 120000) {
            results.alerts.push({
              type: 'alert',
              message: 'You\'ve been away for over 2 minutes'
            });
          }
        }
      }
      
      // Detect phone using COCO-SSD
      const phoneDetection = await this.detectPhone(videoElement);
      results.phoneDetected = phoneDetection.detected;
      results.phoneConfidence = phoneDetection.confidence;
      
      if (phoneDetection.detected && phoneDetection.confidence > 0.6) {
        const now = Date.now();
        if (this.phoneDetectedTime === 0) {
          this.phoneDetectedTime = now;
        } else if (now - this.phoneDetectedTime > 3000) {
          results.alerts.push({
            type: 'phone',
            message: 'Phone detected - Stay focused!'
          });
        }
      } else {
        this.phoneDetectedTime = 0;
      }
      
    } catch (error) {
      console.error('Error analyzing frame:', error);
    }

    return results;
  }

  calculateHeadPose(landmarks) {
    // Simplified head pose estimation using key facial landmarks
    // Nose tip, chin, left eye, right eye, left mouth, right mouth
    const noseTip = landmarks[1];
    const chin = landmarks[152];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    
    // Calculate yaw (left-right rotation)
    const eyeMidpoint = {
      x: (leftEye.x + rightEye.x) / 2,
      y: (leftEye.y + rightEye.y) / 2
    };
    const yaw = (noseTip.x - eyeMidpoint.x) * 90;
    
    // Calculate pitch (up-down rotation)
    const pitch = (noseTip.y - eyeMidpoint.y) * 90;
    
    // Calculate roll (tilt)
    const roll = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * (180 / Math.PI);
    
    return { pitch, yaw, roll };
  }

  calculateGazeDirection(landmarks) {
    // Use iris landmarks (468-477) if available, otherwise use eye centers
    const leftEyeCenter = landmarks[33];
    const rightEyeCenter = landmarks[263];
    
    const gazeX = (leftEyeCenter.x + rightEyeCenter.x) / 2;
    const gazeY = (leftEyeCenter.y + rightEyeCenter.y) / 2;
    
    return { x: gazeX, y: gazeY };
  }

  calculateGazeVelocity(currentGaze) {
    this.gazeHistory.push({ ...currentGaze, timestamp: Date.now() });
    
    // Keep only last 30 frames (1 second at 30fps)
    if (this.gazeHistory.length > 30) {
      this.gazeHistory.shift();
    }
    
    if (this.gazeHistory.length < 2) return 0;
    
    // Calculate average velocity
    let totalVelocity = 0;
    for (let i = 1; i < this.gazeHistory.length; i++) {
      const dx = this.gazeHistory[i].x - this.gazeHistory[i - 1].x;
      const dy = this.gazeHistory[i].y - this.gazeHistory[i - 1].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      totalVelocity += distance;
    }
    
    return totalVelocity / this.gazeHistory.length;
  }

  calculateBlinkRate(blendshapes) {
    // Extract eye blink values from blendshapes
    const leftEyeBlink = blendshapes.categories.find(c => c.categoryName === 'eyeBlinkLeft');
    const rightEyeBlink = blendshapes.categories.find(c => c.categoryName === 'eyeBlinkRight');
    
    const avgBlink = ((leftEyeBlink?.score || 0) + (rightEyeBlink?.score || 0)) / 2;
    
    // Convert to blinks per minute (simplified)
    return avgBlink > 0.5 ? 20 : 15;
  }

  async detectPhone(videoElement) {
    try {
      const predictions = await this.cocoModel.detect(videoElement);
      
      const phonePrediction = predictions.find(p => 
        p.class === 'cell phone' || p.class === 'remote'
      );
      
      if (phonePrediction) {
        return {
          detected: true,
          confidence: phonePrediction.score,
          bbox: phonePrediction.bbox
        };
      }
    } catch (error) {
      console.error('Error detecting phone:', error);
    }
    
    return { detected: false, confidence: 0 };
  }

  destroy() {
    if (this.faceLandmarker) {
      this.faceLandmarker.close();
    }
    this.isInitialized = false;
  }
}

export default FocusDetector;