const GROQ_API_URL = '/api/groq';

// Available models with their characteristics (Updated 2024 - Current active Groq models)
const AVAILABLE_MODELS = [
  {
    name: 'llama-3.3-70b-versatile',
    maxTokens: 12000,
    priority: 1,
    description: 'Latest Llama 3.3 70B model with versatile capabilities'
  },
  {
    name: 'llama-3.1-8b-instant',
    maxTokens: 8000,
    priority: 2,
    description: 'Fast, efficient model for quick responses'
  },
  {
    name: 'groq/compound',
    maxTokens: 8000,
    priority: 3,
    description: 'Groq compound model for diverse tasks'
  },
  {
    name: 'groq/compound-mini',
    maxTokens: 4000,
    priority: 4,
    description: 'Lightweight Groq compound model for quick tasks'
  }
];

// Rate limit tracking for each model
const rateLimitTracker = new Map<string, {
  lastReset: number;
  tokensUsed: number;
  requestsCount: number;
  isBlocked: boolean;
  blockUntil?: number;
}>();


interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

class GroqApiService {
  // Get the best available model based on priority and rate limits
  private getBestAvailableModel(requestedTokens: number = 2000): string {
    const now = Date.now();
    const availableModels = AVAILABLE_MODELS
      .filter(model => {
        const tracker = rateLimitTracker.get(model.name);
        if (!tracker) return true;
        
        // Check if model is currently blocked
        if (tracker.isBlocked && tracker.blockUntil && now < tracker.blockUntil) {
          return false;
        }
        
        // Check if model has enough token capacity
        return model.maxTokens >= requestedTokens;
      })
      .sort((a, b) => a.priority - b.priority);
    
    if (availableModels.length === 0) {
      console.warn('No models available, using fallback to first model');
      return AVAILABLE_MODELS[0].name;
    }
    
    const selectedModel = availableModels[0];
    console.log(`Selected model: ${selectedModel.name} (${selectedModel.description})`);
    return selectedModel.name;
  }

  // Update rate limit tracking for a model
  private updateRateLimit(modelName: string, tokensUsed: number, isBlocked: boolean = false, blockUntil?: number) {
    const now = Date.now();
    const tracker = rateLimitTracker.get(modelName) || {
      lastReset: now,
      tokensUsed: 0,
      requestsCount: 0,
      isBlocked: false
    };
    
    // Reset counters every minute
    if (now - tracker.lastReset > 60000) {
      tracker.lastReset = now;
      tracker.tokensUsed = 0;
      tracker.requestsCount = 0;
      tracker.isBlocked = false;
    }
    
    tracker.tokensUsed += tokensUsed;
    tracker.requestsCount += 1;
    tracker.isBlocked = isBlocked;
    if (blockUntil) {
      tracker.blockUntil = blockUntil;
    }
    
    rateLimitTracker.set(modelName, tracker);
    
    console.log(`Rate limit update for ${modelName}:`, {
      tokensUsed: tracker.tokensUsed,
      requestsCount: tracker.requestsCount,
      isBlocked: tracker.isBlocked,
      blockUntil: tracker.blockUntil
    });
  }

  // Extract retry delay from rate limit error
  private extractRetryDelay(errorMessage: string): number {
    const retryMatch = errorMessage.match(/try again in ([\d.]+)s/i);
    if (retryMatch) {
      return Math.ceil(parseFloat(retryMatch[1]) * 1000); // Convert to milliseconds
    }
    return 5000; // Default 5 seconds
  }

