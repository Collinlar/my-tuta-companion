import { aiCompanionService, StudySession } from './aiCompanionService';
import { profileAwareAI, UserProfile } from './profileAwareAI';

export interface TimeSlot {
  hour: number;
  label: string;
  period: 'early-morning' | 'morning' | 'mid-morning' | 'afternoon' | 'late-afternoon' | 'evening' | 'night';
}

export interface OptimalTimeProfile {
  dailyPattern: {
    [hour: number]: {
      productivity: number; // 0-100
      focus: number; // 0-100
      retention: number; // 0-100
      engagement: number; // 0-100
      sampleSize: number;
      confidence: number; // 0-100
    };
  };
  weeklyPattern: {
    [dayOfWeek: string]: {
      productivity: number;
      focus: number;
      retention: number;
      engagement: number;
      sampleSize: number;
      confidence: number;
    };
  };
  seasonalPattern: {
    [month: string]: {
      productivity: number;
      focus: number;
      retention: number;
      engagement: number;
      sampleSize: number;
      confidence: number;
    };
  };
  peakPerformance: {
    bestHour: number;
    bestDay: string;
    bestMonth: string;
    peakProductivity: number;
    peakFocus: number;
    peakRetention: number;
  };
  lowPerformance: {
    worstHour: number;
    worstDay: string;
    worstMonth: string;
    lowProductivity: number;
    lowFocus: number;
    lowRetention: number;
  };
  optimalConditions: {
    sessionLength: number; // minutes
    breakFrequency: number; // breaks per hour
    breakDuration: number; // minutes
    environmentFactors: string[];
  };
  circadianRhythm: {
    chronotype: 'morning' | 'evening' | 'intermediate' | 'unknown';
    alertnessPeak: number; // hour of day
    alertnessTrough: number; // hour of day
    energyLevels: { [hour: number]: number }; // 0-100
  };
  lastUpdated: Date;
}

export interface TimeBasedRecommendation {
  id: string;
  type: 'schedule' | 'timing' | 'environment' | 'break' | 'session';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  reasoning: string;
  optimalTime: {
    hour?: number;
    dayOfWeek?: string;
    month?: string;
    conditions?: string[];
  };
  implementation: {
    steps: string[];
    timing: string;
    frequency: string;
    duration: string;
  };
  expectedBenefits: string[];
  confidence: number; // 0-100
  timestamp: Date;
}

export interface TimeAnalysisData {
  sessionId: string;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  productivity: number; // 1-10
  focus: number; // 1-10
  retention: number; // 1-10
  engagement: number; // 1-10
  subject: string;
  topic: string;
  environment: {
    location: string;
    noiseLevel: number; // 1-10
    lighting: number; // 1-10
    temperature: number; // 1-10
    distractions: number; // 1-10
  };
  conditions: {
    weather?: string;
    mood: string;
    energy: number; // 1-10
    stress: number; // 1-10
    sleep: number; // hours
  };
}

export class OptimalTimeDetection {
  private userProfile: UserProfile | null = null;
  private optimalTimeProfile: OptimalTimeProfile | null = null;
  private timeAnalysisData: TimeAnalysisData[] = [];
  private studySessions: StudySession[] = [];

  constructor() {
    this.loadUserData();
    this.initializeOptimalTimeProfile();
  }

  private loadUserData(): void {
    try {
      const profile = localStorage.getItem('userProfile');
      if (profile) {
        this.userProfile = JSON.parse(profile);
      }

      const timeData = localStorage.getItem('timeAnalysisData');
      if (timeData) {
        this.timeAnalysisData = JSON.parse(timeData).map((d: any) => ({
          ...d,
          startTime: new Date(d.startTime),
          endTime: new Date(d.endTime)
        }));
      }

      const sessions = localStorage.getItem('studySessions');
      if (sessions) {
        this.studySessions = JSON.parse(sessions).map((s: any) => ({
          ...s,
          startTime: new Date(s.startTime),
          endTime: s.endTime ? new Date(s.endTime) : undefined
        }));
      }

      const timeProfile = localStorage.getItem('optimalTimeProfile');
      if (timeProfile) {
        this.optimalTimeProfile = {
          ...JSON.parse(timeProfile),
          lastUpdated: new Date(JSON.parse(timeProfile).lastUpdated)
        };
      }
    } catch (error) {
      console.error('Error loading optimal time data:', error);
    }
  }

