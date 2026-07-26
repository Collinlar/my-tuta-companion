import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Bug,
  Database,
  Wifi,
  Key,
  Settings
} from "lucide-react";
import { groqApiService } from "@/services/groqApiService";
import { aiContentGenerator } from "@/services/aiContentGenerator";

interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

export function DiagnosticPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);
    
    const newResults: DiagnosticResult[] = [];

    // Test 1: Environment Variables
    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) {
        newResults.push({
          test: "API Key Configuration",
          status: 'fail',
          message: "Groq API key not found in environment variables",
          details: "Please set VITE_GROQ_API_KEY in your .env file"
        });
      } else {
        newResults.push({
          test: "API Key Configuration",
          status: 'pass',
          message: "API key is configured",
          details: `Key starts with: ${apiKey.substring(0, 10)}...`
        });
      }
    } catch (error) {
      newResults.push({
        test: "API Key Configuration",
        status: 'fail',
        message: "Error checking API key",
        details: String(error)
      });
    }

    // Test 2: API Connection
    try {
      const isConnected = await groqApiService.testConnection();
      newResults.push({
        test: "API Connection",
        status: isConnected ? 'pass' : 'fail',
        message: isConnected ? "Successfully connected to Groq API" : "Failed to connect to Groq API",
        details: isConnected ? "API is responding correctly" : "Check your internet connection and API key"
      });
    } catch (error) {
      newResults.push({
        test: "API Connection",
        status: 'fail',
        message: "API connection test failed",
        details: String(error)
      });
    }

    // Test 3: Content Generation
    try {
      const testNotes = "This is a test note about mathematics. It covers basic algebra concepts.";
      const testGoals: any[] = ['flashcards', 'quizzes'];
      
      const plan = await aiContentGenerator.generateRevisionPlan(testNotes, testGoals, "test.txt");
      
      if (plan && plan.tasks && plan.tasks.length > 0) {
        newResults.push({
          test: "Content Generation",
          status: 'pass',
          message: "Successfully generated revision plan",
          details: `Generated ${plan.tasks.length} tasks for goals: ${plan.goals.join(', ')}`
        });
      } else {
        newResults.push({
          test: "Content Generation",
          status: 'fail',
          message: "Generated plan is empty or invalid",
          details: "Plan generation returned empty or malformed data"
        });
      }
    } catch (error) {
      newResults.push({
        test: "Content Generation",
        status: 'fail',
        message: "Content generation failed",
        details: String(error)
      });
    }

    // Test 4: Local Storage
    try {
      const userProfile = localStorage.getItem('userProfile');
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        newResults.push({
          test: "User Profile",
          status: 'pass',
          message: "User profile found in localStorage",
          details: `User type: ${profile.userType || 'unknown'}`
        });
      } else {
        newResults.push({
          test: "User Profile",
          status: 'warning',
          message: "No user profile found",
          details: "This might affect personalized content generation"
        });
      }
    } catch (error) {
      newResults.push({
        test: "User Profile",
        status: 'fail',
        message: "Error reading user profile",
        details: String(error)
      });
    }

    // Test 5: Browser Compatibility
    try {
      const hasLocalStorage = typeof Storage !== 'undefined';
      const hasFetch = typeof fetch !== 'undefined';
      const hasPromise = typeof Promise !== 'undefined';
      
      if (hasLocalStorage && hasFetch && hasPromise) {
        newResults.push({
          test: "Browser Compatibility",
          status: 'pass',
          message: "Browser supports required features",
          details: "localStorage, fetch, and Promise are available"
        });
      } else {
        newResults.push({
          test: "Browser Compatibility",
          status: 'fail',
          message: "Browser missing required features",
          details: `localStorage: ${hasLocalStorage}, fetch: ${hasFetch}, Promise: ${hasPromise}`
        });
      }
    } catch (error) {
      newResults.push({
        test: "Browser Compatibility",
        status: 'fail',
        message: "Error checking browser compatibility",
        details: String(error)
      });
    }

    setResults(newResults);
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Bug className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'fail':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getOverallStatus = () => {
    const failCount = results.filter(r => r.status === 'fail').length;
    const warningCount = results.filter(r => r.status === 'warning').length;
    
    if (failCount > 0) return 'fail';
    if (warningCount > 0) return 'warning';
    return 'pass';
  };

  const overallStatus = getOverallStatus();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Bug className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">System Diagnostics</CardTitle>
              <p className="text-sm text-muted-foreground">
                Check system health and identify issues
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={runDiagnostics}
              disabled={isRunning}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Run Diagnostics
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Status */}
        {results.length > 0 && (
          <Alert className={getStatusColor(overallStatus)}>
            <div className="flex items-center gap-2">
              {getStatusIcon(overallStatus)}
              <div>
                <h4 className="font-semibold">
                  {overallStatus === 'pass' && 'All systems operational'}
                  {overallStatus === 'warning' && 'Some issues detected'}
                  {overallStatus === 'fail' && 'Critical issues found'}
                </h4>
                <p className="text-sm">
                  {results.length} tests completed
                </p>
              </div>
            </div>
          </Alert>
        )}

        {/* Test Results */}
        <div className="space-y-3">
          {results.map((result, index) => (
            <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(result.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm">{result.test}</h4>
                  <Badge 
                    variant={result.status === 'pass' ? 'default' : result.status === 'warning' ? 'secondary' : 'destructive'}
                    className="text-xs"
                  >
                    {result.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {result.message}
                </p>
                {showDetails && result.details && (
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    <code>{result.details}</code>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Fixes */}
        {results.some(r => r.status === 'fail') && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-semibold text-amber-900 mb-2">Quick Fixes</h4>
            <ul className="text-sm text-amber-800 space-y-1">
              {results.some(r => r.test === 'API Key Configuration' && r.status === 'fail') && (
                <li>• Set VITE_GROQ_API_KEY in your .env file</li>
              )}
              {results.some(r => r.test === 'API Connection' && r.status === 'fail') && (
                <li>• Check your internet connection</li>
              )}
              {results.some(r => r.test === 'Content Generation' && r.status === 'fail') && (
                <li>• Verify API key is valid and has sufficient credits</li>
              )}
              {results.some(r => r.test === 'User Profile' && r.status === 'fail') && (
                <li>• Complete the onboarding process to set up your profile</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
