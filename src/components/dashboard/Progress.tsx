import { Card } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Calendar, Target, Trophy, BookOpen, Award, Clock, ChevronDown, ChevronUp, BarChart3, Users, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { analyticsService, ComprehensiveAnalytics } from "@/services/analyticsService";

export function Progress() {
  const [showStats, setShowStats] = useState(true);
  const [showSubjectDetails, setShowSubjectDetails] = useState(true);
  const [analytics, setAnalytics] = useState<ComprehensiveAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = analyticsService.getComprehensiveAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Learning Progress</h1>
          <p className="text-slate-600">Loading your analytics...</p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }

  const hasData = analytics && (analytics.totalStudyTime > 0 || analytics.sessionsCompleted > 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Learning Progress</h1>
        <p className="text-slate-600">
          Track your academic journey and celebrate your achievements
        </p>
      </div>

      {!hasData ? (
        /* No Data State */
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-400 to-slate-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Start Your Learning Journey</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Begin studying to track your progress, build streaks, and unlock achievements. Your learning analytics will appear here once you start.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3">
                <BookOpen className="w-4 h-4 mr-2" />
                Start Studying
              </Button>
              <Button variant="outline" className="border-slate-300 text-slate-700 px-6 py-3">
                <Target className="w-4 h-4 mr-2" />
                Take Quiz
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        /* Analytics Data Available */
        <>
          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Study Time</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {Math.round(analytics!.totalStudyTime)} min
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Sessions Completed</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {analytics!.sessionsCompleted}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Study Streak</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {analytics!.studyStreak} days
                  </p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Average Session</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {Math.round(analytics!.averageSessionLength)} min
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </Card>
          </div>
          {/* Subject Progress */}
          {analytics!.subjectProgress.length > 0 ? (
            <Card className="p-8 border border-slate-200 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-slate-900">Subject Progress</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSubjectDetails(!showSubjectDetails)}
                >
                  {showSubjectDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>
              
              {showSubjectDetails && (
                <div className="space-y-4">
                  {analytics!.subjectProgress.map((subject, index) => (
                    <div key={index} className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-slate-900">{subject.subject}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span>{Math.round(subject.timeSpent)} min</span>
                          <span>{subject.sessions} sessions</span>
                          <span>{Math.round(subject.averageScore)}% avg</span>
                        </div>
                      </div>
                      <ProgressBar value={subject.averageScore} className="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-8 border border-slate-200 shadow-lg">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Subject Progress Yet</h3>
                <p className="text-slate-600 mb-4">
                  Start studying different subjects to see your progress tracked here.
                </p>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* This Week's Activity */}
            <Card className="p-8 border border-slate-200 shadow-lg">
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">This Week's Activity</h2>
              <div className="space-y-4">
                {analytics!.weeklyActivity.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="font-medium text-slate-900">{day.day}</div>
                    <div className="flex items-center gap-6 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{day.studyTime}min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        <span className="font-medium">{day.quizzes} quizzes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span className="font-medium">{day.flashcards} cards</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Achievements */}
            <Card className="p-8 border border-slate-200 shadow-lg">
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">Achievements</h2>
              <div className="space-y-4">
                {analytics!.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        achievement.earned ? "bg-green-500" : "bg-slate-300"
                      }`}>
                        {achievement.earned && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{achievement.title}</div>
                        <div className="text-sm text-slate-600">{achievement.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {achievement.earned ? (
                        <Button variant="outline" size="sm" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          {achievement.date}
                        </Button>
                      ) : (
                        <div className="text-sm font-medium text-slate-600">
                          {achievement.progress}/{achievement.maxProgress}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          {analytics!.recentActivity.length > 0 && (
            <Card className="p-8 border border-slate-200 shadow-lg">
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {analytics!.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-500 rounded-lg flex items-center justify-center">
                        {activity.type === 'study' && <BookOpen className="w-4 h-4 text-white" />}
                        {activity.type === 'quiz' && <Target className="w-4 h-4 text-white" />}
                        {activity.type === 'flashcard' && <Star className="w-4 h-4 text-white" />}
                        {activity.type === 'contest' && <Trophy className="w-4 h-4 text-white" />}
                        {activity.type === 'learning-path' && <Users className="w-4 h-4 text-white" />}
                        {activity.type === 'revision-plan' && <BarChart3 className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{activity.title}</div>
                        <div className="text-sm text-slate-600">{activity.subject}</div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-slate-600">
                      <div>{activity.timestamp.toLocaleDateString()}</div>
                      {activity.duration && <div>{activity.duration} min</div>}
                      {activity.score && <div>{activity.score}%</div>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}