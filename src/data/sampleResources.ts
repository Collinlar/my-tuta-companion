import { Task } from "@/types/task";
import { aiResourceService } from "@/services/aiResourceService";

// Function to enhance tasks with AI-generated resources
export async function enhanceTasksWithAIResources(tasks: Task[], originalNotes?: string): Promise<Task[]> {
  console.log('=== ENHANCING TASKS WITH AI RESOURCES ===');
  console.log('Number of tasks:', tasks.length);
  console.log('Original notes length:', originalNotes ? originalNotes.length : 'undefined');
  console.log('Original notes preview:', originalNotes ? originalNotes.substring(0, 200) + '...' : 'undefined');
  
  const enhancedTasks = await Promise.all(
    tasks.map(async task => {
      console.log(`Processing task ${task.id}: ${task.title} (type: ${task.type})`);
      
      // Generate AI resources for quiz, flashcard, and contest tasks
      if (['quiz', 'flashcard', 'contest'].includes(task.type)) {
        try {
          // Create a task with the original notes for AI generation
          const taskWithNotes = {
            ...task,
            originalNotes: originalNotes || task.description // Fallback to description if no original notes
          };
          
          console.log(`Generating AI resources for task ${task.id} with notes:`, originalNotes ? 'YES' : 'NO');
          const aiResources = await aiResourceService.generateTaskResources(taskWithNotes);
          
          return {
            ...task,
            resources: [...task.resources, ...aiResources]
          };
        } catch (error) {
          console.error('Error generating AI resources for task:', task.id, error);
          return task; // Return original task if AI generation fails
        }
      }
      return task;
    })
  );
  
  console.log('Enhanced tasks completed');
  return enhancedTasks;
}

// Sample resources for different subjects
export const physicsTasks: Task[] = [
  {
    id: 'p1',
    title: 'Understand Newton\'s First Law',
    description: 'Learn about inertia and the concept of objects at rest staying at rest',
    completed: false,
    timeEstimate: '25 min',
    type: 'reading',
    difficulty: 'beginner',
    learningObjectives: [
      'Define inertia',
      'Understand Newton\'s First Law',
      'Apply the law to real-world examples'
    ],
    resources: [
      {
        id: 'pr1',
        title: 'Newton\'s First Law - Physics Classroom',
        type: 'article',
        url: 'https://www.physicsclassroom.com/class/newtlaws/Lesson-1/Newton-s-First-Law',
        description: 'Comprehensive explanation with examples and diagrams',
        duration: '15 min',
        difficulty: 'beginner',
        source: 'Physics Classroom'
      },
      {
        id: 'pr2',
        title: 'Inertia Explained - YouTube',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=LEHR8YQNm_Q',
        description: 'Visual demonstration of inertia concepts',
        duration: '8 min',
        difficulty: 'beginner',
        source: 'YouTube - Veritasium'
      }
    ]
  }
];

export const chemistryTasks: Task[] = [
  {
    id: 'c1',
    title: 'Learn Periodic Table Trends',
    description: 'Understand how atomic properties change across periods and groups',
    completed: false,
    timeEstimate: '30 min',
    type: 'reading',
    difficulty: 'intermediate',
    learningObjectives: [
      'Identify periodic trends',
      'Explain atomic radius changes',
      'Understand electronegativity patterns'
    ],
    resources: [
      {
        id: 'cr1',
        title: 'Periodic Trends - Khan Academy',
        type: 'video',
        url: 'https://www.khanacademy.org/science/chemistry/periodic-table/periodic-table-trends',
        description: 'Step-by-step explanation of periodic trends',
        duration: '12 min',
        difficulty: 'intermediate',
        source: 'Khan Academy'
      },
      {
        id: 'cr2',
        title: 'Interactive Periodic Table',
        type: 'interactive',
        url: 'https://ptable.com/',
        description: 'Interactive periodic table with detailed element information',
        difficulty: 'intermediate',
        source: 'PTable'
      }
    ]
  }
];

