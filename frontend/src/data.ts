import { FormulaCard, VocabularyWord, PuzzleChallenge, MockTest, Achievement, Habit } from './types';

export const INITIAL_FORMULAS: FormulaCard[] = [
  {
    title: 'Percentage Calculations',
    category: 'Quant - Basics',
    formula: 'x% of y = (x * y) / 100',
    description: 'Crucial for dynamic fraction conversion. e.g., 37.5% = 3/8, 62.5% = 5/8, 87.5% = 7/8.',
    example: 'Calculate 37.5% of 640: 640 * (3 / 8) = 80 * 3 = 240.'
  },
  {
    title: 'Compound Interest (Half-Yearly)',
    category: 'Quant - Arithmetic',
    formula: 'Amount = P * (1 + (R / 2) / 100)^(2n)',
    description: 'When interest is compounded semi-annually, rate is halved (R/2) and time is doubled (2n).',
    example: 'P = $10,000, R = 10% p.a., n = 1 year. Amount = 10000 * (1.05)^2 = $11,025.'
  },
  {
    title: 'Profit & Loss (Markup)',
    category: 'Quant - Arithmetic',
    formula: 'Markup% = [(Marked Price - Cost Price) / CP] * 100',
    description: 'Marked Price (MP) is set above CP. Selling Price (SP) = MP * (100 - Discount%) / 100.',
    example: 'CP = 200, Markup = 40%, MP = 280. If SP = 252, Discount = [(280 - 252) / 280] * 100 = 10%.'
  },
  {
    title: 'Quadratic Equations Speed Rule',
    category: 'Quant - Algebra',
    formula: 'If ax² + bx + c = 0, Roots product = c/a, Roots sum = -b/a',
    description: 'Use the sign method: If (+, +) signs for b & c, roots are (-, -). If (-, +), roots are (+, +).',
    example: 'x² - 5x + 6 = 0: b is -5, c is 6. Roots signs are (+, +). Factors of 6 summing to 5 are 2 and 3.'
  },
  {
    title: 'Time & Work (Efficiency)',
    category: 'Quant - Arithmetic',
    formula: 'Worker A Efficiency : Worker B Efficiency = Time B : Time A',
    description: 'Total Work = Number of Days * Efficiency. If A completes in 10 days and B in 15 days, Work = 30 units.',
    example: 'Efficiency of A = 3 units/day, Efficiency of B = 2 units/day. Combined time = 30 / (3+2) = 6 days.'
  }
];

export const INITIAL_VOCABULARY: VocabularyWord[] = [
  {
    word: 'Solvency',
    meaning: 'The possession of assets excess of liabilities; ability to pay one\'s financial debts.',
    example: 'The central bank monitored the commercial entity to maintain strict solvency ratios.',
    synonyms: ['Financial stability', 'Liquidity', 'Creditworthiness'],
    antonyms: ['Bankruptcy', 'Insolvency', 'Indebtedness'],
    difficulty: 'Medium'
  },
  {
    word: 'Acquiesce',
    meaning: 'Accept something reluctantly but without protest.',
    example: 'The board was forced to acquiesce to the demanding regulatory requirements.',
    synonyms: ['Consent', 'Accept', 'Comply'],
    antonyms: ['Forbid', 'Protest', 'Dissent'],
    difficulty: 'Hard'
  },
  {
    word: 'Anomalous',
    meaning: 'Deviating from what is standard, normal, or expected.',
    example: 'The audited ledger revealed anomalous transactions in the corporate checking account.',
    synonyms: ['Atypical', 'Irregular', 'Abnormal'],
    antonyms: ['Normal', 'Consistent', 'Standard'],
    difficulty: 'Medium'
  },
  {
    word: 'Leverage',
    meaning: 'Use borrowed capital or financial assets to increase the potential return of an investment.',
    example: 'High leverage can amplify both returns and risk for capital-backed operations.',
    synonyms: ['Influence', 'Capitalize', 'Exploit'],
    antonyms: ['Weakness', 'Under-leverage', 'Inaction'],
    difficulty: 'Easy'
  },
  {
    word: 'Pecuniary',
    meaning: 'Relating to or consisting of money.',
    example: 'The bank offer contained peculiar provisions with direct pecuniary benefits for depositors.',
    synonyms: ['Monetary', 'Financial', 'Fiscal'],
    antonyms: ['Non-financial', 'Spiritual', 'Moral'],
    difficulty: 'Hard'
  },
  {
    word: 'Reconcile',
    meaning: 'Compare or adjust financial accounts to make aggregate balances correct.',
    example: 'At the end of every fiscal day, tellers must reconcile outstanding general ledgers.',
    synonyms: ['Settle', 'Resolve', 'Harmonize'],
    antonyms: ['Estrange', 'Agitate', 'Mismatch'],
    difficulty: 'Easy'
  },
  {
    word: 'Austerity',
    meaning: 'Difficult economic conditions created by government measures to reduce public spending.',
    example: 'The national credit crisis led to austerity policies that restricted banking liquid reserves.',
    synonyms: ['Frugality', 'Stringency', 'Hardship'],
    antonyms: ['Extravagance', 'Spending', 'Affluence'],
    difficulty: 'Medium'
  }
];

