import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Users, Clock, Star, ArrowLeft, Play } from "lucide-react";

interface ContestDetailProps {
  contest: {
    id: number;
    title: string;
    description: string;
    participants: number;
    timeLeft: string;
    prize: string;
    difficulty: string;
    subject: string;
    myRank: number;
    totalParticipants: number;
    duration: number; // minutes
    questions: number;
    rules: string[];
  };
  onBack: () => void;
  onStart: () => void;
}

export function ContestDetail({ contest, onBack, onStart }: ContestDetailProps) {
  const topPerformers: any[] = [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Navigation */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Contests
        </Button>
      </div>

      {/* Main Contest Card */}
      <Card className="p-8 border border-slate-200 shadow-lg">
        {/* Contest Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-3">{contest.title}</h1>
              <p className="text-slate-600 text-lg leading-relaxed">{contest.description}</p>
            </div>
          </div>
          <Badge
            className={
              contest.difficulty === 'Easy' ? 'bg-green-100 text-green-700 border-green-200 text-sm px-4 py-2' : 
              contest.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200 text-sm px-4 py-2' : 
              'bg-red-100 text-red-700 border-red-200 text-sm px-4 py-2'
            }
          >
            {contest.difficulty}
          </Badge>
        </div>

        {/* Contest Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">{contest.participants}</div>
            <div className="text-sm font-medium text-slate-600">Participants</div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-50 to-orange-100 p-6 rounded-2xl border border-yellow-200 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">{contest.duration}m</div>
            <div className="text-sm font-medium text-slate-600">Duration</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-2xl border border-green-200 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">{contest.questions}</div>
            <div className="text-sm font-medium text-slate-600">Questions</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-6 rounded-2xl border border-purple-200 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">{contest.prize}</div>
            <div className="text-sm font-medium text-slate-600">Prize</div>
          </div>
        </div>

        {/* Rules and Top Performers */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Contest Rules */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">Contest Rules</h3>
            </div>
            <Card className="p-6 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200">
              <ul className="space-y-4">
                {contest.rules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-white">{index + 1}</span>
                    </div>
                    <span className="text-slate-700 leading-relaxed">{rule}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Top Performers */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">Top Performers</h3>
            </div>
            <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">No Performers Yet</h4>
                <p className="text-slate-600">
                  Be the first to participate and see your name on the leaderboard!
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom Action Section */}
        <div className="bg-gradient-to-r from-slate-50 to-purple-50 p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-600">Time Remaining</div>
              <div className="text-2xl font-bold text-orange-600">{contest.timeLeft}</div>
            </div>
            <Button 
              size="lg" 
              onClick={onStart} 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 text-lg font-semibold"
            >
              <Play className="w-6 h-6 mr-3" />
              Join Contest
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}