export const quadraticEquationsTasks: Task[] = [
  {
    id: '1',
    title: 'Read chapter on quadratic formulas',
    description: 'Understand the fundamental concepts of quadratic equations and their standard form',
    completed: true,
    timeEstimate: '20 min',
    type: 'reading',
    difficulty: 'beginner',
    learningObjectives: [
      'Understand what a quadratic equation is',
      'Learn the standard form ax² + bx + c = 0',
      'Identify coefficients a, b, and c'
    ],
    resources: [
      {
        id: 'r1',
        title: 'Introduction to Quadratic Equations - Khan Academy',
        type: 'video',
        url: 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations',
        description: 'Comprehensive video explaining quadratic equations from basics',
        duration: '8 min',
        difficulty: 'beginner',
        source: 'Khan Academy',
        thumbnail: 'https://cdn.kastatic.org/images/khan-logo-dark-background-2.png'
      },
      {
        id: 'r2',
        title: 'Quadratic Equations: A Complete Guide',
        type: 'article',
        url: 'https://www.mathsisfun.com/algebra/quadratic-equation.html',
        description: 'Detailed article with examples and practice problems',
        duration: '12 min',
        difficulty: 'beginner',
        source: 'Math is Fun'
      }
    ]
  },
  {
    id: '2',
    title: 'Solve 10 practice problems',
    description: 'Apply your knowledge by solving various quadratic equation problems',
    completed: true,
    timeEstimate: '30 min',
    type: 'practice',
    difficulty: 'intermediate',
    learningObjectives: [
      'Practice solving quadratic equations by factoring',
      'Apply the quadratic formula',
      'Check solutions by substitution'
    ],
    resources: [
      {
        id: 'r3',
        title: 'Interactive Quadratic Equation Solver',
        type: 'interactive',
        url: 'https://www.mathway.com/Algebra',
        description: 'Step-by-step solver with explanations',
        difficulty: 'intermediate',
        source: 'Mathway'
      },
      {
        id: 'r4',
        title: 'Quadratic Equation Practice Problems',
        type: 'practice',
        url: 'https://www.varsitytutors.com/hotmath/hotmath_help/topics/quadratic-equations',
        description: '10 carefully selected practice problems with solutions',
        duration: '25 min',
        difficulty: 'intermediate',
        source: 'Varsity Tutors'
      }
    ]
  },
  {
    id: '3',
    title: 'Review discriminant concept',
    description: 'Understand how the discriminant determines the nature of roots',
    completed: true,
    timeEstimate: '15 min',
    type: 'review',
    difficulty: 'intermediate',
    learningObjectives: [
      'Understand what the discriminant is',
      'Learn how discriminant determines root types',
      'Apply discriminant to analyze equations'
    ],
    resources: [
      {
        id: 'r5',
        title: 'The Discriminant Explained - YouTube',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=0vByq0jfV40',
        description: 'Clear explanation of discriminant with visual examples',
        duration: '6 min',
        difficulty: 'intermediate',
        source: 'YouTube - Math with Mr. J'
      },
      {
        id: 'r6',
        title: 'Discriminant Practice Worksheet',
        type: 'document',
        url: 'https://www.kutasoftware.com/FreeWorksheets/Alg2Worksheets/Quadratic%20Formula.pdf',
        description: 'PDF worksheet with discriminant problems',
        difficulty: 'intermediate',
        source: 'Kuta Software'
      }
    ]
  },
  {
    id: '4',
    title: 'Practice solving equations',
    description: 'Master different methods of solving quadratic equations',
    completed: false,
    timeEstimate: '45 min',
    type: 'practice',
    difficulty: 'intermediate',
    learningObjectives: [
      'Solve by factoring',
      'Solve using quadratic formula',
      'Solve by completing the square',
      'Choose the best method for each problem'
    ],
    resources: [
      {
        id: 'r7',
        title: 'Quadratic Formula Song - YouTube',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=U7b5F8W4d2I',
        description: 'Memorable song to remember the quadratic formula',
        duration: '3 min',
        difficulty: 'beginner',
        source: 'YouTube - Math Songs'
      },
      {
        id: 'r8',
        title: 'Completing the Square Tutorial',
        type: 'video',
        url: 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations/x2f8bb11595b61c86:completing-square/v/solving-quadratic-equations-by-completing-the-square',
        description: 'Step-by-step tutorial on completing the square method',
        duration: '12 min',
        difficulty: 'intermediate',
        source: 'Khan Academy'
      },
      {
        id: 'r9',
        title: 'Quadratic Equation Practice Set',
        type: 'practice',
        url: 'https://www.ixl.com/math/algebra-1/solve-a-quadratic-equation-using-the-quadratic-formula',
        description: 'Interactive practice with immediate feedback',
        duration: '30 min',
        difficulty: 'intermediate',
        source: 'IXL Learning'
      }
    ]
  },
  {
    id: '5',
    title: 'Take practice quiz',
    description: 'Test your understanding with a comprehensive quiz',
    completed: false,
    timeEstimate: '25 min',
    type: 'quiz',
    difficulty: 'intermediate',
    learningObjectives: [
      'Assess understanding of quadratic equations',
      'Identify areas needing improvement',
      'Practice under time pressure'
    ],
    resources: [
      {
        id: 'r10',
        title: 'Quadratic Equations Quiz - Quizlet',
        type: 'interactive',
        url: 'https://quizlet.com/quiz/quadratic-equations',
        description: 'Interactive quiz with multiple choice questions',
        duration: '15 min',
        difficulty: 'intermediate',
        source: 'Quizlet'
      },
      {
        id: 'r11',
        title: 'Practice Test - College Board',
        type: 'practice',
        url: 'https://apcentral.collegeboard.org/courses/ap-precalculus/exam',
        description: 'Official practice questions from College Board',
        duration: '25 min',
        difficulty: 'advanced',
        source: 'College Board'
      }
    ]
  },
  {
    id: '6',
    title: 'Review with flashcards',
    description: 'Master key concepts using AI-generated flashcards',
    completed: false,
    timeEstimate: '20 min',
    type: 'flashcard',
    difficulty: 'intermediate',
    learningObjectives: [
      'Memorize key formulas and concepts',
      'Improve recall speed',
      'Identify knowledge gaps'
    ],
    resources: []
  },
  {
    id: '7',
    title: 'Join math contest',
    description: 'Compete with challenging AI-generated problems',
    completed: false,
    timeEstimate: '30 min',
    type: 'contest',
    difficulty: 'advanced',
    learningObjectives: [
      'Apply knowledge under pressure',
      'Solve complex problems efficiently',
      'Compete with other students'
    ],
    resources: []
  }
];