export const INITIAL_PUZZLES: PuzzleChallenge[] = [
  {
    title: 'Seating Arrangement (Circular Face-In)',
    description: 'Eight bank officers (A, B, C, D, E, F, G, H) sit around a circular conference table facing the center.',
    category: 'Circular Arrangement',
    dataPoints: [
      'C is sitting third to the left of F.',
      'Only one person sits between F and H.',
      'A sits second to the right of H.',
      'B is an immediate neighbor of neither C nor H.',
      'G sits second to the left of E, who is not adjacent to C or H.'
    ],
    questions: [
      {
        question: 'Who sits exactly opposite to F?',
        options: ['A', 'B', 'D', 'G'],
        correctIndex: 1, // B
        explanation: 'By plotting the circular positions (1 to 8 clockwise): Let F be at 1. C is 3rd to the left of F, so C sits at 4. One person sits between F and H, so H is at 7 (or 3). If H is at 7, A sits 2nd to the right of H, mapping A to 1 (occupied) or if H was at 3, A is at 5. Solved layout gives F at 1, H at 3, A at 5, C at 4, E at 2, G at 8, B at 6, and D at 7. Opposite of F is B (pos 5/6 opposite).'
      },
      {
        question: 'What is the position of D with respect to A?',
        options: ['Second to the right', 'Immediate left', 'Immediate right', 'Third to the left'],
        correctIndex: 2, // Immediate right
        explanation: 'From the solved circular configurations, A sits at position 5 and D sits at position 6 (moving anticlockwise). Hence, D is to the immediate right of A.'
      }
    ]
  },
  {
    title: 'Floor Puzzle (SBI PO Style)',
    description: 'Five PO candidates (Pranav, Rahul, Sam, Tina, Vivek) live on five different floors of a bank corporate guest house (numbered 1 to 5, where 1 is the bottom floor).',
    category: 'Floor Puzzle',
    dataPoints: [
      'Sam lives on an odd-numbered floor.',
      'Tina lives immediately above Sam.',
      'Only two people live between Tina and Pranav.',
      'Rahul lives on a floor below Vivek.'
    ],
    questions: [
      {
        question: 'Who lives on the top-most floor (Floor 5)?',
        options: ['Vivek', 'Pranav', 'Sam', 'Tina'],
        correctIndex: 0, // Vivek
        explanation: 'Let\'s analyze: Sam is on odd floor (1, 3, or 5). Tina is immediately above Sam, so Sam can\'t be on 5. If Sam is on 3, Tina is on 4. Two people live between Tina and Pranav, placing Pranav on 1. Rahul is below Vivek, leaving Rahul on 2 and Vivek on 5. Layout matches all statements perfectly!'
      }
    ]
  }
];

