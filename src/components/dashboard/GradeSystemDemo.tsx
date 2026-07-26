import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { profileAwareAI } from '@/services/profileAwareAI';

export function GradeSystemDemo() {
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');

  const grades = [
    "Grade 7", "Grade 8", "Grade 9",
    "Grade 10", "Grade 11", "Grade 12"
  ];

  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);
    // Simulate the difficulty mapping from ProfileAwareAI
    const gradeNum = parseInt(grade.replace('Grade ', ''));
    if (gradeNum <= 7) setDifficulty('beginner');
    else if (gradeNum === 8) setDifficulty('beginner-intermediate');
    else if (gradeNum === 9) setDifficulty('intermediate');
    else if (gradeNum === 10) setDifficulty('intermediate');
    else if (gradeNum === 11) setDifficulty('intermediate-advanced');
    else if (gradeNum >= 12) setDifficulty('advanced');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'beginner-intermediate': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'intermediate-advanced': return 'bg-orange-100 text-orange-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeDescription = (grade: string) => {
    const gradeNum = parseInt(grade.replace('Grade ', ''));
    if (gradeNum <= 7) return 'Foundational concepts, basic explanations';
    else if (gradeNum === 8) return 'Building on basics, introducing complexity';
    else if (gradeNum === 9) return 'Intermediate concepts, detailed explanations';
    else if (gradeNum === 10) return 'Intermediate level, analytical thinking';
    else if (gradeNum === 11) return 'Advanced concepts, critical thinking';
    else if (gradeNum >= 12) return 'University preparation, complex problem-solving';
    return '';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎓 Grade-Based AI System Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select a Grade Level:</label>
            <Select onValueChange={handleGradeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a grade to see AI difficulty mapping" />
              </SelectTrigger>
              <SelectContent>
                {grades.map((grade) => (
                  <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedGrade && (
            <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedGrade}</h3>
                  <p className="text-sm text-slate-600">{getGradeDescription(selectedGrade)}</p>
                </div>
                <Badge className={getDifficultyColor(difficulty)}>
                  {difficulty.replace('-', ' ').toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">AI Content Generation Will:</h4>
                <ul className="text-sm space-y-1 text-slate-600">
                  <li>• Use language appropriate for {selectedGrade} students</li>
                  <li>• Generate content at {difficulty} difficulty level</li>
                  <li>• Provide examples suitable for this age group</li>
                  <li>• Focus on concepts relevant to this grade level</li>
                </ul>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-slate-500">
                  <strong>Note:</strong> This replaces the previous JHS/SHS system with a more intuitive grade-based approach that AI systems can better understand and process.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-medium">Grade Level Mapping:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {grades.map((grade) => {
                const gradeNum = parseInt(grade.replace('Grade ', ''));
                let diff = '';
                if (gradeNum <= 7) diff = 'beginner';
                else if (gradeNum === 8) diff = 'beginner-intermediate';
                else if (gradeNum === 9) diff = 'intermediate';
                else if (gradeNum === 10) diff = 'intermediate';
                else if (gradeNum === 11) diff = 'intermediate-advanced';
                else if (gradeNum >= 12) diff = 'advanced';

                return (
                  <div key={grade} className="flex items-center justify-between p-2 bg-white rounded border">
                    <span className="font-medium">{grade}</span>
                    <Badge variant="outline" className={getDifficultyColor(diff)}>
                      {diff.replace('-', ' ')}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
