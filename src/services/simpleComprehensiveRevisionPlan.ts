import { groqApiService } from './groqApiService';

export interface SimpleComprehensiveRevisionPlan {
  id: string;
  title: string;
  topic: string;
  subject: string;
  overview: {
    summary: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    totalEstimatedTime: string;
    prerequisites: string[];
  };
  focusAreas: Array<{
    title: string;
    description: string;
    importance: 'critical' | 'important' | 'optional';
    keyConcepts: string[];
    commonMistakes: string[];
    studyTips: string[];
    estimatedTime: string;
  }>;
  studyMethods: Array<{
    name: string;
    description: string;
    effectiveness: string;
    estimatedTime: string;
  }>;
  revisionPhases: Array<{
    name: string;
    description: string;
    duration: string;
    pedagogicalApproach: string;
    objectives: Array<{
      title: string;
      description: string;
    }>;
    activities: {
      main: string[];
      alternative: string[];
    };
    resources: {
      primary: string[];
      secondary: string[];
    };
  }>;
  assessmentPlan: {
    formative: string[];
    summative: string[];
    selfAssessment: string[];
  };
  progressTracking: {
    milestones: string[];
    checkpoints: string[];
    successMetrics: string[];
  };
  createdAt: Date;
}

export class SimpleComprehensiveRevisionPlanService {
  
  private hasAllSections(obj: any): boolean {
    const hasOverview = obj && obj.overview;
    const hasFocusAreas = Array.isArray(obj.focusAreas) && obj.focusAreas.length > 0;
    const hasStudyMethods = Array.isArray(obj.studyMethods) && obj.studyMethods.length > 0;
    const hasRevisionPhases = Array.isArray(obj.revisionPhases) && obj.revisionPhases.length > 0;
    const hasAssessmentPlan = obj.assessmentPlan;
    const hasProgressTracking = obj.progressTracking;
    
    console.log('Section validation:', {
      hasOverview,
      hasFocusAreas,
      hasStudyMethods,
      hasRevisionPhases,
      hasAssessmentPlan,
      hasProgressTracking,
      total: hasOverview && hasFocusAreas && hasStudyMethods && hasRevisionPhases && hasAssessmentPlan && hasProgressTracking
    });
    
    return hasOverview && hasFocusAreas && hasStudyMethods && hasRevisionPhases && hasAssessmentPlan && hasProgressTracking;
  }

  private hasMinimumSections(obj: any): boolean {
    const hasOverview = obj && obj.overview;
    const hasFocusAreas = Array.isArray(obj.focusAreas) && obj.focusAreas.length > 0;
    const hasStudyMethods = Array.isArray(obj.studyMethods) && obj.studyMethods.length > 0;
    const hasRevisionPhases = Array.isArray(obj.revisionPhases) && obj.revisionPhases.length > 0;
    
    // At minimum, we need overview and at least one of the main content sections
    const hasMinimum = hasOverview && (hasFocusAreas || hasStudyMethods || hasRevisionPhases);
    
    console.log('Minimum section validation:', {
      hasOverview,
      hasFocusAreas,
      hasStudyMethods,
      hasRevisionPhases,
      hasMinimum
    });
    
    return hasMinimum;
  }

