import React, { useState, useRef } from 'react';
import { Upload, Mic, Square, Download, FileText, Sparkles, BookOpen, Loader2, AlertCircle, Zap, Activity } from 'lucide-react';
import { lectureService } from '../services/api';
import WhisperService from '../services/WhisperService';
import GeminiService from '../services/GeminiServices';

const LectureProcessor = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [transcript, setTranscript] = useState(null);
  const [summary, setSummary] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [activeTab, setActiveTab] = useState('summary');
  const [error, setError] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const whisperServiceRef = useRef(null);
  const geminiServiceRef = useRef(null);

  // Initialize services on first render with current env vars
  React.useEffect(() => {
    if (!whisperServiceRef.current) {
      whisperServiceRef.current = new WhisperService();
    }
    if (!geminiServiceRef.current) {
      geminiServiceRef.current = new GeminiService();
    }
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      // Reset previous results when starting new recording
      setTranscript(null);
      setSummary(null);
      setFlashcards([]);
      setAudioUrl(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], `lecture_${Date.now()}.webm`, { type: 'audio/webm' });
        setUploadedFile(file);
        
        // Create audio preview URL
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Microphone access error:', error);
      // More detailed error messages for different scenarios
      if (error.name === 'NotAllowedError') {
        setError('Microphone access denied. Please grant permission in your browser settings.');
      } else if (error.name === 'NotFoundError') {
        setError('No microphone found. Please check your audio device.');
      } else if (error.name === 'NotReadableError') {
        setError('Microphone is already in use. Close other applications using audio and try again.');
      } else {
        setError(`Microphone error: ${error.message}`);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        setError('Please upload a valid audio file (mp3, wav, m4a, webm, etc.)');
        return;
      }
      
      // Validate file size (max 100MB for Whisper API)
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 100MB.`);
        return;
      }
      
      setUploadedFile(file);
      setError(null);
      setTranscript(null);
      setSummary(null);
      setFlashcards([]);
      setActiveTab('transcript');
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      
      // Auto-transcribe on file upload
      transcribeAudioOnly(file);
    }
  };

  const transcribeAudioOnly = async (audioFile) => {
    setIsProcessing(true);
    setError(null);
    setProcessingStep('Transcribing audio to text...');
    
    try {
      let transcriptionResult;
      
      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        console.warn('OpenAI API key not configured, using demo transcript');
        transcriptionResult = { text: mockTranscript.text, segments: [] };
      } else {
        try {
          transcriptionResult = await whisperServiceRef.current.transcribeAudio(audioFile, {
            language: 'en',
            responseFormat: 'json'
          });
        } catch (err) {
          throw new Error(`Transcription failed: ${err.message}`);
        }
      }
      
      const transcriptText = transcriptionResult.text || mockTranscript.text;
      setTranscript({
        text: transcriptText,
        duration: recordingTime || 60,
        segments: transcriptionResult.segments || []
      });
      
      setProcessingStep('');
      setError(null);
    } catch (error) {
      console.error('Transcription error:', error);
      let errorMessage = 'Transcription failed. ';
      
      if (error.message.includes('API key')) {
        errorMessage += 'OpenAI API key not configured. Check VITE_OPENAI_API_KEY in .env';
      } else if (error.message.includes('rate limit')) {
        errorMessage += 'API rate limit exceeded. Please wait and try again.';
      } else if (error.message.includes('Invalid')) {
        errorMessage += 'Invalid OpenAI API key.';
      } else {
        errorMessage += error.message;
      }
      
      setError(errorMessage);
      setProcessingStep('');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const processLecture = async () => {
    if (!uploadedFile || !transcript) {
      setError('Please record or upload audio and wait for transcription to complete');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setSummary(null);
    setFlashcards([]);

    try {
      const transcriptText = transcript.text;

      // Step 1: Generate summary
      setProcessingStep('Generating intelligent summary...');
      let summaryResult;
      
      if (!import.meta.env.VITE_GEMINI_API_KEY) {
        console.warn('Gemini API key not configured, using demo summary');
        summaryResult = { ...mockSummary };
      } else {
        try {
          summaryResult = await geminiServiceRef.current.generateLectureSummary(transcriptText);
        } catch (err) {
          throw new Error(`Summary generation failed: ${err.message}`);
        }
      }
      
      setSummary(summaryResult);

      // Step 2: Generate flashcards
      setProcessingStep('Creating interactive flashcards...');
      let flashcardsResult;
      
      if (!import.meta.env.VITE_GEMINI_API_KEY) {
        flashcardsResult = [...mockFlashcards];
      } else {
        try {
          flashcardsResult = await geminiServiceRef.current.generateFlashcards(transcriptText, 12);
        } catch (err) {
          throw new Error(`Flashcard generation failed: ${err.message}`);
        }
      }
      
      setFlashcards(flashcardsResult);
      setCurrentFlashcardIndex(0);
      setIsFlipped(false);

      // Step 3: Save to backend
      setProcessingStep('Saving session to vault...');
      try {
        await lectureService.create({
          title: uploadedFile.name.replace(/\.[^/.]+$/, "") || 'Untitled Lecture',
          transcript: transcriptText,
          summary: summaryResult,
          flashcards: flashcardsResult,
          duration: recordingTime || 60
        });
      } catch (err) {
        console.warn('Failed to save to backend:', err);
        // Don't throw - allow processing to complete even if save fails
      }

      setActiveTab('summary');
      setProcessingStep('');
    } catch (error) {
      console.error('Audio processing error:', error);
      // Provide detailed error message based on error type
      let errorMessage = 'Processing failed. ';
      
      if (error.message.includes('API key')) {
        errorMessage += 'You need to configure API keys. Check VITE_OPENAI_API_KEY and VITE_GEMINI_API_KEY in your .env file.';
      } else if (error.message.includes('rate limit')) {
        errorMessage += 'API rate limit exceeded. Please wait a moment and try again.';
      } else if (error.message.includes('Invalid')) {
        errorMessage += 'Invalid API key. Please verify your .env configuration.';
      } else {
        errorMessage += error.message || 'An unknown error occurred. Check the browser console for details.';
      }
      
      setError(errorMessage);
      setProcessingStep('');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary-400/10 border border-primary-400/20 flex items-center justify-center text-primary-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">AI Audio Intelligence</p>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">Lecture <span className="text-primary-400">Processor</span></h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Panel - Left Side */}
        <div className="lg:col-span-4 space-y-6">
          <div className="premium-card p-8 bg-gradient-to-br from-primary-600/10 to-transparent">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Audio Capture</h3>

            <div className="space-y-4">
              {/* Record Button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`w-full py-8 rounded-[1.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all group disabled:opacity-50 disabled:cursor-not-allowed ${
                  isRecording ? 'bg-red-500/10 border-red-500/30' : 'bg-white/[0.02] border-white/10 hover:border-primary-400/40'
                }`}
              >
                <div className={`p-4 rounded-full ${
                  isRecording ? 'bg-red-500 animate-pulse' : 'bg-white/5 text-gray-400 group-hover:text-primary-400'
                }`}>
                  {isRecording ? <Square className="w-6 h-6 text-white" /> : <Mic className="w-7 h-7" />}
                </div>
                <div>
                  <p className={`font-black text-sm uppercase tracking-widest ${isRecording ? 'text-red-400' : 'text-white'}`}>
                    {isRecording ? 'Recording' : 'Tap to Record'}
                  </p>
                  {isRecording && <p className="text-xs font-mono text-red-400/60 mt-1">{formatTime(recordingTime)}</p>}
                  {!isRecording && uploadedFile && <p className="text-xs text-gray-500 mt-1">Press to record new</p>}
                </div>
              </button>

              {/* Or Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-dark-surface text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">OR</span>
                </div>
              </div>

              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="w-full btn-secondary py-5 text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                Upload Audio
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="audio/*" className="hidden" />
            </div>

            {/* File Info */}
            {uploadedFile && (
              <div className="mt-8 p-5 glass-card !rounded-2xl border-white/10 animate-in zoom-in-95">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-primary-400/20 rounded-xl flex items-center justify-center text-primary-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-black text-white truncate uppercase">{uploadedFile.name}</p>
                    <p className="text-[10px] font-bold text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>

                {audioUrl && !isProcessing && (
                  <div className="mb-4 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                    <audio src={audioUrl} controls className="w-full h-8" style={{ accentColor: '#06b6d4' }} />
                  </div>
                )}

                {/* Transcription Status */}
                {isProcessing && processingStep.includes('Transcribe') ? (
                  <div className="mb-4 p-3 bg-primary-500/10 border border-primary-500/30 rounded-lg flex items-center gap-3">
                    <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />
                    <span className="text-xs text-primary-300 font-semibold">Converting audio to text...</span>
                  </div>
                ) : transcript ? (
                  <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[8px]">✓</div>
                    <span className="text-xs text-green-300 font-semibold">Transcription complete!</span>
                  </div>
                ) : null}

                {/* Process Button */}
                <button
                  onClick={processLecture}
                  disabled={!uploadedFile || isProcessing || !transcript}
                  className="w-full btn-primary py-4 text-xs font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {processingStep || 'Processing...'}
                    </>
                  ) : !transcript ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Transcribing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Summary & Flashcards
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex gap-3 animate-in">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-red-400">⚠️ Error</p>
                  <p className="text-[10px] text-red-300 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Info Message */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <p className="text-[10px] text-blue-300 leading-relaxed">
                <span className="font-bold">📝 How it works:</span> Upload or record audio → 
                <span className="text-primary-300 font-semibold"> Automatic transcription</span> → 
                <span className="text-primary-300 font-semibold"> Generate summaries & flashcards</span>
              </p>
            </div>
          </div>
        </div>

        {/* Output Panel - Right Side */}
        <div className="lg:col-span-8">
          {isProcessing ? (
            <div className="premium-card h-[600px] flex flex-col items-center justify-center space-y-8 relative overflow-hidden">
              <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-primary-500/5 to-transparent" />
              <div className="relative">
                <div className="absolute inset-0 bg-primary-400 blur-[80px] opacity-20 animate-pulse" />
                <Sparkles className="w-20 h-20 text-primary-400 animate-bounce" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-black text-white tracking-tight uppercase">Processing Audio</h3>
                <p className="text-gray-400 text-sm font-medium mt-2">{processingStep}</p>
              </div>
              <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 animate-pulse" />
              </div>
            </div>
          ) : transcript ? (
            <div className="space-y-6 animate-in fade-in">
              {/* Tabs */}
              <div className="flex gap-2 p-1.5 bg-dark-card border border-white/5 rounded-2xl w-fit">
                {[
                  { id: 'summary', icon: BookOpen, label: 'Summary' },
                  { id: 'transcript', icon: FileText, label: 'Transcript' },
                  { id: 'flashcards', icon: Zap, label: 'Flashcards' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                      activeTab === tab.id ? 'bg-primary-500 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="premium-card min-h-[500px] p-8 overflow-auto max-h-[600px]">
                {/* Summary Tab */}
                {activeTab === 'summary' && summary && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl font-black text-white tracking-tight mb-4">Executive Summary</h2>
                      <p className="text-gray-300 leading-relaxed text-lg italic">{summary.executiveSummary}</p>
                    </div>

                    {summary.keyTopics && (
                      <div>
                        <h4 className="text-xs font-black text-primary-400 uppercase tracking-widest mb-3">Key Topics</h4>
                        <div className="flex flex-wrap gap-2">
                          {summary.keyTopics.map((topic, i) => (
                            <span key={i} className="px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 text-primary-300 text-xs font-bold rounded-lg">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {summary.examLikelyTopics && (
                      <div>
                        <h4 className="text-xs font-black text-orange-400 uppercase tracking-widest mb-3">Exam Likely Topics</h4>
                        <div className="flex flex-wrap gap-2">
                          {summary.examLikelyTopics.map((topic, i) => (
                            <span key={i} className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-bold rounded-lg">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Transcript Tab */}
                {activeTab === 'transcript' && transcript && (
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight mb-4">Full Transcript</h2>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{transcript.text}</p>
                  </div>
                )}

                {/* Flashcards Tab */}
                {activeTab === 'flashcards' && flashcards.length > 0 && (
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="w-full max-w-2xl">
                      {/* Card Counter */}
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-xs font-bold text-gray-500 uppercase">Question {currentFlashcardIndex + 1} of {flashcards.length}</p>
                        <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-400 transition-all"
                            style={{ width: `${((currentFlashcardIndex + 1) / flashcards.length) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Flashcard */}
                      <div
                        className="relative h-64 cursor-pointer"
                        onClick={() => setIsFlipped(!isFlipped)}
                        style={{
                          perspective: '1000px',
                          transformStyle: 'preserve-3d'
                        }}
                      >
                        <div
                          className={`absolute w-full h-full flex items-center justify-center p-8 rounded-2xl border-2 border-primary-500/20 transition-transform duration-500 ${
                            isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
                          }`}
                          style={{
                            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                            transformStyle: 'preserve-3d',
                            backgroundColor: 'rgba(6, 182, 212, 0.05)',
                            backfaceVisibility: 'hidden'
                          }}
                        >
                          <div className="text-center">
                            <p className="text-xs font-bold text-primary-400 uppercase tracking-widest mb-4">Question</p>
                            <p className="text-2xl font-black text-white leading-snug">{flashcards[currentFlashcardIndex]?.question}</p>
                            <p className="text-xs text-gray-500 mt-4">Click to reveal answer</p>
                          </div>
                        </div>

                        <div
                          className="absolute w-full h-full flex items-center justify-center p-8 rounded-2xl border-2 border-primary-400/20 bg-primary-500/5 transition-transform duration-500"
                          style={{
                            transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)',
                            transformStyle: 'preserve-3d',
                            backfaceVisibility: 'hidden'
                          }}
                        >
                          <div className="text-center">
                            <p className="text-xs font-bold text-primary-300 uppercase tracking-widest mb-4">Answer</p>
                            <p className="text-lg font-semibold text-white leading-relaxed">{flashcards[currentFlashcardIndex]?.answer}</p>
                          </div>
                        </div>
                      </div>

                      {/* Navigation */}
                      <div className="flex justify-between items-center mt-8">
                        <button
                          onClick={() => {
                            setCurrentFlashcardIndex(Math.max(0, currentFlashcardIndex - 1));
                            setIsFlipped(false);
                          }}
                          disabled={currentFlashcardIndex === 0}
                          className="px-6 py-3 bg-white/5 border border-white/10 text-white text-xs font-bold rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
                        >
                          ← Previous
                        </button>

                        <button
                          onClick={() => setIsFlipped(!isFlipped)}
                          className="px-6 py-3 bg-primary-500/20 border border-primary-500/30 text-primary-300 text-xs font-bold rounded-lg hover:bg-primary-500/30"
                        >
                          Flip Card
                        </button>

                        <button
                          onClick={() => {
                            setCurrentFlashcardIndex(Math.min(flashcards.length - 1, currentFlashcardIndex + 1));
                            setIsFlipped(false);
                          }}
                          disabled={currentFlashcardIndex === flashcards.length - 1}
                          className="px-6 py-3 bg-white/5 border border-white/10 text-white text-xs font-bold rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Export Button */}
              <div className="flex justify-end gap-4">
                <button className="btn-secondary px-8 py-4 text-xs font-black uppercase tracking-widest">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          ) : (
            <div className="premium-card h-[600px] flex flex-col items-center justify-center text-center p-20">
              <div className="w-24 h-24 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-8">
                <Zap className="w-10 h-10 text-gray-700" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight mb-4">Ready to Process</h2>
              <p className="text-gray-500 text-lg max-w-sm">Record or upload audio to automatically convert to text. Once transcribed, generate intelligent summaries and flashcards powered by OpenAI Whisper and Google Gemini.</p>
              <div className="mt-6 text-xs text-primary-300 bg-primary-500/10 border border-primary-500/30 rounded-lg p-4">
                <p><span className="font-bold">→ Step 1:</span> Record or upload audio file</p>
                <p><span className="font-bold">→ Step 2:</span> We'll automatically convert it to text</p>
                <p><span className="font-bold">→ Step 3:</span> Then generate summaries & flashcards</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Mock data for demo/fallback
const mockTranscript = { 
  text: `Welcome to today's lecture on Quantum Mechanics. We'll be covering the fundamental principles that govern the behavior of matter and energy at the quantum level. The behavior of electrons and photons can only be described using quantum mechanics, which fundamentally differs from classical physics. One of the most important concepts we'll discuss is wave-particle duality, which states that all matter exhibits both wave-like and particle-like properties. This is demonstrated by the double-slit experiment, where we observe both wave interference patterns and particle-like behavior depending on how we measure the system. Another crucial concept is Heisenberg's Uncertainty Principle, which states that we cannot simultaneously know both the position and momentum of a particle with perfect accuracy. The more precisely we determine one property, the less we know about the other. Schrödinger's equation describes how quantum systems evolve over time, providing the mathematical framework for quantum mechanics. Finally, we'll discuss quantum superposition, where particles can exist in multiple states simultaneously until measured or observed.` 
};

const mockSummary = { 
  executiveSummary: "This lecture provides a comprehensive introduction to quantum mechanics, covering fundamental principles that govern matter and energy at the quantum level. Key topics include the dual nature of matter (wave-particle duality), measurement in quantum systems, and the mathematical framework used to predict quantum behavior.",
  keyTopics: [
    "Wave-Particle Duality",
    "Double-Slit Experiment",
    "Heisenberg's Uncertainty Principle",
    "Schrödinger's Equation",
    "Quantum Superposition",
    "Quantum Measurement"
  ],
  examLikelyTopics: [
    "Double-Slit Experiment Results",
    "Uncertainty Principle Limitations",
    "Wave Function Interpretation",
    "Superposition Collapse"
  ],
  tasksToReview: [
    "Review the mathematical implications of wave-particle duality",
    "Practice solving Schrödinger's equation examples",
    "Analyze double-slit experiment results"
  ]
};

const mockFlashcards = [
  { id: 1, question: "What is wave-particle duality?", answer: "The principle that all matter, including electrons and photons, exhibits both wave-like and particle-like properties depending on how it is measured.", difficulty: 'easy' },
  { id: 2, question: "What does the double-slit experiment demonstrate?", answer: "It shows that light and matter display both wave properties (interference patterns when not observed) and particle properties (individual detection events when observed).", difficulty: 'medium' },
  { id: 3, question: "State Heisenberg's Uncertainty Principle", answer: "We cannot simultaneously determine both the position and momentum of a particle with arbitrary precision. The product of uncertainties is at least h/(4π).", difficulty: 'hard' },
  { id: 4, question: "What is quantum superposition?", answer: "A quantum system can exist in multiple states simultaneously until measured or observed, at which point it 'collapses' to one definite state.", difficulty: 'medium' },
  { id: 5, question: "What is the significance of Schrödinger's equation?", answer: "It describes how the quantum state of a system changes over time, providing the fundamental equation of quantum mechanics.", difficulty: 'hard' }
];

export default LectureProcessor;
