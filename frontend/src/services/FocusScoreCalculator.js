export class FocusScoreCalculator {
  constructor() {
    this.focusedTime = 0;
    this.distractedTime = 0;
    this.awayTime = 0;
    this.phoneDetections = 0;
    this.startTime = null;
    this.sessionHistory = [];
  }

  start() {
    this.startTime = Date.now();
    this.focusedTime = 0;
    this.distractedTime = 0;
    this.awayTime = 0;
    this.phoneDetections = 0;
  }

  recordState(state, duration = 1000) {
    const durationInSeconds = duration / 1000;
    
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
    
    if (totalTime === 0) return 100;
    
    // Weighted calculation
    const DISTRACTION_WEIGHT = 1.5;
    const AWAY_WEIGHT = 2.0;
    const PHONE_PENALTY = 5;
    
    const weightedDistractedTime = this.distractedTime * DISTRACTION_WEIGHT;
    const weightedAwayTime = this.awayTime * AWAY_WEIGHT;
    const phonePenalty = this.phoneDetections * PHONE_PENALTY;
    
    const totalPenaltyTime = weightedDistractedTime + weightedAwayTime + phonePenalty;
    const effectiveTime = totalTime + totalPenaltyTime;
    
    const score = Math.max(0, Math.min(100, 
      (this.focusedTime / effectiveTime) * 100
    ));
    
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
    this.startTime = null;
    this.sessionHistory = [];
  }
}

export default FocusScoreCalculator;