  private initializeOptimalTimeProfile(): void {
    this.optimalTimeProfile = {
      dailyPattern: {},
      weeklyPattern: {},
      seasonalPattern: {},
      peakPerformance: {
        bestHour: 14, // 2 PM default
        bestDay: 'Tuesday',
        bestMonth: 'October',
        peakProductivity: 50,
        peakFocus: 50,
        peakRetention: 50
      },
      lowPerformance: {
        worstHour: 22, // 10 PM default
        worstDay: 'Monday',
        worstMonth: 'January',
        lowProductivity: 50,
        lowFocus: 50,
        lowRetention: 50
      },
      optimalConditions: {
        sessionLength: 45,
        breakFrequency: 1,
        breakDuration: 10,
        environmentFactors: ['quiet', 'good lighting', 'comfortable temperature']
      },
      circadianRhythm: {
        chronotype: 'unknown',
        alertnessPeak: 14,
        alertnessTrough: 2,
        energyLevels: {}
      },
      lastUpdated: new Date()
    };

    // Initialize hourly patterns
    for (let hour = 0; hour < 24; hour++) {
      this.optimalTimeProfile.dailyPattern[hour] = {
        productivity: 50,
        focus: 50,
        retention: 50,
        engagement: 50,
        sampleSize: 0,
        confidence: 0
      };
    }

    // Initialize weekly patterns
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    daysOfWeek.forEach(day => {
      this.optimalTimeProfile!.weeklyPattern[day] = {
        productivity: 50,
        focus: 50,
        retention: 50,
        engagement: 50,
        sampleSize: 0,
        confidence: 0
      };
    });

    // Initialize seasonal patterns
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    months.forEach(month => {
      this.optimalTimeProfile!.seasonalPattern[month] = {
        productivity: 50,
        focus: 50,
        retention: 50,
        engagement: 50,
        sampleSize: 0,
        confidence: 0
      };
    });

    // Initialize energy levels
    for (let hour = 0; hour < 24; hour++) {
      this.optimalTimeProfile!.circadianRhythm.energyLevels[hour] = 50;
    }
  }

  // Record time analysis data for a study session
  recordTimeAnalysis(data: TimeAnalysisData): void {
    this.timeAnalysisData.push(data);
    this.saveTimeAnalysisData();
    this.updateOptimalTimeProfile();
  }

  // Update optimal time profile based on collected data
  private updateOptimalTimeProfile(): void {
    if (!this.optimalTimeProfile || this.timeAnalysisData.length === 0) return;

    // Analyze daily patterns
    this.analyzeDailyPatterns();
    
    // Analyze weekly patterns
    this.analyzeWeeklyPatterns();
    
    // Analyze seasonal patterns
    this.analyzeSeasonalPatterns();
    
    // Update peak and low performance
    this.updatePeakPerformance();
    
    // Update optimal conditions
    this.updateOptimalConditions();
    
    // Analyze circadian rhythm
    this.analyzeCircadianRhythm();
    
    this.optimalTimeProfile.lastUpdated = new Date();
    this.saveOptimalTimeProfile();
  }

  private analyzeDailyPatterns(): void {
    if (!this.optimalTimeProfile) return;

    // Group data by hour
    const hourlyData: { [hour: number]: TimeAnalysisData[] } = {};
    
    this.timeAnalysisData.forEach(data => {
      const hour = data.startTime.getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = [];
      }
      hourlyData[hour].push(data);
    });

