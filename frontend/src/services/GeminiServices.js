// Gemini API Service for AI-powered summaries and flashcard generation
// Requires Google AI API key

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export class GeminiService {
  constructor(apiKey = GEMINI_API_KEY) {
    this.apiKey = apiKey;
  }

  async generateContent(prompt, options = {}) {
    if (!this.apiKey || this.apiKey.trim() === '') {
      throw new Error('Gemini API key is missing. Set VITE_GEMINI_API_KEY in your .env file.');
    }

    if (!prompt) {
      throw new Error('No prompt provided for content generation');
    }

    try {
      const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: options.temperature || 0.7,
            topK: options.topK || 40,
            topP: options.topP || 0.95,
            maxOutputTokens: options.maxOutputTokens || 2048,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        if (response.status === 401) {
          throw new Error('Invalid Gemini API key. Please check your VITE_GEMINI_API_KEY.');
        } else if (response.status === 429) {
          throw new Error('Gemini rate limit exceeded. Please wait a moment and try again.');
        }
        throw new Error(`Gemini API error: ${message}`);
      }

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      return text;
      
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  }

  async generateLectureSummary(transcript) {
    const prompt = `You are an expert educational AI assistant. Analyze the following lecture transcript and provide a comprehensive summary.

LECTURE TRANSCRIPT:
${transcript}

Please provide:

1. EXECUTIVE SUMMARY (500 words):
A comprehensive overview highlighting the main concepts, key arguments, and important takeaways.

2. KEY TOPICS:
List 5-7 main topics covered in the lecture.

3. EXAM-LIKELY TOPICS:
Identify 3-5 topics that are most likely to appear on exams based on emphasis, detail level, and explicit mentions.

4. TASKS TO REVIEW:
List specific study tasks mentioned by the professor or implied from the content.

Format your response as JSON with the following structure:
{
  "executiveSummary": "...",
  "keyTopics": ["topic1", "topic2", ...],
  "examLikelyTopics": ["topic1", "topic2", ...],
  "tasksToReview": ["task1", "task2", ...]
}`;

    try {
      const response = await this.generateContent(prompt, {
        temperature: 0.5,
        maxOutputTokens: 3000
      });
      
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Failed to parse summary response');
    } catch (error) {
      console.error('Error generating summary:', error);
      throw error;
    }
  }

  async generateFlashcards(transcript, count = 10) {
    const prompt = `You are an expert educational AI assistant. Create ${count} high-quality flashcards from the following lecture transcript.

LECTURE TRANSCRIPT:
${transcript}

Create flashcards that:
- Focus on key concepts, definitions, and important facts
- Include questions at different difficulty levels (recall, understanding, application)
- Cover the most important exam-likely topics
- Have clear, concise questions and comprehensive answers

Format your response as JSON array:
[
  {
    "question": "What is...",
    "answer": "...",
    "difficulty": "easy|medium|hard"
  },
  ...
]`;

    try {
      const response = await this.generateContent(prompt, {
        temperature: 0.6,
        maxOutputTokens: 4000
      });
      
      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const flashcards = JSON.parse(jsonMatch[0]);
        return flashcards.map((card, index) => ({
          id: index + 1,
          question: card.question,
          answer: card.answer,
          difficulty: card.difficulty || 'medium'
        }));
      }
      
      throw new Error('Failed to parse flashcards response');
    } catch (error) {
      console.error('Error generating flashcards:', error);
      throw error;
    }
  }

  async generateKeyTermsGlossary(transcript) {
    const prompt = `Extract and define key terms from the following lecture transcript.

LECTURE TRANSCRIPT:
${transcript}

Provide a glossary of 10-15 important terms with clear, concise definitions.

Format as JSON:
[
  {
    "term": "...",
    "definition": "..."
  },
  ...
]`;

    try {
      const response = await this.generateContent(prompt, {
        temperature: 0.5,
        maxOutputTokens: 2000
      });
      
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Failed to parse glossary response');
    } catch (error) {
      console.error('Error generating glossary:', error);
      throw error;
    }
  }

  async analyzeFocusPatterns(sessionData) {
    const prompt = `You are an AI study coach analyzing focus patterns. Based on the following session data, provide personalized insights and recommendations.

SESSION DATA:
${JSON.stringify(sessionData, null, 2)}

Analyze:
1. Focus trends and patterns
2. Times of peak performance
3. Common distraction triggers
4. Recovery speed from distractions
5. Comparison to optimal study habits

Provide actionable recommendations for improvement.

Format as JSON:
{
  "insights": ["insight1", "insight2", ...],
  "recommendations": ["rec1", "rec2", ...],
  "strengths": ["strength1", "strength2", ...],
  "areasForImprovement": ["area1", "area2", ...]
}`;

    try {
      const response = await this.generateContent(prompt, {
        temperature: 0.7,
        maxOutputTokens: 2000
      });
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Failed to parse analysis response');
    } catch (error) {
      console.error('Error analyzing focus patterns:', error);
      throw error;
    }
  }
}

export default GeminiService;