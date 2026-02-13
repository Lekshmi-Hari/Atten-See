// Whisper API Service for Audio Transcription
// Requires OpenAI API key

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const WHISPER_API_ENDPOINT = 'https://api.openai.com/v1/audio/transcriptions';

export class WhisperService {
  constructor(apiKey = OPENAI_API_KEY) {
    this.apiKey = apiKey;
  }

  async transcribeAudio(audioFile, options = {}) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('model', 'whisper-1');
      
      // Optional parameters
      if (options.language) {
        formData.append('language', options.language);
      }
      
      if (options.prompt) {
        formData.append('prompt', options.prompt);
      }
      
      // Response format: json, text, srt, verbose_json, or vtt
      formData.append('response_format', options.responseFormat || 'verbose_json');
      
      if (options.temperature !== undefined) {
        formData.append('temperature', options.temperature.toString());
      }

      const response = await fetch(WHISPER_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Whisper API error: ${error.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      
      // Process verbose JSON response
      if (options.responseFormat === 'verbose_json') {
        return this.processVerboseResponse(result);
      }
      
      return result;
      
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    }
  }

  processVerboseResponse(result) {
    // Extract segments with timestamps
    const segments = result.segments || [];
    
    // Create chapters based on significant pauses or topic changes
    const chapters = this.createChapters(segments);
    
    // Detect speakers (simplified - Whisper doesn't natively support this)
    // For real speaker diarization, use additional service like Pyannote
    const speakers = this.detectSpeakers(segments);
    
    return {
      text: result.text,
      language: result.language,
      duration: result.duration,
      segments,
      chapters,
      speakers
    };
  }

  createChapters(segments, minPauseDuration = 3) {
    const chapters = [];
    let currentChapter = {
      title: 'Introduction',
      startTime: 0,
      segments: []
    };
    
    segments.forEach((segment, index) => {
      currentChapter.segments.push(segment);
      
      // Check for significant pause or end of lecture
      if (index < segments.length - 1) {
        const nextSegment = segments[index + 1];
        const pause = nextSegment.start - segment.end;
        
        if (pause > minPauseDuration) {
          currentChapter.endTime = segment.end;
          chapters.push({ ...currentChapter });
          
          // Start new chapter
          currentChapter = {
            title: this.generateChapterTitle(currentChapter.segments),
            startTime: nextSegment.start,
            segments: []
          };
        }
      }
    });
    
    // Add last chapter
    if (currentChapter.segments.length > 0) {
      currentChapter.endTime = segments[segments.length - 1].end;
      chapters.push(currentChapter);
    }
    
    return chapters.map((chapter, index) => ({
      title: chapter.title || `Section ${index + 1}`,
      timestamp: this.formatTimestamp(chapter.startTime)
    }));
  }

  generateChapterTitle(segments) {
    // Extract key phrases from segments (simplified)
    const text = segments.map(s => s.text).join(' ');
    const words = text.toLowerCase().split(' ');
    
    // Look for topic indicators
    const topicIndicators = ['now', 'next', 'today', 'chapter', 'section', 'topic'];
    
    for (let i = 0; i < words.length; i++) {
      if (topicIndicators.includes(words[i])) {
        return words.slice(i, i + 5).join(' ');
      }
    }
    
    return 'Discussion';
  }

  detectSpeakers(segments) {
    // Simplified speaker detection based on voice patterns
    // In production, use a dedicated speaker diarization service
    
    const speakers = new Map();
    speakers.set('Professor', { duration: 0, segments: [] });
    speakers.set('Student', { duration: 0, segments: [] });
    
    segments.forEach(segment => {
      // Heuristic: Longer segments are typically professor
      const speaker = segment.text.length > 50 ? 'Professor' : 'Student';
      const speakerData = speakers.get(speaker);
      speakerData.duration += (segment.end - segment.start);
      speakerData.segments.push(segment);
    });
    
    return Array.from(speakers.entries()).map(([name, data]) => ({
      name,
      duration: Math.round(data.duration)
    }));
  }

  formatTimestamp(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

export default WhisperService;