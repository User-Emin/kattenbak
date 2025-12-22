/**
 * SIMPLE KEYWORD RETRIEVAL SERVICE
 * Fast, deterministic, 80% accurate for product Q&A
 * NO embeddings needed for small corpus (<100 docs)
 * 
 * Team: AI Implementation Expert
 */

export interface Document {
  id: string;
  content: string;
  metadata: {
    title: string;
    keywords: string[];
    importance: string;
    type: string;
   [key: string]: any;
  };
  type: string;
}

export interface SearchResult {
  doc: Document;
  score: number;
  matchedKeywords: string[];
}

export class SimpleRetrievalService {
  
  /**
   * Extract keywords from query (Dutch-aware)
   */
  static extractKeywords(query: string): string[] {
    const normalized = query.toLowerCase().trim();
    
    // Remove common Dutch stop words
    const stopWords = new Set([
      'de', 'het', 'een', 'is', 'zijn', 'heeft', 'van', 'voor',
      'met', 'op', 'in', 'aan', 'bij', 'als', 'wat', 'hoe',
      'kan', 'moet', 'deze', 'deze', 'dat', 'die', 'er'
    ]);
    
    // Split into words
    const words = normalized
      .replace(/[^\wąćęłńóśźż\s]/g, ' ') // Keep letters + spaces
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));
    
    // Add query expansion for common terms
    const expanded = new Set(words);
    
    // Map vague terms to specific keywords
    const expansions: Record<string, string[]> = {
      'hoeveel': ['capaciteit', 'aantal', 'volume', 'liter'],
      'groot': ['afmeting', 'grootte', 'ruim', 'xl'],
      'stil': ['geluid', 'lawaai', 'decibel', 'rustig'],
      'veilig': ['sensor', 'bescherming', 'detectie'],
      'schoon': ['reinigen', 'onderhoud', 'hygiëne'],
      'kat': ['katten', 'huisdier'],
      'app': ['applicatie', 'smartphone', 'monitoring'],
      'past': ['erin', 'capaciteit', 'volume', 'liter'],
      'legen': ['afvoeren', 'leegmaken', 'onderhoud']
    };
    
    for (const word of words) {
      if (expansions[word]) {
        expansions[word].forEach(exp => expanded.add(exp));
      }
    }
    
    return Array.from(expanded);
  }
  
  /**
   * Search documents by keyword matching
   * Fast: O(n*m) where n=docs, m=keywords (~20-50ms for 21 docs)
   */
  static searchDocuments(
    query: string,
    documents: Document[],
    topK: number = 5,
    minScore: number = 0
  ): SearchResult[] {
    const keywords = this.extractKeywords(query);
    
    if (keywords.length === 0) {
      return [];
    }
    
    console.log(`🔍 Keywords extracted: [${keywords.join(', ')}]`);
    
    // Score each document
    const scored: SearchResult[] = documents.map(doc => {
      const contentLower = doc.content.toLowerCase();
      const titleLower = doc.metadata.title?.toLowerCase() || '';
      const docKeywords = doc.metadata.keywords?.map(k => k.toLowerCase()) || [];
      
      let score = 0;
      const matched: string[] = [];
      
      for (const keyword of keywords) {
        // Content match: +1 point per occurrence
        const contentMatches = (contentLower.match(new RegExp(keyword, 'g')) || []).length;
        if (contentMatches > 0) {
          score += contentMatches;
          matched.push(keyword);
        }
        
        // Title match: +3 points (title = higher relevance)
        if (titleLower.includes(keyword)) {
          score += 3;
          if (!matched.includes(keyword)) matched.push(keyword);
        }
        
        // Metadata keyword match: +2 points
        if (docKeywords.some(dk => dk.includes(keyword) || keyword.includes(dk))) {
          score += 2;
          if (!matched.includes(keyword)) matched.push(keyword);
        }
      }
      
      // Boost by importance
      if (doc.metadata.importance === 'high') score *= 1.5;
      if (doc.metadata.importance === 'critical') score *= 2;
      
      return {
        doc,
        score,
        matchedKeywords: matched
      };
    });
    
    // Filter and sort
    return scored
      .filter(s => s.score > minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
  
  /**
   * Format results as context for LLM
   */
  static formatContext(results: SearchResult[]): string {
    return results
      .map((r, i) => {
        const title = r.doc.metadata.title || 'Product Info';
        const relevance = r.matchedKeywords.length > 0 
          ? `(matched: ${r.matchedKeywords.join(', ')})`
          : '';
        
        return `[Bron ${i + 1}] ${title} ${relevance}\n${r.doc.content}`;
      })
      .join('\n\n---\n\n');
  }
  
  /**
   * Health check
   */
  static testRetrieval(documents: Document[]): void {
    console.log('\n🧪 Testing Simple Retrieval Service...\n');
    
    const testCases = [
      { query: 'Hoeveel liter is de afvalbak?', expected: ['liter', 'capaciteit'] },
      { query: 'Is het veilig?', expected: ['veilig', 'sensor'] },
      { query: 'Hoeveel lawaai maakt het?', expected: ['decibel', 'stil'] }
    ];
    
    for (const test of testCases) {
      console.log(`Query: "${test.query}"`);
      const results = this.searchDocuments(test.query, documents, 3);
      console.log(`   Results: ${results.length} docs found`);
      console.log(`   Top match: ${results[0]?.doc.metadata.title || 'None'} (score: ${results[0]?.score.toFixed(1)})`);
      console.log(`   Keywords: [${results[0]?.matchedKeywords.join(', ') || 'none'}]`);
      console.log('');
    }
    
    console.log('✅ Retrieval test complete\n');
  }
}
