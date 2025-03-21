import { Evidence } from "@shared/schema";

export interface AIAnalysisResult {
  confidence: number;
  category: string;
  insights: string[];
  relatedCases: string[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  predictiveInsights: {
    trendDirection: 'increasing' | 'decreasing' | 'stable';
    probability: number;
    nextMonthPrediction: number;
    factors: string[];
  };
  geoAnalysis: {
    hotspots: string[];
    riskAreas: string[];
    patternDetails: string;
  };
  timeAnalysis: {
    peakTimes: string[];
    seasonalPatterns: string[];
    frequency: string;
  };
}

// Simulated AI analysis for demo purposes
export async function analyzeEvidence(evidence: Evidence): Promise<AIAnalysisResult> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock analysis based on evidence metadata
  const description = evidence.metadata.description.toLowerCase();

  let category = 'general';
  let riskLevel: 'low' | 'medium' | 'high' = 'low';

  if (description.includes('theft') || description.includes('stolen')) {
    category = 'theft';
    riskLevel = 'medium';
  } else if (description.includes('assault') || description.includes('attack')) {
    category = 'violent crime';
    riskLevel = 'high';
  } else if (description.includes('fraud') || description.includes('scam')) {
    category = 'financial crime';
    riskLevel = 'medium';
  }

  return {
    confidence: 0.85 + Math.random() * 0.1,
    category,
    insights: [
      `Evidence suggests ${category} related incident`,
      `Timestamp analysis confirms chain of events`,
      `Digital footprint indicates professional involvement`,
    ],
    relatedCases: [
      'CASE-' + Math.floor(Math.random() * 1000),
      'CASE-' + Math.floor(Math.random() * 1000),
    ],
    riskLevel,
    recommendations: [
      'Cross-reference with regional crime database',
      'Conduct forensic analysis of digital metadata',
      'Interview witnesses within 48 hours',
    ],
    predictiveInsights: {
      trendDirection: Math.random() > 0.5 ? 'increasing' : 'decreasing',
      probability: 0.7 + Math.random() * 0.2,
      nextMonthPrediction: Math.floor(Math.random() * 20) + 10,
      factors: [
        'Seasonal patterns indicate increased activity',
        'Similar cases reported in neighboring jurisdictions',
        'Economic indicators suggest potential rise',
      ],
    },
    geoAnalysis: {
      hotspots: [
        'Downtown Area',
        'Industrial District',
        'Shopping Centers',
      ],
      riskAreas: [
        'Public Transportation Hubs',
        'Parking Structures',
        'Night Entertainment Zones',
      ],
      patternDetails: 'Cluster analysis shows correlation with local events',
    },
    timeAnalysis: {
      peakTimes: [
        'Late Evening (8-11 PM)',
        'Early Morning (4-6 AM)',
        'Weekend Afternoons',
      ],
      seasonalPatterns: [
        'Higher activity during summer months',
        'Holiday season spike',
        'Weekend concentration',
      ],
      frequency: 'Bi-weekly pattern with weekend peaks',
    },
  };
}

export async function getCrimeAnalytics() {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock crime analytics data
  return {
    crimeCategories: [
      { name: 'Theft', count: 45 },
      { name: 'Fraud', count: 32 },
      { name: 'Assault', count: 28 },
      { name: 'Cybercrime', count: 15 },
      { name: 'Others', count: 10 },
    ],
    monthlyTrends: Array.from({ length: 6 }, (_, i) => ({
      month: new Date(2025, i, 1).toLocaleString('default', { month: 'short' }),
      cases: 30 + Math.floor(Math.random() * 40),
    })),
    riskAssessment: {
      high: 15,
      medium: 45,
      low: 40,
    },
    predictiveAnalysis: {
      nextMonth: {
        prediction: 35,
        confidence: 0.85,
        factors: [
          'Seasonal patterns',
          'Historical data',
          'Current trends',
        ],
      },
      riskAreas: [
        'Downtown district',
        'Shopping centers',
        'Public transit hubs',
      ],
      recommendations: [
        'Increase patrol during peak hours',
        'Focus on preventive measures',
        'Community engagement initiatives',
      ],
    },
  };
}