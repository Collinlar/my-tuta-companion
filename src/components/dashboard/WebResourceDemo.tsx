import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResourceGrid } from './ResourceCard';
import { webSearchService } from '@/services/webSearchService';
import { aiContentGenerator } from '@/services/aiContentGenerator';
import { Search, BookOpen, ExternalLink } from 'lucide-react';

export function WebResourceDemo() {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [notes, setNotes] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [learningPath, setLearningPath] = useState<any>(null);

  const subjects = [
    'Mathematics', 'English Language', 'Science', 'Social Studies',
    'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 
    'Economics', 'Government', 'Literature', 'French', 'ICT',
    'Business Studies', 'Visual Arts', 'Music', 'Physical Education'
  ];

  const grades = [
    'Grade 7', 'Grade 8', 'Grade 9',
    'Grade 10', 'Grade 11', 'Grade 12'
  ];

  const handleSearchResources = async () => {
    if (!topic || !subject || !grade) return;
    
    setIsSearching(true);
    try {
      const resources = await webSearchService.searchGhanaEducationalContent(topic, subject, grade);
      setSearchResults(resources);
    } catch (error) {
      console.error('Error searching resources:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGenerateLearningPath = async () => {
    if (!topic || !subject || !grade || !notes) return;
    
    setIsSearching(true);
    try {
      // Create a mock profile for demonstration
      const mockProfile = {
        name: "Demo Student",
        school: "Demo School",
        grade: grade,
        subjects: [subject],
        goals: ["Excel in exams", "Prepare for higher education"],
        userType: 'student' as const
      };

      // Store mock profile temporarily
      localStorage.setItem('userProfile', JSON.stringify(mockProfile));

      // Generate learning path with web resources
      const plan = await aiContentGenerator.generateRevisionPlan(notes, ['learning-path'], 'demo-notes.txt');
      setLearningPath(plan);
    } catch (error) {
      console.error('Error generating learning path:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-6 h-6 text-blue-600" />
            Web Resource Search & Learning Path Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Topic:</label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Photosynthesis, Quadratic Equations"
              />
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Grade:</label>
              <Select onValueChange={setGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (for learning path):</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter your notes about the topic..."
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleSearchResources} 
              disabled={isSearching || !topic || !subject || !grade}
              className="flex-1"
            >
              {isSearching ? 'Searching...' : 'Search Web Resources'}
            </Button>
            <Button 
              onClick={handleGenerateLearningPath} 
              disabled={isSearching || !topic || !subject || !grade || !notes}
              className="flex-1"
            >
              {isSearching ? 'Generating...' : 'Generate Learning Path'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Found Resources ({searchResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResourceGrid 
              resources={searchResults.map((resource, index) => ({
                id: `search-${index}`,
                title: resource.title,
                type: resource.type as any,
                url: resource.url,
                description: resource.description,
                duration: resource.duration,
                difficulty: resource.difficulty,
                source: resource.source,
                thumbnail: resource.thumbnail
              }))}
            />
          </CardContent>
        </Card>
      )}

      {/* Learning Path with Resources */}
      {learningPath && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              Generated Learning Path with Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">{learningPath.title}</h3>
                <p className="text-blue-800 text-sm">{learningPath.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-blue-600">
                  <span>Subject: {learningPath.subject}</span>
                  <span>Topic: {learningPath.topic}</span>
                  <span>Difficulty: {learningPath.difficulty}</span>
                </div>
              </div>

              <div className="space-y-4">
                {learningPath.tasks.map((task: any, index: number) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {index + 1}. {task.title}
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                    
                    {task.resources && task.resources.length > 0 && (
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Resources:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {task.resources.map((resource: any, resourceIndex: number) => (
                            <div key={resourceIndex} className="p-3 border border-gray-200 rounded-lg">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h6 className="font-medium text-sm">{resource.title}</h6>
                                  <p className="text-xs text-gray-500 mt-1">{resource.source}</p>
                                  <p className="text-xs text-gray-600 mt-1">{resource.description}</p>
                                </div>
                                {resource.url && (
                                  <a 
                                    href={resource.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