export const INITIAL_MOCK_TESTS: MockTest[] = [
  {
    id: 'test-1',
    title: 'IBPS PO Prelims - Full Mock Test 1',
    type: 'Full-Length',
    durationMinutes: 60,
    totalQuestions: 15,
    sections: [
      {
        name: 'Quant',
        questionsCount: 5,
        durationMinutes: 20,
        questions: [
          {
            id: 'q-quant-1',
            question: 'What is the value of 45% of 800 + 12.5% of 1600 - 35% of 400?',
            options: ['340', '420', '480', '520'],
            correctIndex: 1, // 420
            explanation: '420. Explain: 45% of 800 = 360. 12.5% of 1600 = (1/8)*1600 = 200. 35% of 400 = 140. Thus, 360 + 200 - 140 = 420.'
          },
          {
            id: 'q-quant-2',
            question: 'If the price of banking training resources decreases by 20%, by what percent must an aspirant increase their consumption so that the total budget remains unchanged?',
            options: ['20%', '25%', '33.33%', '16.67%'],
            correctIndex: 1, // 25%
            explanation: '25%. Let initial budget be 100. New price is 80. To return to 100 expenditure, we need to add 20 units over 80. (20/80)*100 = 25%.'
          },
          {
            id: 'q-quant-3',
            question: 'Find the odd number in the given series: 121, 144, 169, 196, 222, 256',
            options: ['144', '196', '222', '256'],
            correctIndex: 2, // 222
            explanation: 'The numbers are squares: 11²=121, 12²=144, 13²=169, 14²=196, 15²=225 (not 222), 16²=256.'
          },
          {
            id: 'q-quant-4',
            question: 'Two pipes A and B can fill an investment system tank in 12 min and 18 min respectively. In how many minutes will the tank be full if both pipes are opened together?',
            options: ['7.2 min', '6.8 min', '8.4 min', '9 min'],
            correctIndex: 0, // 7.2
            explanation: 'Combined efficiency: 1/12 + 1/18 = (3+2)/36 = 5/36. Time = 36/5 = 7.2 minutes.'
          },
          {
            id: 'q-quant-5',
            question: 'Solve for x: x² - 14x + 48 = 0.',
            options: ['6, 8', '-6, -8', '4, 12', '-4, -12'],
            correctIndex: 0, // 6, 8
            explanation: 'x² - 14x + 48 = 0 is factored as (x-6)(x-8) = 0. Therefore, roots are 6 and 8.'
          }
        ]
      },
      {
        name: 'Reasoning',
        questionsCount: 5,
        durationMinutes: 20,
        questions: [
          {
            id: 'q-reas-1',
            question: 'In a certain banking code, "INTEREST" is written as "JNTEREST". How is "SAVINGS" written in that same code?',
            options: ['TAVINGS', 'SBTINGS', 'UAVINGS', 'SBVINGS'],
            correctIndex: 0, // TAVINGS
            explanation: 'The code increases the exact first letter by +1 (I -> J), and keeps everything else constant. SAVINGS becomes TAVINGS.'
          },
          {
            id: 'q-reas-2',
            question: 'Point P is 5 meters north of Point Q. Point R is 12 meters east of Point P. What is the shortest distance between Point Q and Point R?',
            options: ['17m', '13m', '15m', '10m'],
            correctIndex: 1, // 13m
            explanation: 'By Pythagoras theorem, distance² = 5² + 12² = 25 + 144 = 169. Shortest distance = √169 = 13 meters.'
          },
          {
            id: 'q-reas-3',
            question: 'Statement: Some banks are digital. All digital platforms are fast. Conclusion I: Some banks are fast. Conclusion II: Some fast platforms are banks.',
            options: ['Only I follows', 'Only II follows', 'Both I and II follow', 'Neither follows'],
            correctIndex: 2, // Both
            explanation: 'Since "Some banks are digital" and "All digital are fast", the intersection of banks and digital platforms must be fast. Thus, some banks are fast, and some fast platforms are banks.'
          },
          {
            id: 'q-reas-4',
            question: 'A is the brother of B. B is the daughter of C. D is the father of C. How is A related to D?',
            options: ['Grandson', 'Son', 'Nephew', 'Brother'],
            correctIndex: 0, // Grandson
            explanation: 'A and B are siblings. Since B is the daughter of C, A is C\'s son. D is C\'s father, making A the grandson of D.'
          },
          {
            id: 'q-reas-5',
            question: 'If inequality P > Q >= R = S is true, which of the following is definitely FALSE?',
            options: ['P > R', 'P > S', 'S > Q', 'R = S'],
            correctIndex: 2, // S > Q
            explanation: 'Since Q >= R = S, we have Q >= S. Therefore, S > Q is definitely false as S must be less than or equal to Q.'
          }
        ]
      },
      {
        name: 'English',
        questionsCount: 5,
        durationMinutes: 20,
        questions: [
          {
            id: 'q-eng-1',
            question: 'Select the word which is most nearly the opposite of the word "SOLVENT" in a banking context.',
            options: ['Liquid', 'Bankrupt', 'Profitable', 'Collateralized'],
            correctIndex: 1, // Bankrupt
            explanation: 'Solvent means having assets to meet liabilities. Bankrupt is the exact opposite.'
          },
          {
            id: 'q-eng-2',
            question: 'Identify the error in the sentence: "Each of the potential candidates are required to upload their exam receipts before Thursday."',
            options: ['Each of', 'potential candidates', 'are required', 'their exam receipts'],
            correctIndex: 2, // are required (should be "is required")
            explanation: '"Each" is a singular pronoun and dictates the singular verb "is required", not the plural "are required".'
          },
          {
            id: 'q-eng-3',
            question: 'Choose the correct preposition: "The commercial bank was charged ________ violating standard lending protocols."',
            options: ['with', 'for', 'of', 'by'],
            correctIndex: 0, // with
            explanation: 'The standard idiomatic phrasing is "charged with" a violation or offense.'
          },
          {
            id: 'q-eng-4',
            question: 'Fill in the blank: "A ________ increase in regulatory requirements has caused banks to augment basic security measures."',
            options: ['negligible', 'substantial', 'trivial', 'frivolous'],
            correctIndex: 1, // substantial
            explanation: '"Substantial" is the correct logical choice as it matches the effect of requiring banks to augment security.'
          },
          {
            id: 'q-eng-5',
            question: 'Rearrange simple fragments [P: the interest rates], [Q: did not change], [R: despite inflation]:',
            options: ['P-Q-R', 'Q-P-R', 'R-P-Q', 'P-R-Q'],
            correctIndex: 0, // P-Q-R
            explanation: 'P-Q-R reads smoothly: "The interest rates did not change despite inflation."'
          }
        ]
      }
    ]
  },
  {
    id: 'test-2',
    title: 'SBI PO Quantitative - Sectional Drill',
    type: 'Sectional',
    subject: 'Quant',
    durationMinutes: 20,
    totalQuestions: 5,
    sections: [
      {
        name: 'Quant',
        questionsCount: 5,
        durationMinutes: 20,
        questions: [
          {
            id: 'sbi-q-1',
            question: 'If log(x) + log(x-3) = log(4), find x.',
            options: ['4', '1', '-1', '5'],
            correctIndex: 0, // 4
            explanation: 'log(x * (x-3)) = log(4) implies x² - 3x - 4 = 0. Roots are 4 and -1. Since log acts on positive inputs only, x must be 4.'
          },
          {
            id: 'sbi-q-2',
            question: 'Siddharth invests $5000 in a fixed savings plan offering 10% computed annually. What is the total interest accrued over 2 years?',
            options: ['1000', '1050', '1100', '1200'],
            correctIndex: 1, // 1050
            explanation: 'Amount = 5000 * (1.10)^2 = 5000 * 1.21 = 6050. Interest accrued = 6050 - 5000 = 1050.'
          },
          {
            id: 'sbi-q-3',
            question: 'Solve: √441 + √729 = x',
            options: ['45', '48', '50', '42'],
            correctIndex: 1, // 48
            explanation: '√441 = 21 and √729 = 27. So 21 + 27 = 48.'
          },
          {
            id: 'sbi-q-4',
            question: 'The ratio of speed of boat in still water to speed of stream is 5:1. If it takes 4 hours for the boat to travel 48 km downstream, find stream speed.',
            options: ['2 km/h', '3 km/h', '1.5 km/h', '4 km/h'],
            correctIndex: 0, // 2 km/h
            explanation: 'Downstream speed = 48 / 4 = 12 km/h. Let still water speed be 5y, stream speed y. Downstream speed = 6y = 12, so y = 2 km/h.'
          },
          {
            id: 'sbi-q-5',
            question: 'By selling a ledger calculator for $150, a clerk gains 25%. What is the actual CP of the ledger calculator?',
            options: ['110', '125', '120', '130'],
            correctIndex: 2, // 120
            explanation: 'SP = 1.25 CP = 150. CP = 150 / 1.25 = 120.'
          }
        ]
      }
    ]
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-streak-3',
    title: 'Consistent Banker',
    description: 'Reach a 3-day study streak',
    xpValue: 150,
    iconName: 'Flame',
    category: 'Streak'
  },
  {
    id: 'ach-math-expert',
    title: 'Simplification Sage',
    description: 'Succeed in a perfect Speed Math round',
    xpValue: 200,
    iconName: 'Calculator',
    category: 'Practice'
  },
  {
    id: 'ach-mock-pioneer',
    title: 'Trial of Fire',
    description: 'Complete your first Full-Length Mock Test',
    xpValue: 300,
    iconName: 'Award',
    category: 'Mock'
  },
  {
    id: 'ach-level-PO',
    title: 'Officer Status',
    description: 'Advance your expertise level to Probationary Officer',
    xpValue: 500,
    iconName: 'TrendingUp',
    category: 'Levels'
  },
  {
    id: 'ach-vocab-master',
    title: 'Lexicon Legend',
    description: 'Review 10 Vocabulary flashcards completely',
    xpValue: 150,
    iconName: 'BookOpen',
    category: 'Practice'
  }
];

export const INITIAL_HABITS: Habit[] = [
  { id: 'h-1', name: 'Solve 10 Speed Math & Simplification equations', subject: 'Quant', type: 'Practice', durationMinutes: 15, completedDates: [] },
  { id: 'h-2', name: 'Read Financial Times / Business Standard Editorial section', subject: 'English', type: 'Revision', durationMinutes: 30, completedDates: [] },
  { id: 'h-3', name: 'Sketch 2 Circular Conference Seating layouts', subject: 'Reasoning', type: 'Practice', durationMinutes: 20, completedDates: [] },
  { id: 'h-4', name: 'Review 5 Bank Terminology Flashcards', subject: 'English', type: 'Revision', durationMinutes: 15, completedDates: [] },
  { id: 'h-5', name: 'Memorize 3 Quadratic Equation Root Rules', subject: 'Quant', type: 'Revision', durationMinutes: 15, completedDates: [] }
];

