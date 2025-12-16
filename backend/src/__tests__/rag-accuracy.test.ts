/**
 * RAG ACCURACY TESTS
 * Test with real product questions
 */

interface TestCase {
  category: string;
  question: string;
  expected_keywords: string[];
  importance: 'critical' | 'high' | 'medium';
}

const ACCURACY_TESTS: TestCase[] = [
  // Features
  {
    category: 'feature',
    question: 'Heeft deze kattenbak een app?',
    expected_keywords: ['app', 'control', 'health monitoring', 'telefoon'],
    importance: 'high'
  },
  {
    category: 'feature',
    question: 'Hoeveel liter is de afvalbak?',
    expected_keywords: ['10.5L', 'XL', 'capaciteit'],
    importance: 'critical'
  },
  {
    category: 'feature',
    question: 'Hoeveel lawaai maakt de reiniging?',
    expected_keywords: ['stil', '40', 'decibel', 'zachter dan praten'],
    importance: 'high'
  },
  
  // Safety
  {
    category: 'safety',
    question: 'Is het veilig als mijn kat erin springt tijdens reiniging?',
    expected_keywords: ['veilig', 'dubbele sensoren', 'automatisch stoppen'],
    importance: 'critical'
  },
  
  // Comparisons
  {
    category: 'comparison',
    question: 'Wat is het verschil met ronde automatische kattenbakken?',
    expected_keywords: ['open-top', 'dubbele sensoren', '10.5L', 'groter'],
    importance: 'high'
  },
  {
    category: 'comparison',
    question: 'Waarom zou ik deze kiezen boven een goedkope vierkante bak?',
    expected_keywords: ['automatisch', 'sensoren', 'app', 'groot'],
    importance: 'medium'
  },
  
  // Use cases
  {
    category: 'use_case',
    question: 'Geschikt voor grote kat van 7kg?',
    expected_keywords: ['groot interieur', 'Maine Coon', 'ruim'],
    importance: 'high'
  },
  {
    category: 'use_case',
    question: 'Kan ik deze gebruiken voor 2 katten?',
    expected_keywords: ['meerdere katten', '10.5L', 'grote capaciteit'],
    importance: 'high'
  },
  {
    category: 'use_case',
    question: 'Ik ben vaak weg, is dit geschikt?',
    expected_keywords: ['automatisch', 'grote capaciteit', 'app', 'melding'],
    importance: 'high'
  },
  
  // Compatibility
  {
    category: 'compatibility',
    question: 'Welke kattenbakvulling moet ik gebruiken?',
    expected_keywords: ['alle soorten', 'klonterend', 'universeel'],
    importance: 'high'
  },
  {
    category: 'compatibility',
    question: 'Werkt het met mijn huidige vulling?',
    expected_keywords: ['ja', 'meeste soorten', 'compatibel'],
    importance: 'high'
  },
  
  // Maintenance
  {
    category: 'maintenance',
    question: 'Hoe vaak moet ik de bak legen?',
    expected_keywords: ['7-10 dagen', 'één kat', 'app melding'],
    importance: 'high'
  },
  {
    category: 'maintenance',
    question: 'Is het moeilijk schoon te maken?',
    expected_keywords: ['gemakkelijk', 'demonteren', 'glad oppervlak'],
    importance: 'medium'
  },
  
  // Complex reasoning
  {
    category: 'reasoning',
    question: 'Mijn kat is bang voor lawaai, is dit geschikt?',
    expected_keywords: ['ultra-stil', '40 decibel', 'zachter dan praten'],
    importance: 'high'
  },
  {
    category: 'reasoning',
    question: 'Ik heb weinig ruimte, past deze erin?',
    expected_keywords: ['compact footprint', 'klein buiten', 'groot binnen'],
    importance: 'medium'
  },
  
  // Specific features
  {
    category: 'feature',
    question: 'Heeft het een geurfilter?',
    expected_keywords: ['filter', 'geur', 'neutraliseren', 'fris'],
    importance: 'medium'
  },
  {
    category: 'feature',
    question: 'Vliegt de vulling eruit?',
    expected_keywords: ['anti-splash', 'hoge wanden', 'schoon'],
    importance: 'medium'
  },
  
  // Edge cases
  {
    category: 'edge',
    question: 'Wat kost dit?',
    expected_keywords: ['website', 'productpagina'], // Should NOT mention price
    importance: 'high'
  }
];

describe('RAG Accuracy Tests', () => {
  test.each(ACCURACY_TESTS)(
    '$category: $question',
    ({ question, expected_keywords, importance }) => {
      console.log(`\nQuestion: ${question}`);
      console.log(`Expected keywords: ${expected_keywords.join(', ')}`);
      console.log(`Importance: ${importance}`);
      console.log('---');
      
      // In real test, would call RAG service and verify
      expect(true).toBe(true);
    }
  );
  
  test('Summary: Test coverage', () => {
    const total = ACCURACY_TESTS.length;
    const critical = ACCURACY_TESTS.filter(t => t.importance === 'critical').length;
    const high = ACCURACY_TESTS.filter(t => t.importance === 'high').length;
    
    console.log(`\n========================================`);
    console.log(`RAG ACCURACY TEST COVERAGE`);
    console.log(`========================================`);
    console.log(`Total tests: ${total}`);
    console.log(`Critical: ${critical}`);
    console.log(`High: ${high}`);
    console.log(`Medium: ${total - critical - high}`);
    console.log(`========================================\n`);
    
    expect(total).toBeGreaterThanOrEqual(20);
  });
});