  private extractFirstJsonObject(input: string): string | null {
    // Try multiple patterns to extract JSON
    const patterns = [
      /\{[\s\S]*\}/,  // Standard JSON object
      /\{[\s\S]*\}(?=\s*$)/,  // JSON object at end of string
      /\{[\s\S]*\}(?=\s*[^}])/,  // JSON object followed by non-brace
    ];
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        console.log('Extracted JSON using pattern:', pattern.toString());
        return match[0];
      }
    }
    
    console.log('No JSON object found with any pattern');
    return null;
  }

  async generateComprehensiveRevisionPlan(notes: string, topic: string): Promise<SimpleComprehensiveRevisionPlan> {
    console.log('🔍 Generating simple comprehensive revision plan for:', topic);
    console.log('📝 Notes:', notes);
    
    try {
      const messages = [
        {
          role: 'system' as const,
          content: `You are an expert educational consultant. Create comprehensive revision plans for student self-study.

CRITICAL: Respond with ONLY valid JSON. No markdown, no explanations, no backticks. Ensure all JSON is properly closed.

Generate a complete revision plan with ALL sections populated. Each section must have meaningful content, not empty arrays.`
        },
        {
          role: 'user' as const,
          content: `Create a comprehensive revision plan for: "${topic}"

Context: ${notes}

Generate ALL sections with meaningful content:
- overview: summary, difficulty, totalEstimatedTime, prerequisites
- focusAreas: 3-4 areas with title, description, importance, keyConcepts, commonMistakes, studyTips, estimatedTime
- studyMethods: 3-4 methods with name, description, effectiveness, estimatedTime
- revisionPhases: 4-5 phases with name, description, duration, pedagogicalApproach, objectives, activities, resources
- assessmentPlan: formative, summative, selfAssessment arrays
- progressTracking: milestones, checkpoints, successMetrics arrays

Each section must have content, not empty arrays.`
        }
      ];

      const response = await groqApiService.makeRequest(messages);
      console.log('Raw AI response for simple comprehensive revision plan:', response);
      
      // Clean and parse the response
      const cleanedResponse = this.cleanJsonResponse(response);
      console.log('Cleaned response:', cleanedResponse);
      
      // Try multiple parsing strategies
      let planData;
      try {
        planData = JSON.parse(cleanedResponse);
        console.log('✅ Successfully parsed JSON on first attempt:', planData);
      } catch (firstError) {
        console.log('🔄 First parse attempt failed, trying advanced repair...');
        const advancedRepaired = this.advancedJsonRepair(cleanedResponse);
        console.log('Advanced repaired response:', advancedRepaired);
        
        try {
          planData = JSON.parse(advancedRepaired);
          console.log('✅ Successfully parsed JSON on second attempt:', planData);
        } catch (secondError) {
          console.log('🔄 Second parse attempt failed, trying tolerant extraction...');
          console.log('Second error details:', secondError.message);
          console.log('Advanced repaired response length:', advancedRepaired.length);
          console.log('Advanced repaired response preview:', advancedRepaired.substring(0, 200) + '...');
          
          // Try to extract and parse a valid JSON object
          const extracted = this.extractFirstJsonObject(advancedRepaired);
          console.log('Extracted JSON length:', extracted ? extracted.length : 'null');
          if (extracted) {
            try {
              const parsed = JSON.parse(extracted);
              console.log('Extracted JSON parsed successfully, checking sections...');
              console.log('Has overview:', !!parsed.overview);
              console.log('Has focusAreas:', !!parsed.focusAreas, 'Length:', parsed.focusAreas?.length);
              console.log('Has studyMethods:', !!parsed.studyMethods, 'Length:', parsed.studyMethods?.length);
              console.log('Has revisionPhases:', !!parsed.revisionPhases, 'Length:', parsed.revisionPhases?.length);
              console.log('Has assessmentPlan:', !!parsed.assessmentPlan);
              console.log('Has progressTracking:', !!parsed.progressTracking);
              
              if (this.hasAllSections(parsed)) {
                planData = parsed;
                console.log('✅ Successfully extracted and parsed valid JSON with all sections:', planData);
              } else if (this.hasMinimumSections(parsed)) {
                planData = parsed;
                console.log('✅ Successfully extracted and parsed valid JSON with minimum sections:', planData);
              } else {
                console.log('❌ Extracted JSON missing required sections');
              }
            } catch (extractError) {
              console.log('🔄 Extraction failed:', extractError.message);
              console.log('Extracted content preview:', extracted.substring(0, 200) + '...');
            }
          } else {
            console.log('❌ No JSON object found in advanced repaired response');
          }
          
          // If extraction didn't work, try aggressive repair
          if (!planData) {
            const aggressiveRepaired = this.aggressiveJsonRepair(advancedRepaired);
            console.log('Aggressive repaired response:', aggressiveRepaired);
            
            try {
              planData = JSON.parse(aggressiveRepaired);
              console.log('✅ Successfully parsed JSON on third attempt:', planData);
            } catch (thirdError) {
              console.log('🔄 Third parse attempt failed:', thirdError.message);
              console.log('Aggressive repaired response length:', aggressiveRepaired.length);
              console.log('Aggressive repaired response preview:', aggressiveRepaired.substring(0, 200) + '...');
              
              // Try extraction on aggressive repaired version
              const extracted2 = this.extractFirstJsonObject(aggressiveRepaired);
              console.log('Extracted2 JSON length:', extracted2 ? extracted2.length : 'null');
              if (extracted2) {
                try {
                  const parsed2 = JSON.parse(extracted2);
                  console.log('Extracted2 JSON parsed successfully, checking sections...');
                  console.log('Has overview:', !!parsed2.overview);
                  console.log('Has focusAreas:', !!parsed2.focusAreas, 'Length:', parsed2.focusAreas?.length);
                  console.log('Has studyMethods:', !!parsed2.studyMethods, 'Length:', parsed2.studyMethods?.length);
                  console.log('Has revisionPhases:', !!parsed2.revisionPhases, 'Length:', parsed2.revisionPhases?.length);
                  console.log('Has assessmentPlan:', !!parsed2.assessmentPlan);
                  console.log('Has progressTracking:', !!parsed2.progressTracking);
                  
                  if (this.hasAllSections(parsed2)) {
                    planData = parsed2;
                    console.log('✅ Successfully extracted from aggressive repair with all sections:', planData);
                  } else if (this.hasMinimumSections(parsed2)) {
                    planData = parsed2;
                    console.log('✅ Successfully extracted from aggressive repair with minimum sections:', planData);
                  } else {
                    console.log('❌ Extracted2 JSON missing required sections');
                  }
                } catch (extract2Error) {
                  console.log('🔄 Extraction2 failed:', extract2Error.message);
                  console.log('Extracted2 content preview:', extracted2.substring(0, 200) + '...');
                  console.log('🔄 All JSON parsing attempts failed, falling back to manual reconstruction...');
                }
              } else {
                console.log('❌ No JSON object found in aggressive repaired response');
                console.log('🔄 All JSON parsing attempts failed, falling back to manual reconstruction...');
              }
              
              // Only use manual reconstruction as last resort
              if (!planData) {
                planData = this.manualJsonReconstruction(cleanedResponse, topic, notes);
                console.log('✅ Manual reconstruction completed:', planData);
              }
            }
          }
        }
      }
      
      // Ensure all sections have content
      const completePlan = this.ensureCompletePlan(planData, topic, notes);
      
      // Log whether we're using AI-generated content or fallback
      if (this.hasAllSections(planData)) {
        console.log('🎯 Using AI-generated comprehensive plan with all sections');
      } else if (this.hasMinimumSections(planData)) {
        console.log('🎯 Using AI-generated comprehensive plan with minimum sections');
      } else {
        console.log('⚠️ Using enhanced fallback plan (some sections may be generated)');
      }
      
      return {
        id: `comprehensive-plan-${Date.now()}`,
        title: `${topic} - Comprehensive Revision Plan`,
        topic,
        subject: this.extractSubjectFromNotes(notes),
        overview: completePlan.overview,
        focusAreas: completePlan.focusAreas,
        studyMethods: completePlan.studyMethods,
        revisionPhases: completePlan.revisionPhases,
        assessmentPlan: completePlan.assessmentPlan,
        progressTracking: completePlan.progressTracking,
        createdAt: new Date()
      };
      
    } catch (error) {
      console.error('Error generating simple comprehensive revision plan:', error);
      return this.createFallbackPlan(topic, notes);
    }
  }

  private cleanJsonResponse(response: string): string {
    console.log('🧹 Cleaning JSON response...');
    
    // Remove markdown code blocks if present
    let cleaned = response.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
    
    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim();
    
    // Try to extract JSON object if wrapped in other text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }
    
    // Fix common JSON syntax errors
    cleaned = this.repairJsonSyntax(cleaned);
    
    console.log('✅ JSON cleaned successfully');
    return cleaned;
  }

  private repairJsonSyntax(json: string): string {
    console.log('🔧 Repairing JSON syntax...');
    
    let repaired = json;
    
    // Fix missing opening braces in arrays (like the checkpoints issue)
    // Pattern: "key": [ "name": "value" } -> "key": [ { "name": "value" }
    repaired = repaired.replace(/"(\w+)":\s*\[\s*"(\w+)":/g, '"$1": [ { "$2":');
    
    // Fix missing opening braces for objects in arrays
    // Pattern: [ "key": "value" } -> [ { "key": "value" }
    repaired = repaired.replace(/\[\s*"(\w+)":/g, '[ { "$1":');
    
    // Fix missing commas between array elements
    // Pattern: } "key": -> }, "key":
    repaired = repaired.replace(/\}\s*"(\w+)":/g, '}, "$1":');
    
    // Fix missing commas between object properties
    // Pattern: "value" "key": -> "value", "key":
    repaired = repaired.replace(/"([^"]*)"\s*"(\w+)":/g, '"$1", "$2":');
    
    // Fix trailing commas before closing brackets/braces
    repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
    
    // Fix missing closing braces for objects in arrays
    // Pattern: "value" ] -> "value" } ]
    repaired = repaired.replace(/"([^"]*)"\s*\]/g, (match, content) => {
      // Only add closing brace if it's not already there
      if (!content.includes('}')) {
        return `"${content}" } ]`;
      }
      return match;
    });
    
    // Fix malformed checkpoint objects specifically
    repaired = this.fixCheckpointObjects(repaired);
    
    console.log('✅ JSON syntax repaired');
    return repaired;
  }

  private fixCheckpointObjects(json: string): string {
    console.log('🔧 Fixing checkpoint objects...');
    
    // Fix the specific checkpoint pattern we saw in the error
    // Pattern: "checkpoints": [ "name": "Checkpoint 1" } -> "checkpoints": [ { "name": "Checkpoint 1" }
    let fixed = json.replace(/"checkpoints":\s*\[\s*"name":/g, '"checkpoints": [ { "name":');
    
    // Fix similar patterns for other arrays that might have the same issue
    const arrayPatterns = ['milestones', 'formative', 'summative', 'selfAssessment', 'keyConcepts', 'studyTips'];
    
    arrayPatterns.forEach(pattern => {
      // Fix: "pattern": [ "key": -> "pattern": [ { "key":
      fixed = fixed.replace(new RegExp(`"${pattern}":\\s*\\[\\s*"\\w+":`, 'g'), `"${pattern}": [ { "$&`);
    });
    
    console.log('✅ Checkpoint objects fixed');
    return fixed;
  }

  private advancedJsonRepair(json: string): string {
    console.log('🔧 Advanced JSON repair...');
    
    let repaired = json;
    
    // Fix the specific checkpoint pattern from the error
    // "checkpoints": [ "name": "Checkpoint 1" } -> "checkpoints": [ { "name": "Checkpoint 1" }
    repaired = repaired.replace(/"checkpoints":\s*\[\s*"name":\s*"([^"]+)"\s*}/g, '"checkpoints": [ { "name": "$1" }');
    
    // Fix similar patterns for other object arrays
    const objectArrayPatterns = [
      { key: 'milestones', prop: 'name' },
      { key: 'formative', prop: 'method' },
      { key: 'summative', prop: 'method' },
      { key: 'selfAssessment', prop: 'method' },
      { key: 'successMetrics', prop: 'name' }
    ];
    
    objectArrayPatterns.forEach(({ key, prop }) => {
      const pattern = new RegExp(`"${key}":\\s*\\[\\s*"${prop}":\\s*"([^"]+)"\\s*\\}`, 'g');
      repaired = repaired.replace(pattern, `"${key}": [ { "${prop}": "$1" }`);
    });
    
    // Fix missing commas between array elements
    repaired = repaired.replace(/\}\s*"(\w+)":\s*"([^"]+)"/g, '}, "$1": "$2"');
    
    // Fix missing opening braces for objects in arrays
    repaired = repaired.replace(/\[\s*"(\w+)":\s*"([^"]+)"/g, '[ { "$1": "$2"');
    
    // Fix more complex patterns - objects with multiple properties missing braces
    // Pattern: "key": [ "prop1": "value1" "prop2": "value2" } -> "key": [ { "prop1": "value1", "prop2": "value2" }
    repaired = this.fixComplexObjectArrays(repaired);
    
    // Fix missing commas between properties in objects
    repaired = repaired.replace(/"([^"]*)"\s*"(\w+)":/g, '"$1", "$2":');
    
    // Fix trailing commas before closing brackets/braces
    repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
    
    // Ensure proper object structure
    repaired = this.ensureProperObjectStructure(repaired);
    
    console.log('✅ Advanced JSON repair completed');
    return repaired;
  }

  private fixComplexObjectArrays(json: string): string {
    console.log('🔧 Fixing complex object arrays...');
    
    let fixed = json;
    
    // Fix arrays of objects that are missing opening braces
    // Pattern: "key": [ "prop1": "value1" "prop2": "value2" } -> "key": [ { "prop1": "value1", "prop2": "value2" }
    const arrayKeys = ['checkpoints', 'milestones', 'formative', 'summative', 'selfAssessment', 'successMetrics', 'keyConcepts', 'studyTips'];
    
    arrayKeys.forEach(key => {
      // Find arrays that start with a property instead of an object
      const pattern = new RegExp(`"${key}":\\s*\\[\\s*"([^"]+)":\\s*"([^"]+)"`, 'g');
      fixed = fixed.replace(pattern, `"${key}": [ { "$1": "$2"`);
      
      // Fix missing commas between properties in the same object
      const commaPattern = new RegExp(`"${key}":\\s*\\[\\s*\\{[^}]*"([^"]+)":\\s*"([^"]+)"\\s*"([^"]+)":\\s*"([^"]+)"`, 'g');
      fixed = fixed.replace(commaPattern, (match, prop1, val1, prop2, val2) => {
        return match.replace(`"${prop1}": "${val1}" "${prop2}": "${val2}"`, `"${prop1}": "${val1}", "${prop2}": "${val2}"`);
      });
    });
    
    console.log('✅ Complex object arrays fixed');
    return fixed;
  }

  private ensureProperObjectStructure(json: string): string {
    console.log('🔧 Ensuring proper object structure...');
    
    let structured = json;
    
    // Ensure all arrays of objects have proper structure
    const objectArrayPattern = /"(\w+)":\s*\[\s*"(\w+)":\s*"([^"]+)"\s*"(\w+)":\s*"([^"]+)"\s*"(\w+)":\s*"([^"]+)"\s*\]/g;
    structured = structured.replace(objectArrayPattern, (match, key, prop1, val1, prop2, val2, prop3, val3) => {
      return `"${key}": [ { "${prop1}": "${val1}", "${prop2}": "${val2}", "${prop3}": "${val3}" } ]`;
    });
    
    // Fix arrays that have multiple objects but are missing proper structure
    const multiObjectPattern = /"(\w+)":\s*\[\s*"(\w+)":\s*"([^"]+)"\s*\}\s*"(\w+)":\s*"([^"]+)"\s*\}\s*"(\w+)":\s*"([^"]+)"\s*\}\s*\]/g;
    structured = structured.replace(multiObjectPattern, (match, key, prop1, val1, prop2, val2, prop3, val3) => {
      return `"${key}": [ { "${prop1}": "${val1}" }, { "${prop2}": "${val2}" }, { "${prop3}": "${val3}" } ]`;
    });
    
    console.log('✅ Object structure ensured');
    return structured;
  }

  private aggressiveJsonRepair(json: string): string {
    console.log('🔧 Aggressive JSON repair...');
    
    let repaired = json;
    
    // Try to fix the most common malformed patterns
    // Pattern: "key": [ "prop1": "val1" "prop2": "val2" "prop3": "val3" ] -> "key": [ { "prop1": "val1", "prop2": "val2", "prop3": "val3" } ]
    const aggressivePatterns = [
      // Fix successMetrics pattern specifically
      /"successMetrics":\s*\[\s*"name":\s*"([^"]+)"\s*"description":\s*"([^"]+)"\s*"target":\s*"([^"]+)"\s*\]/g,
      // Fix general object arrays
      /"(\w+)":\s*\[\s*"(\w+)":\s*"([^"]+)"\s*"(\w+)":\s*"([^"]+)"\s*"(\w+)":\s*"([^"]+)"\s*\]/g
    ];
    
    // Fix successMetrics specifically
    repaired = repaired.replace(/"successMetrics":\s*\[\s*"name":\s*"([^"]+)"\s*"description":\s*"([^"]+)"\s*"target":\s*"([^"]+)"\s*\]/g, 
      '"successMetrics": [ { "name": "$1", "description": "$2", "target": "$3" } ]');
    
    // Fix general patterns
    repaired = repaired.replace(/"(\w+)":\s*\[\s*"(\w+)":\s*"([^"]+)"\s*"(\w+)":\s*"([^"]+)"\s*"(\w+)":\s*"([^"]+)"\s*\]/g, 
      '"$1": [ { "$2": "$3", "$4": "$5", "$6": "$7" } ]');
    
    // Fix multiple objects in arrays
    // Pattern: "key": [ "prop1": "val1" } "prop2": "val2" } "prop3": "val3" } ] -> "key": [ { "prop1": "val1" }, { "prop2": "val2" }, { "prop3": "val3" } ]
    repaired = repaired.replace(/"(\w+)":\s*\[\s*"(\w+)":\s*"([^"]+)"\s*\}\s*"(\w+)":\s*"([^"]+)"\s*\}\s*"(\w+)":\s*"([^"]+)"\s*\}\s*\]/g, 
      '"$1": [ { "$2": "$3" }, { "$4": "$5" }, { "$6": "$7" } ]');
    
    // Fix missing commas between properties
    repaired = repaired.replace(/"([^"]+)"\s*"(\w+)":/g, '"$1", "$2":');
    
    // Fix missing commas between array elements
    repaired = repaired.replace(/\}\s*"(\w+)":/g, '}, "$1":');
    
    // Remove trailing commas
    repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
    
    console.log('✅ Aggressive JSON repair completed');
    return repaired;
  }

  private manualJsonReconstruction(json: string, topic: string, notes: string): any {
    console.log('🔧 Manual JSON reconstruction...');
    
    // Extract what we can from the partial JSON
    const extractedData: any = {
      overview: this.extractOverview(json, topic),
      focusAreas: this.extractFocusAreas(json, topic),
      studyMethods: this.extractStudyMethods(json, topic),
      revisionPhases: this.extractRevisionPhases(json, topic),
      assessmentPlan: this.extractAssessmentPlan(json),
      progressTracking: this.extractProgressTracking(json)
    };
    
    console.log('✅ Manual reconstruction completed');
    return extractedData;
  }

  private extractOverview(json: string, topic: string): any {
    const summaryMatch = json.match(/"summary":\s*"([^"]+)"/);
    const difficultyMatch = json.match(/"difficulty":\s*"([^"]+)"/);
    const timeMatch = json.match(/"totalEstimatedTime":\s*"([^"]+)"/);
    
    return {
      summary: summaryMatch ? summaryMatch[1] : `Comprehensive revision plan for ${topic}`,
      difficulty: difficultyMatch ? difficultyMatch[1] : 'intermediate',
      totalEstimatedTime: timeMatch ? timeMatch[1] : '10 hours',
      prerequisites: ['Basic knowledge']
    };
  }

  private extractFocusAreas(json: string, topic: string): any[] {
    const focusAreas: any[] = [];
    
    // Try to extract focus areas from the JSON
    const titleMatches = json.match(/"title":\s*"([^"]+)"/g);
    if (titleMatches && titleMatches.length > 0) {
      titleMatches.forEach((match, index) => {
        const title = match.match(/"title":\s*"([^"]+)"/)?.[1];
        if (title && !title.includes('Checkpoint')) {
          focusAreas.push({
            title: title,
            description: `Understanding ${title.toLowerCase()}`,
            importance: index === 0 ? 'critical' : 'important',
            keyConcepts: ['Key concept 1', 'Key concept 2'],
            studyTips: ['Study tip 1', 'Study tip 2'],
            estimatedTime: '2 hours'
          });
        }
      });
    }
    
    // If no focus areas found, generate some
    if (focusAreas.length === 0) {
      return this.generateFocusAreas(topic);
    }
    
    return focusAreas;
  }

  private extractStudyMethods(json: string, topic: string): any[] {
    // Try to extract study methods, but if none found, use defaults
    return this.generateStudyMethods(topic);
  }

  private extractRevisionPhases(json: string, topic: string): any[] {
    // Try to extract revision phases, but if none found, use defaults
    return this.generateRevisionPhases(topic);
  }

  private extractAssessmentPlan(json: string): any {
    return {
      formative: ['Self-quizzes', 'Practice exercises'],
      summative: ['Comprehensive tests', 'Project assessments'],
      selfAssessment: ['Reflection journals', 'Progress tracking']
    };
  }

  private extractProgressTracking(json: string): any {
    return {
      milestones: ['Complete foundation concepts', 'Master core principles', 'Apply knowledge practically'],
      checkpoints: ['Weekly progress reviews', 'Concept mastery checks'],
      successMetrics: ['Understanding depth', 'Retention rate', 'Application ability']
    };
  }

  private ensureCompletePlan(planData: any, topic: string, notes: string): any {
    console.log('🔧 Ensuring complete plan structure...');
    
    const completePlan = {
      overview: planData.overview || {
        summary: `Comprehensive revision plan for ${topic}`,
        difficulty: 'intermediate',
        totalEstimatedTime: '10 hours',
        prerequisites: ['Basic knowledge']
      },
      focusAreas: planData.focusAreas && planData.focusAreas.length > 0 ? planData.focusAreas : this.generateFocusAreas(topic),
      studyMethods: planData.studyMethods && planData.studyMethods.length > 0 ? planData.studyMethods : this.generateStudyMethods(topic),
      revisionPhases: planData.revisionPhases && planData.revisionPhases.length > 0 ? planData.revisionPhases : this.generateRevisionPhases(topic),
      assessmentPlan: planData.assessmentPlan || {
        formative: ['Self-quizzes', 'Practice exercises'],
        summative: ['Comprehensive tests', 'Project assessments'],
        selfAssessment: ['Reflection journals', 'Progress tracking']
      },
      progressTracking: planData.progressTracking || {
        milestones: ['Complete foundation concepts', 'Master core principles', 'Apply knowledge practically'],
        checkpoints: ['Weekly progress reviews', 'Concept mastery checks'],
        successMetrics: ['Understanding depth', 'Retention rate', 'Application ability']
      }
    };
    
    console.log('✅ Complete plan structure ensured');
    return completePlan;
  }

  private generateFocusAreas(topic: string): any[] {
    return [
      {
        title: `Introduction to ${topic}`,
        description: `Understanding the fundamental concepts and principles of ${topic}`,
        importance: 'critical',
        keyConcepts: ['Basic definitions', 'Core principles', 'Key terminology'],
        commonMistakes: ['Confusing similar concepts', 'Overlooking basic principles'],
        studyTips: ['Create concept maps', 'Use analogies', 'Practice with examples'],
        estimatedTime: '2 hours'
      },
      {
        title: `Advanced Concepts in ${topic}`,
        description: `Exploring deeper aspects and applications of ${topic}`,
        importance: 'important',
        keyConcepts: ['Advanced principles', 'Real-world applications', 'Complex scenarios'],
        commonMistakes: ['Oversimplifying complex concepts', 'Missing practical applications'],
        studyTips: ['Research case studies', 'Practice problem-solving', 'Connect theory to practice'],
        estimatedTime: '3 hours'
      },
      {
        title: `Practical Applications of ${topic}`,
        description: `Learning how to apply ${topic} knowledge in real-world situations`,
        importance: 'important',
        keyConcepts: ['Practical applications', 'Problem-solving techniques', 'Best practices'],
        commonMistakes: ['Focusing only on theory', 'Ignoring practical considerations'],
        studyTips: ['Work through examples', 'Practice hands-on exercises', 'Seek real-world applications'],
        estimatedTime: '2 hours'
      }
    ];
  }

  private generateStudyMethods(topic: string): any[] {
    return [
      {
        name: 'Active Reading',
        description: 'Engage with the material through questioning, summarizing, and note-taking',
        effectiveness: 'High for understanding concepts',
        estimatedTime: '1-2 hours per session'
      },
      {
        name: 'Practice Problems',
        description: 'Solve problems and exercises to reinforce learning',
        effectiveness: 'High for skill development',
        estimatedTime: '2-3 hours per session'
      },
      {
        name: 'Concept Mapping',
        description: 'Create visual diagrams showing relationships between concepts',
        effectiveness: 'High for understanding connections',
        estimatedTime: '1 hour per session'
      },
      {
        name: 'Peer Discussion',
        description: 'Discuss concepts with study partners or groups',
        effectiveness: 'High for deeper understanding',
        estimatedTime: '1-2 hours per session'
      }
    ];
  }

  private generateRevisionPhases(topic: string): any[] {
    return [
      {
        name: 'Review & Activation',
        description: 'Activate prior knowledge and review core concepts',
        duration: '15-20 minutes',
        pedagogicalApproach: 'warm-up',
        objectives: [
          {
            title: 'Activate Prior Knowledge',
            description: 'Review what you already know about the topic'
          }
        ],
        activities: {
          main: ['Review previous notes', 'Identify key concepts'],
          alternative: ['Quick concept quiz', 'Mind mapping']
        },
        resources: {
          primary: ['Previous notes', 'Textbook chapters'],
          secondary: ['Online summaries', 'Video overviews']
        }
      },
      {
        name: 'Core Learning',
        description: 'Deep dive into fundamental concepts and principles',
        duration: '30-45 minutes',
        pedagogicalApproach: 'instruction',
        objectives: [
          {
            title: 'Master Core Concepts',
            description: 'Understand fundamental principles and definitions systematically'
          }
        ],
        activities: {
          main: ['Read core materials', 'Take detailed notes'],
          alternative: ['Watch educational videos', 'Use interactive tutorials']
        },
        resources: {
          primary: ['Core textbooks', 'Lecture notes'],
          secondary: ['Educational videos', 'Online resources']
        }
      },
      {
        name: 'Guided Application',
        description: 'Practice applying concepts with support and guidance',
        duration: '20-30 minutes',
        pedagogicalApproach: 'guided-practice',
        objectives: [
          {
            title: 'Apply Knowledge',
            description: 'Practice using concepts in structured exercises'
          }
        ],
        activities: {
          main: ['Work through examples', 'Complete practice problems'],
          alternative: ['Use step-by-step guides', 'Follow tutorials']
        },
        resources: {
          primary: ['Practice exercises', 'Example problems'],
          secondary: ['Solution guides', 'Tutorial videos']
        }
      },
      {
        name: 'Independent Practice',
        description: 'Apply learning autonomously without guidance',
        duration: '25-35 minutes',
        pedagogicalApproach: 'independent-practice',
        objectives: [
          {
            title: 'Independent Mastery',
            description: 'Demonstrate ability to work without external support'
          }
        ],
        activities: {
          main: ['Solve problems independently', 'Create original examples'],
          alternative: ['Design practice scenarios', 'Teach others']
        },
        resources: {
          primary: ['Challenge problems', 'Open-ended questions'],
          secondary: ['Research materials', 'Real-world applications']
        }
      },
      {
        name: 'Consolidation & Reflection',
        description: 'Review and reflect on learning progress',
        duration: '10-15 minutes',
        pedagogicalApproach: 'consolidation',
        objectives: [
          {
            title: 'Reflect on Learning',
            description: 'Assess understanding and identify areas for improvement'
          }
        ],
        activities: {
          main: ['Self-assessment', 'Reflection journaling'],
          alternative: ['Peer discussion', 'Progress tracking']
        },
        resources: {
          primary: ['Self-assessment tools', 'Reflection prompts'],
          secondary: ['Progress tracking sheets', 'Discussion forums']
        }
      }
    ];
  }

  private extractSubjectFromNotes(notes: string): string {
    const lowerNotes = notes.toLowerCase();
    
    if (lowerNotes.includes('brain') || lowerNotes.includes('neuron') || lowerNotes.includes('psychology')) {
      return 'Psychology/Biology';
    }
    if (lowerNotes.includes('math') || lowerNotes.includes('equation') || lowerNotes.includes('formula')) {
      return 'Mathematics';
    }
    if (lowerNotes.includes('history') || lowerNotes.includes('war') || lowerNotes.includes('ancient')) {
      return 'History';
    }
    if (lowerNotes.includes('chemistry') || lowerNotes.includes('molecule') || lowerNotes.includes('element')) {
      return 'Chemistry';
    }
    if (lowerNotes.includes('physics') || lowerNotes.includes('force') || lowerNotes.includes('energy')) {
      return 'Physics';
    }
    if (lowerNotes.includes('computer') || lowerNotes.includes('programming') || lowerNotes.includes('software')) {
      return 'Computer Science';
    }
    if (lowerNotes.includes('english') || lowerNotes.includes('literature') || lowerNotes.includes('writing')) {
      return 'English Literature';
    }
    if (lowerNotes.includes('geography') || lowerNotes.includes('country') || lowerNotes.includes('continent')) {
      return 'Geography';
    }
    if (lowerNotes.includes('economics') || lowerNotes.includes('market') || lowerNotes.includes('finance')) {
      return 'Economics';
    }
    if (lowerNotes.includes('art') || lowerNotes.includes('painting') || lowerNotes.includes('design')) {
      return 'Art';
    }
    
    return 'General';
  }

  private createFallbackPlan(topic: string, notes: string): SimpleComprehensiveRevisionPlan {
    console.log('🔄 Creating fallback plan for:', topic);
    
    return {
      id: `fallback-plan-${Date.now()}`,
      title: `${topic} - Comprehensive Revision Plan`,
      topic,
      subject: this.extractSubjectFromNotes(notes),
      overview: {
        summary: `A structured approach to mastering ${topic} through systematic study and practice.`,
        difficulty: 'intermediate',
        totalEstimatedTime: '2-3 weeks',
        prerequisites: ['Basic understanding of the topic', 'Note-taking skills']
      },
      focusAreas: this.generateFocusAreas(topic),
      studyMethods: this.generateStudyMethods(topic),
      revisionPhases: this.generateRevisionPhases(topic),
      assessmentPlan: {
        formative: ['Weekly self-assessments', 'Concept check-ins'],
        summative: ['Comprehensive review', 'Practice exams'],
        selfAssessment: ['Reflection journals', 'Progress tracking']
      },
      progressTracking: {
        milestones: ['Complete foundation phase', 'Master core concepts'],
        checkpoints: ['Weekly progress reviews'],
        successMetrics: ['Understanding depth', 'Retention rate', 'Application ability']
      },
      createdAt: new Date()
    };
  }
}

export const simpleComprehensiveRevisionPlanService = new SimpleComprehensiveRevisionPlanService();