    // Calculate metrics for each hour
    Object.entries(hourlyData).forEach(([hour, sessions]) => {
      const hourNum = parseInt(hour);
      const sampleSize = sessions.length;
      
      if (sampleSize > 0) {
        const avgProductivity = sessions.reduce((sum, s) => sum + s.productivity, 0) / sampleSize;
        const avgFocus = sessions.reduce((sum, s) => sum + s.focus, 0) / sampleSize;
        const avgRetention = sessions.reduce((sum, s) => sum + s.retention, 0) / sampleSize;
        const avgEngagement = sessions.reduce((sum, s) => sum + s.engagement, 0) / sampleSize;
        
        const confidence = Math.min(100, sampleSize * 10); // More samples = higher confidence
        
        this.optimalTimeProfile!.dailyPattern[hourNum] = {
          productivity: Math.round(avgProductivity * 10), // Convert 1-10 to 0-100
          focus: Math.round(avgFocus * 10),
          retention: Math.round(avgRetention * 10),
          engagement: Math.round(avgEngagement * 10),
          sampleSize,
          confidence
        };
      }
    });
  }

  private analyzeWeeklyPatterns(): void {
    if (!this.optimalTimeProfile) return;

    // Group data by day of week
    const dailyData: { [day: string]: TimeAnalysisData[] } = {};
    
    this.timeAnalysisData.forEach(data => {
      const day = data.startTime.toLocaleDateString('en-US', { weekday: 'long' });
      if (!dailyData[day]) {
        dailyData[day] = [];
      }
      dailyData[day].push(data);
    });

    // Calculate metrics for each day
    Object.entries(dailyData).forEach(([day, sessions]) => {
      const sampleSize = sessions.length;
      
      if (sampleSize > 0) {
        const avgProductivity = sessions.reduce((sum, s) => sum + s.productivity, 0) / sampleSize;
        const avgFocus = sessions.reduce((sum, s) => sum + s.focus, 0) / sampleSize;
        const avgRetention = sessions.reduce((sum, s) => sum + s.retention, 0) / sampleSize;
        const avgEngagement = sessions.reduce((sum, s) => sum + s.engagement, 0) / sampleSize;
        
        const confidence = Math.min(100, sampleSize * 5); // Weekly patterns need more samples
        
        this.optimalTimeProfile!.weeklyPattern[day] = {
          productivity: Math.round(avgProductivity * 10),
          focus: Math.round(avgFocus * 10),
          retention: Math.round(avgRetention * 10),
          engagement: Math.round(avgEngagement * 10),
          sampleSize,
          confidence
        };
      }
    });
  }

  private analyzeSeasonalPatterns(): void {
    if (!this.optimalTimeProfile) return;

    // Group data by month
    const monthlyData: { [month: string]: TimeAnalysisData[] } = {};
    
    this.timeAnalysisData.forEach(data => {
      const month = data.startTime.toLocaleDateString('en-US', { month: 'long' });
      if (!monthlyData[month]) {
        monthlyData[month] = [];
      }
      monthlyData[month].push(data);
    });

    // Calculate metrics for each month
    Object.entries(monthlyData).forEach(([month, sessions]) => {
      const sampleSize = sessions.length;
      
      if (sampleSize > 0) {
        const avgProductivity = sessions.reduce((sum, s) => sum + s.productivity, 0) / sampleSize;
        const avgFocus = sessions.reduce((sum, s) => sum + s.focus, 0) / sampleSize;
        const avgRetention = sessions.reduce((sum, s) => sum + s.retention, 0) / sampleSize;
        const avgEngagement = sessions.reduce((sum, s) => sum + s.engagement, 0) / sampleSize;
        
        const confidence = Math.min(100, sampleSize * 2); // Seasonal patterns need many samples
        
        this.optimalTimeProfile!.seasonalPattern[month] = {
          productivity: Math.round(avgProductivity * 10),
          focus: Math.round(avgFocus * 10),
          retention: Math.round(avgRetention * 10),
          engagement: Math.round(avgEngagement * 10),
          sampleSize,
          confidence
        };
      }
    });
  }

  private updatePeakPerformance(): void {
    if (!this.optimalTimeProfile) return;

    // Find peak performance hour
    let bestHour = 0;
    let bestProductivity = 0;
    
    Object.entries(this.optimalTimeProfile.dailyPattern).forEach(([hour, data]) => {
      if (data.confidence > 50 && data.productivity > bestProductivity) {
        bestHour = parseInt(hour);
        bestProductivity = data.productivity;
      }
    });

    // Find peak performance day
    let bestDay = 'Tuesday';
    let bestDayProductivity = 0;
    
    Object.entries(this.optimalTimeProfile.weeklyPattern).forEach(([day, data]) => {
      if (data.confidence > 30 && data.productivity > bestDayProductivity) {
        bestDay = day;
        bestDayProductivity = data.productivity;
      }
    });

    // Find peak performance month
    let bestMonth = 'October';
    let bestMonthProductivity = 0;
    
    Object.entries(this.optimalTimeProfile.seasonalPattern).forEach(([month, data]) => {
      if (data.confidence > 20 && data.productivity > bestMonthProductivity) {
        bestMonth = month;
        bestMonthProductivity = data.productivity;
      }
    });

    // Find low performance
    let worstHour = 22;
    let worstProductivity = 100;
    
    Object.entries(this.optimalTimeProfile.dailyPattern).forEach(([hour, data]) => {
      if (data.confidence > 50 && data.productivity < worstProductivity) {
        worstHour = parseInt(hour);
        worstProductivity = data.productivity;
      }
    });

    let worstDay = 'Monday';
    let worstDayProductivity = 100;
    
    Object.entries(this.optimalTimeProfile.weeklyPattern).forEach(([day, data]) => {
      if (data.confidence > 30 && data.productivity < worstDayProductivity) {
        worstDay = day;
        worstDayProductivity = data.productivity;
      }
    });

    let worstMonth = 'January';
    let worstMonthProductivity = 100;
    
    Object.entries(this.optimalTimeProfile.seasonalPattern).forEach(([month, data]) => {
      if (data.confidence > 20 && data.productivity < worstMonthProductivity) {
        worstMonth = month;
        worstMonthProductivity = data.productivity;
      }
    });

    this.optimalTimeProfile.peakPerformance = {
      bestHour,
      bestDay,
      bestMonth,
      peakProductivity: bestProductivity,
      peakFocus: this.optimalTimeProfile.dailyPattern[bestHour]?.focus || 50,
      peakRetention: this.optimalTimeProfile.dailyPattern[bestHour]?.retention || 50
    };

    this.optimalTimeProfile.lowPerformance = {
      worstHour,
      worstDay,
      worstMonth,
      lowProductivity: worstProductivity,
      lowFocus: this.optimalTimeProfile.dailyPattern[worstHour]?.focus || 50,
      lowRetention: this.optimalTimeProfile.dailyPattern[worstHour]?.retention || 50
    };
  }

  private updateOptimalConditions(): void {
    if (!this.optimalTimeProfile) return;

    // Analyze session lengths
    const sessionLengths = this.timeAnalysisData.map(d => d.duration);
    const avgSessionLength = sessionLengths.reduce((sum, len) => sum + len, 0) / sessionLengths.length;

    // Analyze break patterns (this would need more detailed data)
    const breakFrequency = 1; // Default
    const breakDuration = 10; // Default

    // Analyze environment factors
    const environmentFactors: string[] = [];
    const avgNoise = this.timeAnalysisData.reduce((sum, d) => sum + d.environment.noiseLevel, 0) / this.timeAnalysisData.length;
    const avgLighting = this.timeAnalysisData.reduce((sum, d) => sum + d.environment.lighting, 0) / this.timeAnalysisData.length;
    const avgTemperature = this.timeAnalysisData.reduce((sum, d) => sum + d.environment.temperature, 0) / this.timeAnalysisData.length;

    if (avgNoise < 4) environmentFactors.push('quiet');
    if (avgLighting > 6) environmentFactors.push('good lighting');
    if (avgTemperature >= 4 && avgTemperature <= 6) environmentFactors.push('comfortable temperature');

    this.optimalTimeProfile.optimalConditions = {
      sessionLength: Math.round(avgSessionLength),
      breakFrequency,
      breakDuration,
      environmentFactors
    };
  }

  private analyzeCircadianRhythm(): void {
    if (!this.optimalTimeProfile) return;

    // Calculate energy levels based on productivity and focus
    for (let hour = 0; hour < 24; hour++) {
      const hourData = this.optimalTimeProfile.dailyPattern[hour];
      if (hourData && hourData.confidence > 30) {
        // Energy level is average of productivity and focus
        this.optimalTimeProfile.circadianRhythm.energyLevels[hour] = 
          Math.round((hourData.productivity + hourData.focus) / 2);
      }
    }

    // Determine chronotype
    const morningEnergy = this.calculateAverageEnergy(6, 12);
    const eveningEnergy = this.calculateAverageEnergy(18, 24);
    
    if (morningEnergy > eveningEnergy + 10) {
      this.optimalTimeProfile.circadianRhythm.chronotype = 'morning';
    } else if (eveningEnergy > morningEnergy + 10) {
      this.optimalTimeProfile.circadianRhythm.chronotype = 'evening';
    } else {
      this.optimalTimeProfile.circadianRhythm.chronotype = 'intermediate';
    }

    // Find alertness peak and trough
    let peakHour = 14;
    let peakEnergy = 0;
    let troughHour = 2;
    let troughEnergy = 100;

    for (let hour = 0; hour < 24; hour++) {
      const energy = this.optimalTimeProfile.circadianRhythm.energyLevels[hour];
      if (energy > peakEnergy) {
        peakHour = hour;
        peakEnergy = energy;
      }
      if (energy < troughEnergy) {
        troughHour = hour;
        troughEnergy = energy;
      }
    }

    this.optimalTimeProfile.circadianRhythm.alertnessPeak = peakHour;
    this.optimalTimeProfile.circadianRhythm.alertnessTrough = troughHour;
  }

  private calculateAverageEnergy(startHour: number, endHour: number): number {
    if (!this.optimalTimeProfile) return 50;

    let totalEnergy = 0;
    let count = 0;

    for (let hour = startHour; hour < endHour; hour++) {
      const energy = this.optimalTimeProfile.circadianRhythm.energyLevels[hour];
      if (energy > 0) {
        totalEnergy += energy;
        count++;
      }
    }

    return count > 0 ? totalEnergy / count : 50;
  }

  // Generate time-based recommendations
  generateTimeRecommendations(): TimeBasedRecommendation[] {
    if (!this.optimalTimeProfile) return [];

    const recommendations: TimeBasedRecommendation[] = [];

    // Peak time recommendation
    const { peakPerformance } = this.optimalTimeProfile;
    if (peakPerformance.peakProductivity > 70) {
      recommendations.push({
        id: 'peak-time-study',
        type: 'schedule',
        priority: 'high',
        title: 'Schedule Study During Peak Hours',
        description: `Study during your most productive time: ${this.formatHour(peakPerformance.bestHour)} on ${peakPerformance.bestDay}s.`,
        reasoning: `Your productivity is ${peakPerformance.peakProductivity}% during this time, significantly higher than other periods.`,
        optimalTime: {
          hour: peakPerformance.bestHour,
          dayOfWeek: peakPerformance.bestDay
        },
        implementation: {
          steps: [
            'Block out study time during peak hours',
            'Schedule challenging subjects during this time',
            'Avoid scheduling breaks or distractions',
            'Prepare study materials in advance'
          ],
          timing: `${this.formatHour(peakPerformance.bestHour)} on ${peakPerformance.bestDay}s`,
          frequency: 'Daily',
          duration: '2-3 hours'
        },
        expectedBenefits: ['Higher productivity', 'Better focus', 'Improved retention', 'Faster learning'],
        confidence: Math.min(100, peakPerformance.peakProductivity),
        timestamp: new Date()
      });
    }

    // Avoid low performance times
    const { lowPerformance } = this.optimalTimeProfile;
    if (lowPerformance.lowProductivity < 40) {
      recommendations.push({
        id: 'avoid-low-time',
        type: 'timing',
        priority: 'medium',
        title: 'Avoid Study During Low Performance Hours',
        description: `Avoid studying during ${this.formatHour(lowPerformance.worstHour)} on ${lowPerformance.worstDay}s when productivity is low.`,
        reasoning: `Your productivity drops to ${lowPerformance.lowProductivity}% during this time, making it inefficient for learning.`,
        optimalTime: {
          hour: lowPerformance.worstHour,
          dayOfWeek: lowPerformance.worstDay
        },
        implementation: {
          steps: [
            'Schedule breaks or leisure activities during low performance times',
            'Use this time for light review or organization',
            'Avoid starting new topics during this period',
            'Consider taking a nap or light exercise'
          ],
          timing: `${this.formatHour(lowPerformance.worstHour)} on ${lowPerformance.worstDay}s`,
          frequency: 'As needed',
          duration: '1-2 hours'
        },
        expectedBenefits: ['Better time utilization', 'Reduced frustration', 'Improved overall efficiency'],
        confidence: 100 - lowPerformance.lowProductivity,
        timestamp: new Date()
      });
    }

    // Optimal session length recommendation
    const { optimalConditions } = this.optimalTimeProfile;
    if (optimalConditions.sessionLength > 0) {
      recommendations.push({
        id: 'optimal-session-length',
        type: 'session',
        priority: 'medium',
        title: 'Optimize Study Session Length',
        description: `Use ${optimalConditions.sessionLength}-minute study sessions for optimal focus and retention.`,
        reasoning: `Your performance data shows optimal results with ${optimalConditions.sessionLength}-minute sessions.`,
        optimalTime: {},
        implementation: {
          steps: [
            'Set a timer for study sessions',
            'Take breaks every 45-60 minutes',
            'Use Pomodoro technique if helpful',
            'Adjust session length based on subject difficulty'
          ],
          timing: 'During all study sessions',
          frequency: 'Daily',
          duration: `${optimalConditions.sessionLength} minutes`
        },
        expectedBenefits: ['Better focus', 'Reduced fatigue', 'Improved retention', 'More consistent performance'],
        confidence: 80,
        timestamp: new Date()
      });
    }

    // Circadian rhythm recommendation
    const { circadianRhythm } = this.optimalTimeProfile;
    if (circadianRhythm.chronotype !== 'unknown') {
      recommendations.push({
        id: 'circadian-rhythm',
        type: 'schedule',
        priority: 'high',
        title: `Optimize Schedule for ${circadianRhythm.chronotype} Chronotype`,
        description: `You're a ${circadianRhythm.chronotype} person. Schedule demanding tasks during your natural energy peaks.`,
        reasoning: `Your circadian rhythm shows you're naturally more alert during ${circadianRhythm.chronotype} hours.`,
        optimalTime: {
          hour: circadianRhythm.alertnessPeak
        },
        implementation: {
          steps: [
            'Schedule challenging subjects during peak alertness',
            'Use low-energy periods for review and organization',
            'Maintain consistent sleep schedule',
            'Avoid caffeine during low-energy periods'
          ],
          timing: `${this.formatHour(circadianRhythm.alertnessPeak)} - Peak alertness`,
          frequency: 'Daily',
          duration: '2-4 hours'
        },
        expectedBenefits: ['Better focus', 'Improved mood', 'Higher productivity', 'Better sleep quality'],
        confidence: 85,
        timestamp: new Date()
      });
    }

    return recommendations;
  }

  private formatHour(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  }

  // Public methods
  getOptimalTimeProfile(): OptimalTimeProfile | null {
    return this.optimalTimeProfile;
  }

  getTimeRecommendations(): TimeBasedRecommendation[] {
    return this.generateTimeRecommendations();
  }

  // Check if current time is optimal for studying
  isOptimalStudyTime(): { isOptimal: boolean; reason: string; confidence: number } {
    if (!this.optimalTimeProfile) {
      return { isOptimal: false, reason: 'Insufficient data', confidence: 0 };
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    
    const hourData = this.optimalTimeProfile.dailyPattern[currentHour];
    const dayData = this.optimalTimeProfile.weeklyPattern[currentDay];
    
    if (!hourData || hourData.confidence < 30) {
      return { isOptimal: false, reason: 'Insufficient hourly data', confidence: 0 };
    }

    const isOptimalHour = hourData.productivity > 70;
    const isOptimalDay = dayData && dayData.productivity > 60;
    
    let reason = '';
    let confidence = hourData.confidence;
    
    if (isOptimalHour && isOptimalDay) {
      reason = `Great time to study! Your productivity is ${hourData.productivity}% at this hour and ${dayData.productivity}% on ${currentDay}s.`;
      confidence = Math.min(100, (hourData.confidence + (dayData?.confidence || 0)) / 2);
    } else if (isOptimalHour) {
      reason = `Good time to study! Your productivity is ${hourData.productivity}% at this hour.`;
    } else if (isOptimalDay) {
      reason = `${currentDay} is a productive day for you (${dayData.productivity}% productivity).`;
      confidence = dayData.confidence;
    } else {
      reason = `This isn't your most productive time. Consider studying during ${this.formatHour(this.optimalTimeProfile.peakPerformance.bestHour)} instead.`;
      confidence = 100 - hourData.productivity;
    }

    return {
      isOptimal: isOptimalHour || isOptimalDay,
      reason,
      confidence
    };
  }

  // Save data to localStorage
  private saveOptimalTimeProfile(): void {
    localStorage.setItem('optimalTimeProfile', JSON.stringify(this.optimalTimeProfile));
  }

  private saveTimeAnalysisData(): void {
    localStorage.setItem('timeAnalysisData', JSON.stringify(this.timeAnalysisData));
  }
}

export const optimalTimeDetection = new OptimalTimeDetection();
