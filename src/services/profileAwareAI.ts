import { groqApiService } from './groqApiService';
import { webSearchService } from './webSearchService';

export interface UserProfile {
  name: string;
  school: string;
  grade: string;
  subjects: string[];
  goals: string[];
  parentContact?: string;
  userType: 'student' | 'teacher';
}

export class ProfileAwareAI {
  
  // Get user profile from localStorage
  private getUserProfile(): UserProfile | null {
    try {
      const profile = localStorage.getItem('userProfile');
      if (!profile) {
        console.log('ProfileAwareAI - No user profile found in localStorage');
        return null;
      }
      
      const parsedProfile = JSON.parse(profile);
      console.log('ProfileAwareAI - Loaded user profile:', parsedProfile);
      
      // Validate profile structure
      if (!parsedProfile || typeof parsedProfile !== 'object') {
        console.error('ProfileAwareAI - Invalid profile structure:', parsedProfile);
        return null;
      }
      
      // Ensure subjects is an array
      if (!parsedProfile.subjects || !Array.isArray(parsedProfile.subjects)) {
        console.warn('ProfileAwareAI - Profile missing or invalid subjects array, using default');
        parsedProfile.subjects = ['General'];
      }
      
      return parsedProfile;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }

  // Create personalized system prompt based on profile
  private createPersonalizedPrompt(basePrompt: string, notes: string, topic: string): string {
    const profile = this.getUserProfile();
    if (!profile) return basePrompt;

    const grade = profile.grade;
    const subjects = profile.subjects.join(', ');
    const goals = profile.goals.join(', ');
    const school = profile.school;

    // Determine difficulty level based on grade
    const difficultyLevel = this.getDifficultyFromGrade(grade);
    
    // Create personalized context
    const personalizedContext = `
PERSONALIZATION CONTEXT:
- Student Name: ${profile.name}
- Grade Level: ${grade}
- School: ${profile.school}
- Subjects Studying: ${subjects}
- Learning Goals: ${goals}
- Difficulty Level: ${difficultyLevel}
- Country: Ghana
- Curriculum: Ghana Education Service (GES) Curriculum

GHANA CURRICULUM CONTEXT:
- You are an expert in the Ghanaian educational system and curriculum
- Reference Ghana-specific examples, landmarks, culture, and context
- Align content with Ghana Education Service (GES) standards
- Use examples from Ghanaian geography, history, and culture
- Reference Ghanaian cities, regions, and local contexts
- Consider Ghana's educational progression: Basic School (Grade 1-9) → Senior High School (Grade 10-12)
- Include references to Ghanaian exam systems (BECE for Grade 9, WASSCE for Grade 12)

PERSONALIZATION GUIDELINES:
- Adjust all content difficulty to ${difficultyLevel} level appropriate for ${grade} in Ghana
- Reference the student's subjects (${subjects}) when relevant
- Align content with their specific goals: ${goals}
- Use Ghana-specific examples and references appropriate for ${grade} students
- Consider the ${profile.school} curriculum context within Ghana's educational system
- Make explanations clear and engaging for Ghanaian students
- Include cultural context that resonates with Ghanaian learners
`;

    return `${personalizedContext}\n\n${basePrompt}`;
  }

  // Determine difficulty level from grade
  private getDifficultyFromGrade(grade: string): string {
    const gradeNum = parseInt(grade.replace('Grade ', ''));
    if (gradeNum <= 7) return 'beginner';
    if (gradeNum === 8) return 'beginner-intermediate';
    if (gradeNum === 9) return 'intermediate';
    if (gradeNum === 10) return 'intermediate';
    if (gradeNum === 11) return 'intermediate-advanced';
    if (gradeNum >= 12) return 'advanced';
    return 'intermediate';
  }

  // Enhanced note analysis with profile context
  async analyzeNotesWithProfile(notes: string): Promise<{
    topic: string;
    subject: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    keyConcepts: string[];
    summary: string;
    personalizedInsights: string[];
  }> {
    const profile = this.getUserProfile();
    const baseAnalysis = await groqApiService.analyzeNotes(notes);
    
    if (!profile) return baseAnalysis;

    // Add personalized insights based on profile
    const personalizedInsights = this.generatePersonalizedInsights(baseAnalysis, profile);
    
    return {
      ...baseAnalysis,
      personalizedInsights
    };
  }

  // Enhanced learning path generation with profile context
  async generatePersonalizedLearningPath(notes: string, topic: string): Promise<{
    steps: Array<{
      title: string;
      description: string;
      objectives: Array<{title: string; preview: string;}>;
      resources: Array<{
        type: 'text' | 'video' | 'pdf' | 'interactive';
        title: string;
        content?: string;
        url?: string;
        duration?: string;
        description: string;
        estimatedTime: string;
      }>;
      personalizedTips: string[];
    }>;
  }> {
    const profile = this.getUserProfile();
    
    console.log('ProfileAwareAI - Profile found:', !!profile);
    console.log('ProfileAwareAI - Profile details:', profile);
    
    if (!profile) {
      console.log('ProfileAwareAI - No profile found, using Groq API fallback');
      return await groqApiService.generateLearningPath(notes, topic);
    }

    // Search for web resources
    console.log('ProfileAwareAI - Searching for web resources...');
    console.log('ProfileAwareAI - Topic:', topic);
    console.log('ProfileAwareAI - Subject:', profile.subjects?.[0] || 'General');
    console.log('ProfileAwareAI - Grade:', profile.grade);
    
    let webResources = [];
    try {
      const subject = profile.subjects?.[0] || 'General';
      webResources = await webSearchService.searchGhanaEducationalContent(topic, subject, profile.grade);
      console.log('ProfileAwareAI - Web resources found:', webResources.length);
      console.log('ProfileAwareAI - Web resources:', webResources);
    } catch (error) {
      console.error('ProfileAwareAI - Error searching web resources:', error);
      webResources = [];
    }

    const personalizedPrompt = this.createPersonalizedPrompt(`
You are an educational AI expert specializing in the Ghanaian curriculum and educational system.

Based on the student's profile and notes, create a 3-step learning pathway that is:
- Age-appropriate for ${profile.grade} level in Ghana
- Aligned with Ghana Education Service (GES) curriculum standards
- Focused on their subjects: ${profile.subjects.join(', ')}
- Targeted towards their goals: ${profile.goals.join(', ')}
- Suitable for ${this.getDifficultyFromGrade(profile.grade)} difficulty level
- Contextualized for Ghanaian students with local examples and references
- Include extensive reading content and real web resources

CRITICAL: You MUST respond with ONLY a valid JSON object. Do not include any explanatory text, markdown formatting, or other content. Start your response with { and end with }. No exceptions. Your entire response must be parseable as JSON.

CRITICAL JSON REQUIREMENTS:
- Keep each objective preview to 1 sentence maximum
- Keep resource descriptions to 1 sentence maximum  
- Keep step descriptions to 1 sentence maximum
- Ensure all arrays are properly closed with ]
- Ensure all objects are properly closed with }
- Do not exceed 4000 characters total
- Test that your JSON is valid before responding
- If approaching limit, prioritize completing the JSON structure over detailed content
- IMPORTANT: Do not include line breaks, tabs, or control characters in string values
- Use \\n for line breaks in descriptions, not actual newlines
- Escape any special characters properly in JSON strings
- CRITICAL: Complete the JSON structure even if it means shorter content

The JSON object must contain:
- steps: Array of 3 learning steps, each with:
  - title: Step title appropriate for ${profile.grade} level
  - description: What the student will learn (use \\n for line breaks)
  - objectives: Array of 2-3 learning objectives, each with:
    - title: Clear objective statement
    - preview: Comprehensive preview content explaining the concept (3-4 paragraphs with examples)
  - resources: Array of 3-5 learning resources, each with:
    - type: "text", "video", "pdf", "article", or "interactive"
    - title: Resource title
    - content: Full text content (only for text type, use \\n for line breaks)
    - url: Provide real URLs from educational sources (YouTube, Khan Academy, etc.)
    - description: What the resource covers
    - estimatedTime: Time estimate appropriate for ${profile.grade} level
    - source: The source platform (e.g., "Khan Academy", "YouTube", "Ghana Education Service")
  - personalizedTips: Array of 2-3 study tips specific to their goals and subjects

CONTENT GUIDELINES:
- Use language and examples appropriate for ${profile.grade} students in Ghana
- Reference their subjects (${profile.subjects.join(', ')}) when relevant
- Include tips that help achieve their goals: ${profile.goals.join(', ')}
- Make content engaging and relatable to Ghanaian students
- Ensure difficulty matches ${this.getDifficultyFromGrade(profile.grade)} level
- Use Ghana-specific examples, landmarks, and cultural references
- Align with Ghana Education Service (GES) curriculum standards
- Include references to Ghanaian cities, regions, and local context
- Consider Ghana's exam systems (BECE for Grade 9, WASSCE for Grade 12)
- Include extensive reading content with detailed explanations
- Provide real, working URLs to educational resources (YouTube videos, Khan Academy lessons, Wikipedia articles, educational websites)
- Focus on comprehensive text-based learning materials
- Ensure all resource URLs are actual links that students can click and access
- For objectives, provide detailed preview content that teaches the concept directly
- Make objectives self-contained learning materials with examples and explanations
`, notes, topic);

    // Use the personalized prompt with Groq API
    console.log('ProfileAwareAI - Making Groq API request...');
    console.log('ProfileAwareAI - Personalized prompt length:', personalizedPrompt.length);
    console.log('ProfileAwareAI - Notes length:', notes.length);
    
    let response;
    try {
      response = await groqApiService.makeRequest([{
        role: 'system',
        content: personalizedPrompt
      }, {
        role: 'user',
        content: `Create a personalized learning pathway for this topic based on these notes:\n\nTopic: ${topic}\n\nNotes:\n${notes}`
      }]);
      console.log('ProfileAwareAI - Groq API response received, length:', response.length);
      console.log('ProfileAwareAI - Groq API response preview:', response.substring(0, 200));
    } catch (error) {
      console.error('ProfileAwareAI - Groq API request failed:', error);
      throw error;
    }

    try {
      console.log('Raw AI response for learning path:', response);
      const result = JSON.parse(response);
      console.log('Parsed learning path result:', result);
      
      // Validate the result structure
      if (!result || !result.steps || !Array.isArray(result.steps)) {
        console.error('Invalid learning path structure from AI:', result);
        throw new Error('Invalid learning path structure from AI');
      }
      
      return result;
    } catch (error) {
      console.error('Error parsing personalized learning path:', error);
      console.error('Raw response that failed to parse:', response);
      
      // Try to extract JSON from the response
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const extractedJson = JSON.parse(jsonMatch[0]);
          console.log('Successfully extracted JSON from response:', extractedJson);
          return extractedJson;
        }
      } catch (extractionError) {
        console.error('Failed to extract JSON from response:', extractionError);
      }
      
      // Final fallback to standard generation
      console.log('Falling back to standard Groq API learning path generation');
      return await groqApiService.generateLearningPath(notes, topic);
    }
  }

  // Enhanced quiz generation with profile context
  async generatePersonalizedQuizQuestions(notes: string, topic: string): Promise<Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    subjectAlignment: string;
    goalAlignment: string;
  }>> {
    const profile = this.getUserProfile();
    
    if (!profile) {
      return await groqApiService.generateQuizQuestions(notes, topic);
    }

    const personalizedPrompt = this.createPersonalizedPrompt(`
You are an educational AI expert specializing in the Ghanaian curriculum and educational system.

Create 5 quiz questions that are:
- Appropriate for ${profile.grade} level in Ghana (${this.getDifficultyFromGrade(profile.grade)} difficulty)
- Aligned with Ghana Education Service (GES) curriculum standards
- Focused on their subjects: ${profile.subjects.join(', ')}
- Relevant to their goals: ${profile.goals.join(', ')}
- Engaging and age-appropriate for Ghanaian students
- Include Ghana-specific examples, landmarks, and cultural context

IMPORTANT: Respond with ONLY a valid JSON array. No markdown formatting, no explanations, just pure JSON.

Each question must contain:
- question: The question text (use \\n for line breaks if needed)
- options: Array of 4 answer choices
- correctAnswer: Index of correct answer (0-3)
- explanation: Detailed explanation of the answer
- difficulty: "beginner", "intermediate", or "advanced" (adjusted for ${profile.grade})
- subjectAlignment: Which subject this question aligns with
- goalAlignment: Which learning goal this supports

QUESTION GUIDELINES:
- Use examples and scenarios relevant to ${profile.grade} students
- Reference concepts from their subjects: ${profile.subjects.join(', ')}
- Make questions help achieve their goals: ${profile.goals.join(', ')}
- Use language appropriate for this age group
- Ensure difficulty progression is suitable for ${this.getDifficultyFromGrade(profile.grade)}
`, notes, topic);

    const response = await groqApiService.makeRequest([{
      role: 'system',
      content: personalizedPrompt
    }, {
      role: 'user',
      content: `Create personalized quiz questions for this topic based on these notes:\n\nTopic: ${topic}\n\nNotes:\n${notes}`
    }]);

    try {
      const result = JSON.parse(response);
      return result;
    } catch (error) {
      console.error('Error parsing personalized quiz questions:', error);
      // Fallback to standard generation
      return await groqApiService.generateQuizQuestions(notes, topic);
    }
  }

  // Enhanced flashcard generation with profile context
  async generatePersonalizedFlashcards(notes: string, topic: string): Promise<Array<{
    front: string;
    back: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    subject: string;
    studyTips: string[];
  }>> {
    const profile = this.getUserProfile();
    
    if (!profile) {
      // Fallback to mock flashcards for now
      return this.generateMockFlashcards(notes, topic);
    }

    const personalizedPrompt = this.createPersonalizedPrompt(`
You are an educational AI expert specializing in the Ghanaian curriculum and educational system.

Create 8 flashcards that are:
- Appropriate for ${profile.grade} level in Ghana (${this.getDifficultyFromGrade(profile.grade)} difficulty)
- Aligned with Ghana Education Service (GES) curriculum standards
- Focused on their subjects: ${profile.subjects.join(', ')}
- Relevant to their goals: ${profile.goals.join(', ')}
- Optimized for spaced repetition learning
- Include Ghana-specific examples and cultural context

IMPORTANT: Respond with ONLY a valid JSON array. No markdown formatting, no explanations, just pure JSON.

Each flashcard must contain:
- front: The question or prompt (concise, clear)
- back: The answer or explanation (detailed but age-appropriate)
- difficulty: "beginner", "intermediate", or "advanced"
- subject: Which subject this flashcard covers
- studyTips: Array of 2-3 study tips specific to this card

FLASHCARD GUIDELINES:
- Use terminology appropriate for ${profile.grade} students
- Reference concepts from their subjects: ${profile.subjects.join(', ')}
- Make cards help achieve their goals: ${profile.goals.join(', ')}
- Keep front side concise and clear
- Make back side educational and comprehensive
- Include memory aids and study strategies
`, notes, topic);

    console.log('=== FLASHCARD GENERATION DEBUG ===');
    console.log('Topic:', topic);
    console.log('Notes length:', notes ? notes.length : 'undefined');
    console.log('Notes preview:', notes ? notes.substring(0, 200) + '...' : 'undefined');
    console.log('Full notes:', notes);
    
    const userMessage = `Create personalized flashcards for this topic based on these notes:\n\nTopic: ${topic}\n\nNotes:\n${notes}`;
    console.log('User message length:', userMessage.length);
    console.log('User message preview:', userMessage.substring(0, 300) + '...');
    
    const response = await groqApiService.makeRequest([{
      role: 'system',
      content: personalizedPrompt
    }, {
      role: 'user',
      content: userMessage
    }]);

    try {
      console.log('Raw AI response for flashcards:', response);
      const result = JSON.parse(response);
      console.log('Parsed flashcards result:', result);
      return result;
    } catch (error) {
      console.error('Error parsing personalized flashcards:', error);
      console.error('Raw response that failed to parse:', response);
      
      // Try to extract JSON from the response
      try {
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const extractedJson = JSON.parse(jsonMatch[0]);
          console.log('Successfully extracted JSON from response:', extractedJson);
          return extractedJson;
        }
      } catch (extractionError) {
        console.error('Failed to extract JSON from response:', extractionError);
      }
      
      // Final fallback to mock generation
      console.log('Falling back to mock flashcard generation');
      return this.generateMockFlashcards(notes, topic);
    }
  }

  // Generate personalized insights based on profile and analysis
  private generatePersonalizedInsights(analysis: any, profile: UserProfile): string[] {
    const insights: string[] = [];
    
    // Subject-specific insights
    if (profile.subjects.includes('Mathematics')) {
      insights.push("Focus on problem-solving strategies that align with your math goals");
    }
    
    if (profile.subjects.includes('Science')) {
      insights.push("Connect scientific concepts to real-world applications for better understanding");
    }
    
    if (profile.subjects.includes('English Language')) {
      insights.push("Practice reading comprehension and vocabulary building for language improvement");
    }

    // Goal-specific insights
    if (profile.goals.some(goal => goal.includes('BECE'))) {
      insights.push("Structure your study sessions to cover all BECE examination topics systematically");
    }
    
    if (profile.goals.some(goal => goal.includes('WASSCE'))) {
      insights.push("Focus on advanced problem-solving and critical thinking for WASSCE preparation");
    }
    
    if (profile.goals.some(goal => goal.includes('university'))) {
      insights.push("Develop strong foundational knowledge that will support university-level studies");
    }

    // Grade-level insights for Ghanaian students
    const gradeNum = parseInt(profile.grade.replace('Grade ', ''));
    if (gradeNum <= 9) {
      insights.push("Build strong foundational concepts that will support your transition to Senior High School in Ghana");
      if (gradeNum === 9) {
        insights.push("Focus on BECE preparation - this is a crucial milestone in your Ghanaian education journey");
      }
    }
    
    if (gradeNum >= 10) {
      insights.push("Develop critical thinking skills essential for WASSCE and higher education in Ghana");
      if (gradeNum === 12) {
        insights.push("Prepare for WASSCE - your gateway to tertiary education in Ghana and beyond");
      }
    }

    return insights;
  }

  // Mock flashcards for fallback
  private generateMockFlashcards(notes: string, topic: string): Array<{
    front: string;
    back: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    subject: string;
    studyTips: string[];
  }> {
    return [
      {
        front: `What is the main concept of ${topic}?`,
        back: `The main concept of ${topic} involves understanding the fundamental principles and applications discussed in your notes.`,
        difficulty: 'beginner',
        subject: 'General',
        studyTips: ['Review this concept daily', 'Create examples from your notes', 'Practice explaining to others']
      },
      {
        front: `How does ${topic} relate to real-world applications?`,
        back: `${topic} has practical applications in various fields. Understanding these connections helps with retention and comprehension.`,
        difficulty: 'intermediate',
        subject: 'General',
        studyTips: ['Find examples in everyday life', 'Connect to your other subjects', 'Discuss with classmates']
      }
    ];
  }
}

export const profileAwareAI = new ProfileAwareAI();
