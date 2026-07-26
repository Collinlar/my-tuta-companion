export interface WebSearchResult {
  title: string;
  url: string;
  description: string;
  type: 'video' | 'article' | 'pdf' | 'interactive' | 'course';
  source: string;
  duration?: string;
  thumbnail?: string;
  relevanceScore: number;
}

export interface EducationalResource {
  title: string;
  url: string;
  description: string;
  type: 'video' | 'article' | 'pdf' | 'interactive' | 'course';
  source: string;
  duration?: string;
  thumbnail?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  gradeLevel: string;
  subject: string;
  topic: string;
}

// Real search is coming soon — SerpAPI + YouTube Data API v3 integration pending.
// Until then these methods return an empty array so the UI can show an honest
// "No resources found yet" state instead of fabricated links.
class WebSearchService {
  async searchEducationalContent(
    _topic: string,
    _subject: string,
    _gradeLevel: string,
    _contentType: 'video' | 'article' | 'pdf' | 'all' = 'all'
  ): Promise<EducationalResource[]> {
    return [];
  }

  async searchGhanaEducationalContent(
    _topic: string,
    _subject: string,
    _gradeLevel: string
  ): Promise<EducationalResource[]> {
    return [];
  }
}

export const webSearchService = new WebSearchService();