  // Repair JSON that was truncated mid-string or mid-structure
  private repairTruncatedJson(jsonString: string): string {
    try {
      // First try to parse as-is
      JSON.parse(jsonString);
      return jsonString;
    } catch (error) {
      try {
        console.log('Attempting to repair truncated JSON...');
        
        let repaired = jsonString;
        
        // Handle truncation at the end of a string value
        if (repaired.match(/"[^"]*$/)) {
          console.log('Detected truncation in string value, attempting repair...');
          
          // Find the last complete object/array and truncate there
          const lastCompleteBrace = repaired.lastIndexOf('}');
          const lastCompleteBracket = repaired.lastIndexOf(']');
          const lastComplete = Math.max(lastCompleteBrace, lastCompleteBracket);
          
          if (lastComplete > 0) {
            // Truncate to the last complete structure
            repaired = repaired.substring(0, lastComplete + 1);
            
            // Add missing closing brackets/braces
            const openBraces = (repaired.match(/{/g) || []).length;
            const closeBraces = (repaired.match(/}/g) || []).length;
            const openBrackets = (repaired.match(/\[/g) || []).length;
            const closeBrackets = (repaired.match(/]/g) || []).length;
            
            for (let i = 0; i < openBraces - closeBraces; i++) {
              repaired += '}';
            }
            for (let i = 0; i < openBrackets - closeBrackets; i++) {
              repaired += ']';
            }
          }
        }
        
        // Handle truncation with trailing comma
        if (repaired.match(/,\s*$/)) {
          console.log('Removing trailing comma...');
          repaired = repaired.replace(/,\s*$/, '');
        }
        
        console.log('Truncated JSON repair completed');
        return repaired;
      } catch (repairError) {
        console.error('Truncated JSON repair failed:', repairError);
        return jsonString;
      }
    }
  }

  // Helper method to parse JSON responses from AI
  private parseJsonResponse(response: string, context: string): any {
    try {
      // Clean up the response by removing markdown formatting and non-JSON content
      let cleanResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/`/g, '')
        .replace(/^[^{[]*/, '') // Remove any text before the first { or [
        .trim();
      
      // If the response doesn't contain JSON, try to find it
      if (!cleanResponse.includes('{') && !cleanResponse.includes('[')) {
        console.log('No JSON found in response, checking for alternative formats...');
        console.log('Raw response preview:', response.substring(0, 200));
        
        // Try to extract JSON from markdown code blocks
        const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
          cleanResponse = jsonMatch[1];
          console.log('Found JSON in markdown code block');
        } else {
          // Try to find any JSON-like structure
          const anyJsonMatch = response.match(/(\{[\s\S]*?\})/);
          if (anyJsonMatch) {
            cleanResponse = anyJsonMatch[1];
            console.log('Found JSON-like structure in response');
          }
        }
      }
      
      // Try to find JSON array
      const jsonMatch = cleanResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const jsonString = this.cleanJsonString(jsonMatch[0]);
        console.log(`Parsing ${context} JSON:`, jsonString.substring(0, 200) + '...');
        return JSON.parse(jsonString);
      }
      
      // If no array found, try to parse the entire response as JSON
      const cleanedResponse = this.cleanJsonString(cleanResponse);
      console.log(`Attempting to parse entire ${context} response as JSON:`, cleanedResponse.substring(0, 200) + '...');
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error(`Failed to parse ${context} response:`, error);
      console.error('Raw response:', response);
      throw error;
    }
  }

  // Helper method to parse JSON object responses from AI
  private parseJsonObjectResponse(response: string, context: string): any {
    try {
      // Clean up the response by removing markdown formatting
      let cleanResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/`/g, '')
        .trim();
      
      // Try to find JSON object
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonString = this.cleanJsonString(jsonMatch[0]);
        console.log(`Parsing ${context} JSON object (first 200 chars):`, jsonString.substring(0, 200) + '...');
        console.log(`JSON string starts with: "${jsonString.charAt(0)}" (char code: ${jsonString.charCodeAt(0)})`);
        console.log(`JSON string length: ${jsonString.length}`);
        
        if (!jsonString || jsonString.length === 0) {
          throw new Error('JSON string is empty after cleaning');
        }
        
        return JSON.parse(jsonString);
      }
      
      // If no object found, try to parse the entire response as JSON
      const cleanedResponse = this.cleanJsonString(cleanResponse);
      console.log(`Attempting to parse entire ${context} response as JSON (first 200 chars):`, cleanedResponse.substring(0, 200) + '...');
      console.log(`Cleaned response starts with: "${cleanedResponse.charAt(0)}" (char code: ${cleanedResponse.charCodeAt(0)})`);
      console.log(`Cleaned response length: ${cleanedResponse.length}`);
      
      if (!cleanedResponse || cleanedResponse.length === 0) {
        throw new Error('Cleaned response is empty');
      }
      
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error(`Failed to parse ${context} response:`, error);
      console.error('Raw response:', response);
      throw error;
    }
  }

  // Helper method to clean JSON string by escaping control characters
  private cleanJsonString(jsonString: string): string {
    try {
      // First, try to parse as-is to see if it's already valid
      JSON.parse(jsonString);
      return jsonString;
    } catch (error) {
      console.log('JSON parsing failed, attempting to fix control characters...');
      
      // Use a more robust approach - try to extract and rebuild the JSON
      try {
        // Remove any leading/trailing whitespace and non-printable characters
        let cleaned = jsonString.trim();
        
        // Remove any leading/trailing quotes or backticks that might be wrapping the JSON
        cleaned = cleaned.replace(/^["`']|["`']$/g, '');
        
        // Remove any invisible characters (like BOM or zero-width characters)
        cleaned = cleaned.replace(/[\uFEFF\u200B-\u200D\u2060]/g, '');
        
        // Properly escape control characters in JSON string values
        cleaned = this.escapeControlCharacters(cleaned);
        
        // Try to parse the cleaned version
        JSON.parse(cleaned);
        return cleaned;
      } catch (e) {
        // If all else fails, try a simple approach with proper control character escaping
        const cleaned = jsonString
          .trim()
          .replace(/^["`']|["`']$/g, '') // Remove wrapping quotes
          .replace(/[\uFEFF\u200B-\u200D\u2060]/g, '') // Remove invisible characters
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t')
          .replace(/\f/g, '\\f');
        
        return cleaned;
      }
    }
  }

  // Helper method to properly escape control characters in JSON strings
  private escapeControlCharacters(jsonString: string): string {
    // This method handles control characters that can appear in JSON string values
    return jsonString
      .replace(/\r/g, '\\r')           // Carriage return
      .replace(/\n/g, '\\n')           // Line feed
      .replace(/\t/g, '\\t')           // Tab
      .replace(/\f/g, '\\f')           // Form feed
      .replace(/\b/g, '\\b')           // Backspace
      .replace(/\u0000-\u001F/g, (match) => {
        // Escape other control characters (0x00-0x1F)
        const charCode = match.charCodeAt(0);
        return `\\u${charCode.toString(16).padStart(4, '0')}`;
      })
      .replace(/\u007F/g, '\\u007f')   // DEL character
      .replace(/\u0080-\u009F/g, (match) => {
        // Escape extended control characters (0x80-0x9F)
        const charCode = match.charCodeAt(0);
        return `\\u${charCode.toString(16).padStart(4, '0')}`;
      });
  }

  // Repair common JSON issues in AI responses
  private repairJson(jsonString: string, context: string = ''): string {
    try {
      // First try to parse as-is
      JSON.parse(jsonString);
      return jsonString;
    } catch (error) {
      console.log('Attempting to repair JSON...');
      
      try {
        let repaired = jsonString;
        
        // Fix common issues:
        
        // 1. Fix unescaped quotes in strings
        repaired = repaired.replace(/([^\\])"([^"]*)"([^\\])/g, (match, before, content, after) => {
          // Only fix if it's not already properly escaped
          if (!match.includes('\\"')) {
            return before + '"' + content.replace(/"/g, '\\"') + '"' + after;
          }
          return match;
        });
        
        // 2. Fix missing commas between array elements
        repaired = repaired.replace(/\]\s*\[/g, '],[');
        repaired = repaired.replace(/}\s*{/g, '},{');
        
        // 3. Fix missing commas between object properties
        repaired = repaired.replace(/"\s*\n\s*"/g, '",\n"');
        repaired = repaired.replace(/"\s*}\s*"/g, '",\n"');
        
        // 4. Fix trailing commas before closing brackets/braces
        repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
        
        // 5. Fix incomplete arrays/objects by finding the last complete element
        const lastCompleteBrace = repaired.lastIndexOf('}');
        const lastCompleteBracket = repaired.lastIndexOf(']');
        const lastComplete = Math.max(lastCompleteBrace, lastCompleteBracket);
        
        if (lastComplete > 0) {
          // Check if we need to close incomplete structures
          const openBraces = (repaired.substring(0, lastComplete).match(/{/g) || []).length;
          const closeBraces = (repaired.substring(0, lastComplete).match(/}/g) || []).length;
          const openBrackets = (repaired.substring(0, lastComplete).match(/\[/g) || []).length;
          const closeBrackets = (repaired.substring(0, lastComplete).match(/]/g) || []).length;
          
          // Add missing closing brackets/braces
          let fixed = repaired.substring(0, lastComplete + 1);
          for (let i = 0; i < openBraces - closeBraces; i++) {
            fixed += '}';
          }
          for (let i = 0; i < openBrackets - closeBrackets; i++) {
            fixed += ']';
          }
          repaired = fixed;
        }
        
        // 6. Fix common AI response issues
        // Remove any text after the last complete JSON structure
        const jsonEnd = Math.max(repaired.lastIndexOf('}'), repaired.lastIndexOf(']'));
        if (jsonEnd > 0) {
          repaired = repaired.substring(0, jsonEnd + 1);
        }
        
      // 7. Special handling for learning path JSON structure
      if (context === 'learning path') {
        repaired = this.repairLearningPathJson(repaired);
      }
      
      // 8. Final control character escape attempt
      repaired = this.escapeControlCharacters(repaired);
        
        console.log('JSON repair attempted. Original length:', jsonString.length, 'Repaired length:', repaired.length);
        
        return repaired;
      } catch (repairError) {
        console.error('JSON repair failed:', repairError);
        return jsonString; // Return original if repair fails
      }
    }
  }

  // Special repair for learning path JSON structure
  private repairLearningPathJson(jsonString: string): string {
    try {
      // Check if it's a learning path structure
      if (!jsonString.includes('"steps"') || !jsonString.includes('"objectives"')) {
        return jsonString;
      }
      
      let repaired = jsonString;
      console.log('Starting learning path JSON repair...');
      
      // Handle truncated responses by finding the last complete structure
      const lastCompleteBrace = repaired.lastIndexOf('}');
      const lastCompleteBracket = repaired.lastIndexOf(']');
      const lastComplete = Math.max(lastCompleteBrace, lastCompleteBracket);
      
      // Check for truncation patterns
      const isTruncated = lastComplete > 0 && lastComplete < repaired.length - 10;
      const endsWithIncompleteString = repaired.match(/"[^"]*$/);
      const endsWithIncompleteObject = repaired.match(/,\s*$/);
      
      if (isTruncated || endsWithIncompleteString || endsWithIncompleteObject) {
        console.log(`Truncated response detected at position ${lastComplete}, repairing...`);
        
        if (endsWithIncompleteString) {
          // Find the last complete string and close it
          const lastCompleteQuote = repaired.lastIndexOf('"');
          const beforeQuote = repaired.substring(0, lastCompleteQuote);
          const afterQuote = repaired.substring(lastCompleteQuote + 1);
          
          // Find the start of this string
          const stringStart = beforeQuote.lastIndexOf('"');
          if (stringStart > 0) {
            // Close the incomplete string and any incomplete structures
            repaired = beforeQuote + '"' + afterQuote.substring(0, afterQuote.lastIndexOf(',')) + '"}';
          }
        } else if (endsWithIncompleteObject) {
          // Remove trailing comma and close structures
          repaired = repaired.replace(/,\s*$/, '');
        }
        
        // Final truncation to last complete structure
        if (lastComplete > 0) {
          repaired = repaired.substring(0, lastComplete + 1);
        }
      }
      
      // Fix incomplete objectives arrays
      const objectivesPattern = /"objectives":\s*\[([^\]]*?)(?=\]|$)/g;
      repaired = repaired.replace(objectivesPattern, (match, content) => {
        // If the objectives array is incomplete, try to close it properly
        if (!content.trim().endsWith('}') && !content.trim().endsWith(']')) {
          // Find the last complete objective
          const lastCompleteObjective = content.lastIndexOf('}');
          if (lastCompleteObjective > 0) {
            console.log('Fixing incomplete objectives array');
            return `"objectives": [${content.substring(0, lastCompleteObjective + 1)}]`;
          }
        }
        return match;
      });
      
      // Fix incomplete resources arrays
      const resourcesPattern = /"resources":\s*\[([^\]]*?)(?=\]|$)/g;
      repaired = repaired.replace(resourcesPattern, (match, content) => {
        if (!content.trim().endsWith('}') && !content.trim().endsWith(']')) {
          const lastCompleteResource = content.lastIndexOf('}');
          if (lastCompleteResource > 0) {
            console.log('Fixing incomplete resources array');
            return `"resources": [${content.substring(0, lastCompleteResource + 1)}]`;
          }
        }
        return match;
      });
      
      // Fix incomplete steps array
      const stepsPattern = /"steps":\s*\[([^\]]*?)(?=\]|$)/g;
      repaired = repaired.replace(stepsPattern, (match, content) => {
        if (!content.trim().endsWith('}') && !content.trim().endsWith(']')) {
          const lastCompleteStep = content.lastIndexOf('}');
          if (lastCompleteStep > 0) {
            console.log('Fixing incomplete steps array');
            return `"steps": [${content.substring(0, lastCompleteStep + 1)}]`;
          }
        }
        return match;
      });
      
      // Fix control characters in string values
      repaired = this.escapeControlCharacters(repaired);
      
      // Aggressive truncation repair for mid-string truncation
      repaired = this.repairTruncatedJson(repaired);
      
      // Ensure the JSON ends properly
      if (!repaired.trim().endsWith('}')) {
        // Find the last complete step
        const lastCompleteStep = repaired.lastIndexOf('}');
        if (lastCompleteStep > 0) {
          console.log('Truncating to last complete structure');
          repaired = repaired.substring(0, lastCompleteStep + 1);
        }
      }
      
      // Add missing closing brackets/braces
      const openBraces = (repaired.match(/{/g) || []).length;
      const closeBraces = (repaired.match(/}/g) || []).length;
      const openBrackets = (repaired.match(/\[/g) || []).length;
      const closeBrackets = (repaired.match(/]/g) || []).length;
      
      for (let i = 0; i < openBraces - closeBraces; i++) {
        repaired += '}';
      }
      for (let i = 0; i < openBrackets - closeBrackets; i++) {
        repaired += ']';
      }
      
      console.log('Learning path JSON repair completed');
      return repaired;
    } catch (error) {
      console.error('Learning path JSON repair failed:', error);
      return jsonString;
    }
  }

  // Enhanced JSON parsing method with better error handling
  private parseJsonWithFallback(response: string, context: string): any {
    try {
      // First, try the existing method
      return this.parseJsonObjectResponse(response, context);
    } catch (error) {
      console.log(`Primary parsing failed for ${context}, trying alternative methods...`);
      
      // Try to extract and repair JSON from the response
      try {
        // Remove any leading/trailing whitespace and non-JSON content
        let cleanResponse = response.trim();
        
        // Find the first { and last } to extract the JSON object
        const firstBrace = cleanResponse.indexOf('{');
        const lastBrace = cleanResponse.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
          let jsonPart = cleanResponse.substring(firstBrace, lastBrace + 1);
          console.log(`Extracted JSON part for ${context}:`, jsonPart.substring(0, 200) + '...');
          console.log(`JSON part starts with: "${jsonPart.charAt(0)}" (char code: ${jsonPart.charCodeAt(0)})`);
          console.log(`JSON part length: ${jsonPart.length}`);
          
          // Try to repair common JSON issues
          jsonPart = this.repairJson(jsonPart, context);
          
          // Validate JSON before parsing
          if (!jsonPart || jsonPart.length === 0) {
            throw new Error('JSON part is empty after repair');
          }
          
          if (!jsonPart.startsWith('{') && !jsonPart.startsWith('[')) {
            console.error('Invalid JSON structure - does not start with { or [');
            console.error('First 100 characters:', jsonPart.substring(0, 100));
            throw new Error('Invalid JSON structure');
          }
          
          return JSON.parse(jsonPart);
        }
        
        throw new Error('No valid JSON object found in response');
      } catch (fallbackError) {
        console.error(`All parsing methods failed for ${context}:`, fallbackError);
        console.error('Raw response:', response);
        
        // Try to extract any valid content from the response
        try {
          console.log('Attempting to repair truncated JSON response...');
          
          // First, try to find the steps array in the response
          const stepsMatch = response.match(/"steps":\s*\[([\s\S]*?)(?:\]|$)/);
          if (stepsMatch) {
            console.log('Found steps array in response, attempting to repair...');
            
            // Try to repair the JSON by finding complete step objects
            let stepsContent = stepsMatch[1];
            
            // Look for complete step objects (handle nested objects)
            const stepMatches = [];
            let braceCount = 0;
            let currentStep = '';
            let inStep = false;
            
            for (let i = 0; i < stepsContent.length; i++) {
              const char = stepsContent[i];
              
              if (char === '{') {
                if (braceCount === 0) {
                  inStep = true;
                  currentStep = '';
                }
                braceCount++;
              }
              
              if (inStep) {
                currentStep += char;
              }
              
              if (char === '}') {
                braceCount--;
                if (braceCount === 0 && inStep) {
                  stepMatches.push(currentStep);
                  inStep = false;
                  currentStep = '';
                }
              }
            }
            if (stepMatches && stepMatches.length > 0) {
              console.log(`Found ${stepMatches.length} complete step objects`);
              
              // Create a valid JSON structure with the complete steps
              const repairedSteps = stepMatches.map((step, index) => {
                try {
                  // Try to parse each step to ensure it's valid
                  const parsedStep = JSON.parse(step);
                  return parsedStep;
                } catch (stepError) {
                  console.warn(`Step ${index + 1} is invalid, skipping:`, stepError);
                  return null;
                }
              }).filter(step => step !== null);
              
              if (repairedSteps.length > 0) {
                const repairedJson = {
                  steps: repairedSteps,
                  totalEstimatedTime: "30 min",
                  difficulty: "beginner"
                };
                
                console.log('Successfully repaired JSON with', repairedSteps.length, 'steps');
                return repairedJson;
              }
            }
          }
          
          // If that fails, try to extract just the first complete step
          const firstStepMatch = response.match(/"steps":\s*\[([\s\S]*?)(?:\]|$)/);
          if (firstStepMatch) {
            console.log('Attempting to extract first complete step...');
            const stepsContent = firstStepMatch[1];
            
            // Find the first complete step object
            let braceCount = 0;
            let currentStep = '';
            let inStep = false;
            
            for (let i = 0; i < stepsContent.length; i++) {
              const char = stepsContent[i];
              
              if (char === '{') {
                if (braceCount === 0) {
                  inStep = true;
                  currentStep = '';
                }
                braceCount++;
              }
              
              if (inStep) {
                currentStep += char;
              }
              
              if (char === '}') {
                braceCount--;
                if (braceCount === 0 && inStep) {
                  // Found a complete step
                  try {
                    const firstStep = JSON.parse(currentStep);
                    const minimalJson = {
                      steps: [firstStep],
                      totalEstimatedTime: "30 min",
                      difficulty: "beginner"
                    };
                    console.log('Successfully created minimal structure with 1 step');
                    return minimalJson;
                  } catch (stepError) {
                    console.warn('First step is invalid, continuing search...', stepError);
                    inStep = false;
                    currentStep = '';
                  }
                }
              }
            }
          }
          
        } catch (extractError) {
          console.log('Could not extract partial content, using fallback');
        }
        
        // Return a fallback structure
        return {
          steps: [{
            title: 'Learning Path Generation Failed',
            description: 'There was an error generating the learning path. Please try again.',
            objectives: ['Please retry the generation process'],
            resources: [{
              type: 'text',
              title: 'Error Recovery',
              content: 'The AI generation encountered an issue. Please try uploading your notes again.',
              description: 'Error recovery resource',
              estimatedTime: '5 min'
            }]
          }]
        };
      }
    }
  }

  // Test method to verify API connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing connection with available models:', AVAILABLE_MODELS.map(m => m.name));
      
      const testMessage: GroqMessage[] = [
        {
          role: 'user',
          content: 'Respond with only this exact JSON: {"status": "ok", "test": true}'
        }
      ];
      
      const response = await this.makeRequest(testMessage, 100);
      console.log('Test response:', response);
      
      try {
        const parsed = JSON.parse(response);
        const isOk = parsed.status === 'ok' && parsed.test === true;
        console.log(`API connection test result: ${isOk}`);
        return isOk;
      } catch (parseError) {
        console.log('Test response was not valid JSON:', parseError);
        console.log('Raw response:', response);
        return false; // API should return valid JSON for test
      }
    } catch (error) {
      console.error('Test connection failed:', error);
      return false;
    }
  }

  async makeRequest(messages: GroqMessage[], requestedTokens: number = 2000): Promise<string> {
    // Key lives on the server (/api/groq). The browser only talks to our proxy.
    const errors: string[] = [];
    const attemptedModels: string[] = [];

    // Try each available model in priority order
    for (const model of AVAILABLE_MODELS) {
      if (model.maxTokens < requestedTokens) {
        console.log(`Skipping ${model.name} - insufficient token capacity (${model.maxTokens} < ${requestedTokens})`);
        continue;
      }

      // Check if model is currently blocked
      const tracker = rateLimitTracker.get(model.name);
      if (tracker?.isBlocked && tracker.blockUntil && Date.now() < tracker.blockUntil) {
        console.log(`Skipping ${model.name} - currently blocked until ${new Date(tracker.blockUntil).toISOString()}`);
        continue;
      }

      try {
        console.log(`🔍 Attempting request with model: ${model.name}`);
        console.log(`📝 Request messages:`, messages);
        attemptedModels.push(model.name);

        const response = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model.name,
            messages: messages,
            temperature: 0.7,
            max_tokens: Math.min(requestedTokens, model.maxTokens),
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Groq API Error Response for ${model.name}:`, errorText);
          
          // Check if it's a rate limit error
          if (response.status === 429) {
            const retryDelay = this.extractRetryDelay(errorText);
            const blockUntil = Date.now() + retryDelay;
            this.updateRateLimit(model.name, 0, true, blockUntil);
            
            console.warn(`Rate limit hit for ${model.name}, blocking until ${new Date(blockUntil).toISOString()}`);
            errors.push(`Rate limit for ${model.name}: ${errorText}`);
            continue; // Try next model
          }
          
          // For other errors, don't retry with this model
          errors.push(`${model.name}: ${response.status} ${response.statusText} - ${errorText}`);
          continue;
        }

        const data: GroqResponse = await response.json();
        const content = data.choices[0]?.message?.content || 'No response generated';
        
        // Validate that the response contains JSON
        if (!content || content.trim().length === 0) {
          console.warn(`Empty response from ${model.name}, trying next model`);
          errors.push(`${model.name}: Empty response`);
          continue;
        }
        
        // Log the actual response for debugging
        console.log(`✅ Successfully got response from ${model.name}:`, content.substring(0, 200) + '...');
        
        // For the new SimpleRevisionPlanService, we don't need strict JSON validation
        // since it processes text content directly. Just return the content.
        if (content && content.trim().length > 0) {
          console.log(`✅ Using response from ${model.name}`);
          return content;
        } else {
          console.warn(`Empty response from ${model.name}, trying next model`);
          errors.push(`${model.name}: Empty response`);
          continue;
        }
        
        // Update rate limit tracking for successful request
        this.updateRateLimit(model.name, content.length, false);
        
        return content;

      } catch (error) {
        const errorMessage = `Error with ${model.name}: ${error instanceof Error ? error.message : String(error)}`;
        console.error(errorMessage);
        errors.push(errorMessage);
        continue; // Try next model
      }
    }

    // If we get here, all models failed
    const errorSummary = `All models failed. Attempted: ${attemptedModels.join(', ')}. Errors: ${errors.join('; ')}`;
    console.error('❌ All model fallbacks exhausted:', errorSummary);
    throw new Error(errorSummary);
  }

  async analyzeNotes(notes: string): Promise<{
    topic: string;
    subject: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    keyConcepts: string[];
    summary: string;
  }> {
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: `You are an educational AI that analyzes student notes to extract key information. 
        
        IMPORTANT: Respond with ONLY a valid JSON object. No markdown formatting, no explanations, just pure JSON.
        
        The JSON object must contain:
        - topic: The main topic/subject of the notes
        - subject: The academic subject (Mathematics, Physics, Chemistry, etc.)
        - difficulty: The complexity level (beginner, intermediate, advanced)
        - keyConcepts: Array of 3-5 key concepts from the notes
        - summary: A brief 2-3 sentence summary of what the notes cover (use \\n for line breaks)
        
        Be concise and accurate. Ensure all JSON is properly formatted with escaped characters.`
      },
      {
        role: 'user',
        content: `Analyze these student notes:\n\n${notes}`
      }
    ];

    const response = await this.makeRequest(messages);
    
    try {
      return this.parseJsonWithFallback(response, 'analysis');
    } catch (error) {
      // Fallback response
      return {
        topic: 'Study Topic',
        subject: 'General',
        difficulty: 'intermediate',
        keyConcepts: ['Concept 1', 'Concept 2', 'Concept 3'],
        summary: 'These notes cover important concepts that need to be studied.'
      };
    }
  }

  async generateLearningPath(notes: string, topic: string): Promise<{
    steps: Array<{
      title: string;
      description: string;
      objectives: Array<{
        title: string;
        preview: string;
      }>;
      resources: Array<{
        type: 'text' | 'video' | 'pdf' | 'interactive';
        title: string;
        content?: string;
        url?: string;
        duration?: string;
        description: string;
        estimatedTime: string;
      }>;
    }>;
  }> {
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: `You are an educational AI that creates guided learning pathways with real educational resources.
        Based on the student's notes, create a 2-step learning pathway to deepen understanding of the topic.
        
        IMPORTANT: Respond with ONLY a valid JSON object. No markdown formatting, no explanations, just pure JSON.
        Keep responses concise to avoid truncation.
        
        The JSON object must contain:
        - steps: Array of 2 learning steps, each with:
          - title: Step title (e.g., "Foundation: Understanding Core Concepts")
          - description: What the student will learn in this step (use \\n for line breaks)
          - objectives: Array of 2 learning objectives, each with:
            - title: Clear objective statement
            - preview: Brief preview content explaining the concept (1-2 paragraphs)
          - resources: Array of 2 learning resources, each with:
            - type: "text", "video", "pdf", or "interactive"
            - title: Resource title
            - content: Concise text content (only for text type, use \\n for line breaks)
            - url: For videos, provide real YouTube URLs from educational channels
            - description: What the resource covers
            - estimatedTime: Time estimate (e.g., "15-20 min")
            - duration: For videos, provide duration in "MM:SS" format
        
        RESOURCE GUIDELINES:
        - For videos: Use real YouTube URLs from educational channels
        - For PDFs: Use real educational PDF URLs from OpenStax, MIT OpenCourseWare
        - For text: Generate concise educational content with key concepts
        - Make URLs realistic and educational
        
        IMPORTANT FOR TEXT RESOURCES:
        - ALWAYS include the "content" field with educational text
        - Content should be concise but educational
        - Use \\n for line breaks
        - Include key examples and definitions
        
        Make the pathway progressive: Foundation → Application
        Generate concise text content for text resources.
        Ensure all JSON is properly formatted with escaped characters.`
      },
      {
        role: 'user',
        content: `Create a learning pathway for this topic based on these notes:\n\nTopic: ${topic}\n\nNotes:\n${notes}`
      }
    ];

    const response = await this.makeRequest(messages);
    console.log('Raw AI response for learning path:', response);
    console.log('Response length:', response.length);
    console.log('Response type:', typeof response);
    console.log('First 100 characters:', response.substring(0, 100));
    console.log('Last 100 characters:', response.substring(Math.max(0, response.length - 100)));
    
    try {
      const parsedResponse = this.parseJsonWithFallback(response, 'learning path');
      console.log('Parsed learning path response:', parsedResponse);
      return parsedResponse;
    } catch (error) {
      console.error('Failed to parse learning path response:', error);
      // Fallback response
      return {
        steps: [
          {
            title: 'Foundation: Understanding Core Concepts',
            description: `Build a solid foundation by understanding the fundamental concepts of ${topic}`,
            objectives: [
              { title: `Define key terms in ${topic}`, preview: `Learn the fundamental definitions and terminology related to ${topic}.` },
              { title: `Understand basic principles`, preview: `Grasp the core principles and foundations of ${topic}.` }
            ],
            resources: [
              {
                type: 'text',
                title: `${topic} Fundamentals`,
                content: `# ${topic} Fundamentals\n\nThis guide covers the essential concepts you need to understand ${topic}.`,
                description: 'Comprehensive guide to fundamental concepts',
                estimatedTime: '20-25 min'
              }
            ]
          }
        ]
      };
    }
  }

  async generateFlashcards(notes: string, topic: string): Promise<Array<{
    front: string;
    back: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  }>> {
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: `You are an educational AI that creates effective flashcards for learning.
        Based on the student's notes, create 5-8 flashcards to help them memorize key concepts.
        
        IMPORTANT: Respond with ONLY a valid JSON array. No markdown formatting, no explanations, just pure JSON.
        
        The JSON array must contain flashcards, each with:
        - front: The question or prompt (concise, clear)
        - back: The answer or explanation (detailed but concise, use \\n for line breaks)
        - difficulty: "beginner", "intermediate", or "advanced"
        
        Focus on key definitions, formulas, concepts, and important facts.
        Make flashcards that promote active recall and understanding.
        Ensure all JSON is properly formatted with escaped characters.`
      },
      {
        role: 'user',
        content: `Create flashcards for this topic based on these notes:\n\nTopic: ${topic}\n\nNotes:\n${notes}`
      }
    ];

    const response = await this.makeRequest(messages);
    
    try {
      return this.parseJsonResponse(response, 'flashcards');
    } catch (error) {
      // Fallback response
      return [
        {
          front: `What is the main concept of ${topic}?`,
          back: `The main concept of ${topic} involves understanding the fundamental principles and applications.`,
          difficulty: 'beginner'
        }
      ];
    }
  }

  async generateQuizQuestions(notes: string, topic: string): Promise<Array<{
    question: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer';
    options?: string[];
    correctAnswer: number | boolean | string;
    explanation: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    points?: number;
  }>> {
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: `You are an educational AI that creates quiz questions for assessment.
        Based on the student's notes, create 5-8 multiple choice questions to test understanding.
        
        IMPORTANT: Respond with ONLY a valid JSON array. No markdown formatting, no explanations, just pure JSON.
        
        The JSON array must contain questions, each with:
        - question: The question text (clear and specific)
        - type: "multiple-choice", "true-false", or "short-answer"
        - options: Array of 4 answer choices (for multiple-choice only)
        - correctAnswer: Index of correct answer (0-3) for multiple-choice, true/false for true-false, string for short-answer
        - explanation: Why the correct answer is right (educational, use \\n for line breaks)
        - difficulty: "beginner", "intermediate", or "advanced"
        - points: Point value (default 1)
        
        Create questions that test comprehension, application, and analysis.
        Make explanations helpful for learning.
        Ensure all JSON is properly formatted with escaped characters.`
      },
      {
        role: 'user',
        content: `Create quiz questions for this topic based on these notes:\n\nTopic: ${topic}\n\nNotes:\n${notes}`
      }
    ];

    const response = await this.makeRequest(messages);
    
    try {
      return this.parseJsonResponse(response, 'quiz');
    } catch (error) {
      // Fallback response
      return [
        {
          question: `Which of the following best describes ${topic}?`,
          type: 'multiple-choice',
          options: [
            'A basic concept',
            'An advanced theory',
            'A practical application',
            'A complex system'
          ],
          correctAnswer: 0,
          explanation: `${topic} is best described as a basic concept that forms the foundation for understanding more complex topics. This fundamental understanding helps students build upon their knowledge progressively.`,
          difficulty: 'beginner',
          points: 1
        },
        {
          question: `True or False: ${topic} is essential for understanding advanced concepts in this subject.`,
          type: 'true-false',
          correctAnswer: true,
          explanation: `This statement is true. ${topic} provides the foundational knowledge necessary for understanding more advanced concepts. Without this basic understanding, students would struggle with complex topics.`,
          difficulty: 'beginner',
          points: 1
        }
      ];
    }
  }

  async generateContestProblems(notes: string, topic: string): Promise<Array<{
    problem: string;
    solution: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    timeLimit: string;
    points: number;
  }>> {
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: `You are an educational AI that creates challenging contest problems.
        Based on the student's notes, create 3-5 contest problems that test advanced understanding.
        
        IMPORTANT: Respond with ONLY a valid JSON array. No markdown formatting, no explanations, just pure JSON.
        
        The JSON array must contain problems, each with:
        - problem: The problem statement (challenging but solvable, use \\n for line breaks)
        - solution: The complete solution with steps (use \\n for line breaks)
        - difficulty: "beginner", "intermediate", or "advanced"
        - timeLimit: Suggested time limit (e.g., "15 min", "30 min")
        - points: Point value (10, 20, 30, etc.)
        
        Create problems that require critical thinking and problem-solving skills.
        Make solutions educational with clear explanations.
        Ensure all JSON is properly formatted with escaped characters.`
      },
      {
        role: 'user',
        content: `Create contest problems for this topic based on these notes:\n\nTopic: ${topic}\n\nNotes:\n${notes}`
      }
    ];

    const response = await this.makeRequest(messages);
    
    try {
      return this.parseJsonResponse(response, 'contest');
    } catch (error) {
      // Fallback response
      return [
        {
          problem: `Solve this ${topic} problem: [Problem statement based on the notes]`,
          solution: `Solution: [Step-by-step solution with explanation]`,
          difficulty: 'intermediate',
          timeLimit: '20 min',
          points: 20
        }
      ];
    }
  }
}

export const groqApiService = new GroqApiService();
