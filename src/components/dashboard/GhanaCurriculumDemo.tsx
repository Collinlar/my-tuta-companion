import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { profileAwareAI } from '@/services/profileAwareAI';
import { Flag, BookOpen, GraduationCap, MapPin, Users } from 'lucide-react';

export function GhanaCurriculumDemo() {
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const grades = [
    "Grade 7", "Grade 8", "Grade 9",
    "Grade 10", "Grade 11", "Grade 12"
  ];

  const subjects = [
    "Mathematics", "English Language", "Science", "Social Studies",
    "Physics", "Chemistry", "Biology", "History", "Geography", 
    "Economics", "Government", "Literature", "French", "ICT",
    "Business Studies", "Visual Arts", "Music", "Physical Education"
  ];

  const ghanaExamples = {
    "Grade 7": "Basic concepts with Ghanaian examples (e.g., counting with Ghanaian currency, local geography)",
    "Grade 8": "Building foundations with local context (e.g., Ghana's regions, cultural practices)",
    "Grade 9": "BECE preparation with Ghana-specific content (e.g., Ghana's history, local ecosystems)",
    "Grade 10": "SHS foundation with national context (e.g., Ghana's economy, government structure)",
    "Grade 11": "Advanced concepts with local applications (e.g., Ghana's development challenges)",
    "Grade 12": "WASSCE preparation with comprehensive Ghana context (e.g., national policies, global connections)"
  };

  const handleGenerateContent = async () => {
    if (!selectedGrade || !subject || !topic || !notes) return;
    
    setIsGenerating(true);
    try {
      // Create a mock profile for demonstration
      const mockProfile = {
        name: "Kwame",
        school: "Accra Academy",
        grade: selectedGrade,
        subjects: [subject],
        goals: ["Excel in exams", "Prepare for higher education"],
        userType: 'student' as const
      };

      // Store mock profile temporarily
      localStorage.setItem('userProfile', JSON.stringify(mockProfile));

      // Generate learning path
      const learningPath = await profileAwareAI.generateLearningPath(notes, topic);
      setResult({ type: 'learningPath', data: learningPath });
    } catch (error) {
      console.error('Error generating content:', error);
      setResult({ type: 'error', message: 'Failed to generate content. Please try again.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const getGradeDescription = (grade: string) => {
    const gradeNum = parseInt(grade.replace('Grade ', ''));
    if (gradeNum <= 9) return 'Basic School Level - Preparing for BECE';
    else return 'Senior High School Level - Preparing for WASSCE';
  };

  const getExamContext = (grade: string) => {
    const gradeNum = parseInt(grade.replace('Grade ', ''));
    if (gradeNum === 9) return 'BECE (Basic Education Certificate Examination)';
    else if (gradeNum === 12) return 'WASSCE (West African Senior School Certificate Examination)';
    else return 'Continuous Assessment & Internal Exams';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="w-6 h-6 text-green-600" />
            Ghana Curriculum AI Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Grade Level:</label>
              <Select onValueChange={setSelectedGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Subject:</label>
              <Select onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subj) => (
                    <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Topic:</label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Photosynthesis, Quadratic Equations, Ghana's Independence"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes/Context:</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter your notes or context about the topic..."
              rows={3}
            />
          </div>

          <Button 
            onClick={handleGenerateContent} 
            disabled={isGenerating || !selectedGrade || !subject || !topic || !notes}
            className="w-full"
          >
            {isGenerating ? 'Generating Ghana-Specific Content...' : 'Generate Learning Path'}
          </Button>
        </CardContent>
      </Card>

      {selectedGrade && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Ghana Curriculum Context for {selectedGrade}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <GraduationCap className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-sm">Education Level</p>
                  <p className="text-xs text-green-700">{getGradeDescription(selectedGrade)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Exam Focus</p>
                  <p className="text-xs text-blue-700">{getExamContext(selectedGrade)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                <MapPin className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium text-sm">Ghana Context</p>
                  <p className="text-xs text-purple-700">Local examples & culture</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-medium mb-2">AI Will Generate Content That:</h4>
              <ul className="text-sm space-y-1 text-slate-600">
                <li>• Uses Ghana-specific examples and landmarks</li>
                <li>• Aligns with Ghana Education Service (GES) curriculum</li>
                <li>• References Ghanaian cities, regions, and culture</li>
                <li>• Considers appropriate exam preparation (BECE/WASSCE)</li>
                <li>• Uses language appropriate for {selectedGrade} students in Ghana</li>
              </ul>
            </div>

            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Example for {selectedGrade}:</strong> {ghanaExamples[selectedGrade as keyof typeof ghanaExamples]}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
          </CardHeader>
          <CardContent>
            {result.type === 'error' ? (
              <p className="text-red-600">{result.message}</p>
            ) : (
              <div className="space-y-4">
                <h4 className="font-medium">Learning Path Steps:</h4>
                {result.data?.steps?.map((step: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <h5 className="font-medium">{step.title}</h5>
                    <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                    {step.resources && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-slate-500">Resources:</p>
                        <ul className="text-xs text-slate-600 mt-1">
                          {step.resources.map((resource: any, idx: number) => (
                            <li key={idx}>• {resource.title}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Ghana Educational System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-green-700">Basic School (Grade 1-9)</h4>
              <ul className="text-sm space-y-1 text-slate-600">
                <li>• Foundation years with Ghana-specific content</li>
                <li>• Grade 9: BECE preparation</li>
                <li>• Focus on local culture and context</li>
                <li>• GES curriculum standards</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-blue-700">Senior High School (Grade 10-12)</h4>
              <ul className="text-sm space-y-1 text-slate-600">
                <li>• Advanced concepts with national context</li>
                <li>• Grade 12: WASSCE preparation</li>
                <li>• University preparation focus</li>
                <li>• Career readiness in Ghana</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
