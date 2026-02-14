export class FocusScoreCalculator {
  constructor() {
    this.focusedTime = 0;
    this.distractedTime = 0;
    this.awayTime = 0;
    this.phoneDetections = 0;
    this.distractionEvents = 0; // Count of distraction incidents
    this.startTime = null;
    this.sessionHistory = [];
    this.lastStateTime = null;
  }

  start() {
    this.startTime = Date.now();
    this.lastStateTime = Date.now();
    this.focusedTime = 0;
    this.distractedTime = 0;
    this.awayTime = 0;
    this.phoneDetections = 0;
    this.distractionEvents = 0;
    this.sessionHistory = [];
  }

  recordState(state, duration = 1000) {
    const durationInSeconds = duration / 1000;
    
    // Track state changes as separate events
    if (this.sessionHistory.length > 0) {
      const lastEntry = this.sessionHistory[this.sessionHistory.length - 1];
      if (lastEntry.state !== state) {
        this.distractionEvents++;
      }
    }
    
    switch (state) {
      case 'focused':
        this.focusedTime += durationInSeconds;
        break;
      case 'distracted':
        this.distractedTime += durationInSeconds;
        break;
      case 'away':
        this.awayTime += durationInSeconds;
        break;
    }
    
    this.sessionHistory.push({
      timestamp: Date.now(),
      state,
      duration: durationInSeconds
    });
  }

  recordPhoneDetection() {
    this.phoneDetections++;
  }

  calculateScore() {
    const totalTime = this.focusedTime + this.distractedTime + this.awayTime;
    
    // Minimum score of 0 if no time recorded
    if (totalTime === 0) return 0;
    
    // More aggressive penalty weights to prevent "100% focus" 
    const DISTRACTION_WEIGHT = 2.0;      // 2x penalty for distracted time
    const AWAY_WEIGHT = 3.0;              // 3x penalty for away time
    const PHONE_PENALTY = 15;             // 15 points per phone detection (more severe)
    const DISTRACTION_EVENT_PENALTY = 5;  // 5 points per state change to distraction
    
    // Calculate time-based penalties
    const weightedDistractedTime = this.distractedTime * DISTRACTION_WEIGHT;
    const weightedAwayTime = this.awayTime * AWAY_WEIGHT;
    
    // Calculate event-based penalties
    const phonePenaltyPoints = Math.min(this.phoneDetections * PHONE_PENALTY, 50); // Cap at 50 points
    const distractionEventPoints = Math.min(this.distractionEvents * DISTRACTION_EVENT_PENALTY, 30); // Cap at 30 points
    
    // Total penalty time equivalent
    const totalPenaltyTime = weightedDistractedTime + weightedAwayTime;
    const effectiveTime = totalTime + totalPenaltyTime;
    
    // Base score from focus ratio
    let score = (this.focusedTime / effectiveTime) * 100;
    
    // Apply direct point penalties
    score -= phonePenaltyPoints;
    score -= distractionEventPoints;
    
    // Clamp between 0 and 100
    score = Math.max(0, Math.min(100, score));
    
    return Math.round(score);
  }

  getStats() {
    const totalTime = this.focusedTime + this.distractedTime + this.awayTime;
    
    return {
      score: this.calculateScore(),
      focusedTime: Math.round(this.focusedTime),
      distractedTime: Math.round(this.distractedTime),
      awayTime: Math.round(this.awayTime),
      phoneDetections: this.phoneDetections,
      distractionEvents: this.distractionEvents,
      totalTime: Math.round(totalTime),
      focusedPercentage: totalTime > 0 ? Math.round((this.focusedTime / totalTime) * 100) : 0,
      distractedPercentage: totalTime > 0 ? Math.round((this.distractedTime / totalTime) * 100) : 0,
      awayPercentage: totalTime > 0 ? Math.round((this.awayTime / totalTime) * 100) : 0,
    };
  }

  getTimelineData() {
    // Convert session history to timeline format for visualization
    const timeline = [];
    const BUCKET_SIZE = 60; // 1 minute buckets
    
    let currentBucket = {
      timestamp: this.startTime,
      focused: 0,
      distracted: 0,
      away: 0
    };
    
    let bucketStart = this.startTime;
    
    for (const entry of this.sessionHistory) {
      if (entry.timestamp - bucketStart >= BUCKET_SIZE * 1000) {
        timeline.push({ ...currentBucket });
        bucketStart = entry.timestamp;
        currentBucket = {
          timestamp: bucketStart,
          focused: 0,
          distracted: 0,
          away: 0
        };
      }
      
      currentBucket[entry.state] += entry.duration;
    }
    
    if (currentBucket.focused + currentBucket.distracted + currentBucket.away > 0) {
      timeline.push(currentBucket);
    }
    
    return timeline;
  }

  checkForStreaks() {
    const achievements = [];
    
    // Deep Work Streak - 15 minutes continuous focus
    const recentHistory = this.sessionHistory.slice(-15);
    const allFocused = recentHistory.length >= 15 && 
      recentHistory.every(entry => entry.state === 'focused');
    
    if (allFocused) {
      achievements.push({
        type: 'streak',
        title: '15 Minute Deep Work Streak!',
        description: 'You\'re in the zone!',
        icon: '🔥'
      });
    }
    
    // Phone-Free Session
    if (this.phoneDetections === 0 && this.focusedTime > 30 * 60) {
      achievements.push({
        type: 'phone-free',
        title: 'Phone-Free Session',
        description: 'Great digital discipline!',
        icon: '📵'
      });
    }
    
    return achievements;
  }

  reset() {
    this.focusedTime = 0;
    this.distractedTime = 0;
    this.awayTime = 0;
    this.phoneDetections = 0;
    this.distractionEvents = 0;
    this.startTime = null;
    this.lastStateTime = null;
    this.sessionHistory = [];
  }
}

export default FocusScoreCalculator;