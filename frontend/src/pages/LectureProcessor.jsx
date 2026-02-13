import React, { useState, useRef } from 'react';
import { Upload, Mic, Square, Play, Download, FileText, Sparkles, BookOpen } from 'lucide-react';

const LectureProcessor = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState(null);
  const [summary, setSummary] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [activeTab, setActiveTab] = useState('transcript');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const file = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
        setUploadedFile(file);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please grant permission.');
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
      setUploadedFile(file);
    }
  };

  const processLecture = async () => {
    if (!uploadedFile) return;
    
    setIsProcessing(true);
    
    // Simulate API calls to Whisper and Gemini
    // In production, replace with actual API calls
    
    try {
      // Simulate transcription with Whisper API
      await simulateWhisperTranscription();
      
      // Simulate summary generation with Gemini
      await simulateGeminiSummary();
      
      // Generate flashcards
      await generateFlashcards();
      
      setActiveTab('transcript');
    } catch (error) {
      console.error('Error processing lecture:', error);
      alert('Error processing lecture. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateWhisperTranscription = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock transcript data
    setTranscript({
      text: `[Professor] Good morning everyone. Today we're going to discuss Quantum Mechanics and the principles of wave-particle duality.

[Professor] As you know from our previous lectures, classical physics couldn't explain certain phenomena at the atomic scale. This led to the development of quantum mechanics in the early 20th century.

[Student] Professor, can you explain the double-slit experiment again?

[Professor] Excellent question. The double-slit experiment demonstrates wave-particle duality beautifully. When we fire electrons through two slits, they create an interference pattern, which is characteristic of waves. However, when we measure which slit each electron goes through, the interference pattern disappears.

[Professor] This suggests that the act of measurement affects the system. We call this the observer effect, which is fundamental to quantum mechanics.

[Professor] Now, let's move on to the Heisenberg Uncertainty Principle. This principle states that you cannot simultaneously know both the exact position and exact momentum of a particle.

[Student] Why is that the case?

[Professor] It's not a limitation of our measuring instruments. It's a fundamental property of nature. The more precisely you know the position, the less precisely you can know the momentum, and vice versa.

[Professor] For your exam, make sure you understand the mathematical formulation: Δx * Δp ≥ ħ/2, where ħ is the reduced Planck constant.

[Professor] Next week, we'll dive deeper into quantum entanglement and Schrödinger's equation. Please review chapter 4 before then.`,
      chapters: [
        { title: 'Introduction to Quantum Mechanics', timestamp: '00:00' },
        { title: 'Double-Slit Experiment', timestamp: '02:15' },
        { title: 'Heisenberg Uncertainty Principle', timestamp: '05:30' },
        { title: 'Preview of Next Lecture', timestamp: '08:45' }
      ],
      speakers: [
        { name: 'Professor', duration: 540 },
        { name: 'Student', duration: 60 }
      ]
    });
  };

  const simulateGeminiSummary = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSummary({
      executiveSummary: `This lecture covered fundamental concepts in Quantum Mechanics, focusing on wave-particle duality and the Heisenberg Uncertainty Principle. The professor used the double-slit experiment as a key example to demonstrate how quantum particles exhibit both wave-like and particle-like properties. The lecture emphasized the observer effect and introduced the mathematical formulation of the uncertainty principle. Students should pay special attention to the mathematical relationship Δx * Δp ≥ ħ/2 as it is likely to appear on the exam.`,
      keyTopics: [
        'Wave-particle duality',
        'Double-slit experiment',
        'Observer effect',
        'Heisenberg Uncertainty Principle',
        'Quantum measurement'
      ],
      examLikelyTopics: [
        'Mathematical formulation of uncertainty principle',
        'Double-slit experiment interpretation',
        'Difference between classical and quantum physics'
      ],
      tasksToReview: [
        'Review Chapter 4 on quantum entanglement',
        'Practice problems on uncertainty principle calculations',
        'Understand the mathematical proof of wave-particle duality'
      ]
    });
  };

  const generateFlashcards = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setFlashcards([
      {
        id: 1,
        question: 'What is wave-particle duality?',
        answer: 'Wave-particle duality is the concept that all particles exhibit both wave-like and particle-like properties. This is demonstrated in the double-slit experiment where electrons show interference patterns (wave behavior) but can also be detected as individual particles.'
      },
      {
        id: 2,
        question: 'State the Heisenberg Uncertainty Principle',
        answer: 'The Heisenberg Uncertainty Principle states that you cannot simultaneously know both the exact position and exact momentum of a particle. Mathematically: Δx * Δp ≥ ħ/2, where ħ is the reduced Planck constant.'
      },
      {
        id: 3,
        question: 'What is the observer effect in quantum mechanics?',
        answer: 'The observer effect refers to the phenomenon where the act of measurement affects the quantum system being observed. In the double-slit experiment, measuring which slit the electron passes through causes the interference pattern to disappear.'
      },
      {
        id: 4,
        question: 'What did the double-slit experiment prove?',
        answer: 'The double-slit experiment proved wave-particle duality by showing that electrons create an interference pattern when not observed (wave behavior), but this pattern disappears when we measure which slit they pass through (particle behavior).'
      },
      {
        id: 5,
        question: 'Why can\'t we precisely know both position and momentum?',
        answer: 'This is not a limitation of our measuring instruments, but a fundamental property of nature itself. The uncertainty principle is intrinsic to quantum mechanics and reflects the wave-like nature of particles.'
      }
    ]);
  };

  const exportFlashcards = (format) => {
    // Create export content
    let content = '';
    
    if (format === 'anki') {
      content = flashcards.map(card => 
        `"${card.question}","${card.answer}"`
      ).join('\n');
    } else if (format === 'quizlet') {
      content = flashcards.map(card => 
        `${card.question}\t${card.answer}`
      ).join('\n');
    }
    
    // Download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashcards_${format}.${format === 'anki' ? 'csv' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lecture Processor</h1>
          <p className="text-gray-600">Transcribe lectures and generate AI-powered study materials</p>
        </div>

        {/* Input Section */}
        {!transcript && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Record or Upload Lecture</h2>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Record Audio */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <Mic className={`w-12 h-12 mx-auto mb-4 ${isRecording ? 'text-red-500' : 'text-gray-400'}`} />
                <h3 className="font-semibold text-gray-900 mb-2">Record Live</h3>
                <p className="text-sm text-gray-600 mb-4">Record lecture audio in real-time</p>
                
                {isRecording ? (
                  <div>
                    <div className="text-2xl font-mono font-bold text-red-600 mb-4">
                      {formatTime(recordingTime)}
                    </div>
                    <button
                      onClick={stopRecording}
                      className="bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition flex items-center gap-2 mx-auto"
                    >
                      <Square className="w-4 h-4" />
                      Stop Recording
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={startRecording}
                    className="btn-primary flex items-center gap-2 mx-auto"
                  >
                    <Mic className="w-4 h-4" />
                    Start Recording
                  </button>
                )}
              </div>

              {/* Upload File */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Upload File</h3>
                <p className="text-sm text-gray-600 mb-4">MP3, MP4, WAV, or M4A</p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="btn-primary flex items-center gap-2 mx-auto"
                >
                  <Upload className="w-4 h-4" />
                  Choose File
                </button>
                
                {uploadedFile && (
                  <p className="text-sm text-green-600 mt-3">
                    ✓ {uploadedFile.name}
                  </p>
                )}
              </div>
            </div>

            {uploadedFile && !isProcessing && (
              <div className="text-center">
                <button
                  onClick={processLecture}
                  className="bg-gradient-to-r from-primary-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-primary-700 hover:to-purple-700 transition flex items-center gap-2 mx-auto text-lg"
                >
                  <Sparkles className="w-5 h-5" />
                  Process with AI
                </button>
              </div>
            )}

            {isProcessing && (
              <div className="text-center">
                <div className="inline-flex items-center gap-3 bg-primary-50 text-primary-700 px-6 py-3 rounded-lg">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                  <span className="font-medium">Processing lecture...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Section */}
        {transcript && (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="card">
              <div className="flex items-center gap-2 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('transcript')}
                  className={`px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === 'transcript'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Transcript
                </button>
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === 'summary'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  AI Summary
                </button>
                <button
                  onClick={() => setActiveTab('flashcards')}
                  className={`px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === 'flashcards'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4 inline mr-2" />
                  Flashcards ({flashcards.length})
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'transcript' && (
                  <div>
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Chapters</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {transcript.chapters.map((chapter, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">{chapter.title}</span>
                              <span className="text-xs text-gray-500">{chapter.timestamp}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Speakers</h3>
                      <div className="flex gap-4">
                        {transcript.speakers.map((speaker, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-primary-600"></div>
                            <span className="text-sm text-gray-700">{speaker.name}</span>
                            <span className="text-xs text-gray-500">({Math.floor(speaker.duration / 60)}m)</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Full Transcript</h3>
                      <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                          {transcript.text}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'summary' && summary && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Executive Summary</h3>
                      <p className="text-gray-700 leading-relaxed">{summary.executiveSummary}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Key Topics</h3>
                      <div className="flex flex-wrap gap-2">
                        {summary.keyTopics.map((topic, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                        ⚠️ Exam-Likely Topics
                      </h3>
                      <ul className="space-y-2">
                        {summary.examLikelyTopics.map((topic, index) => (
                          <li key={index} className="text-sm text-orange-800">• {topic}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Tasks to Review</h3>
                      <ul className="space-y-2">
                        {summary.tasksToReview.map((task, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <input type="checkbox" className="mt-1" />
                            <span className="text-gray-700">{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'flashcards' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-gray-900">Generated Flashcards</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => exportFlashcards('anki')}
                          className="btn-secondary text-sm flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Export to Anki
                        </button>
                        <button
                          onClick={() => exportFlashcards('quizlet')}
                          className="btn-secondary text-sm flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Export to Quizlet
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {flashcards.map((card) => (
                        <div key={card.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-primary-50 p-4 border-b border-gray-200">
                            <p className="font-medium text-gray-900">{card.question}</p>
                          </div>
                          <div className="p-4 bg-white">
                            <p className="text-gray-700">{card.answer}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  setTranscript(null);
                  setSummary(null);
                  setFlashcards([]);
                  setUploadedFile(null);
                }}
                className="btn-secondary"
              >
                Process Another Lecture
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LectureProcessor;