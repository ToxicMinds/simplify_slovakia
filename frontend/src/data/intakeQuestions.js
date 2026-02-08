// frontend/src/data/intakeQuestions.js
// FIXED VERSION - Removed STUDY option until student flow is created

/**
 * INTAKE QUESTIONS
 * 
 * These questions map to intake_routing fields in flow YAML files.
 * Dynamic branching based on previous answers.
 */

export const intakeQuestions = [
  {
    id: 'nationality_type',
    question: "What's your citizenship/nationality status?",
    description: "This determines visa requirements and which flows apply to you",
    icon: '🌍',
    type: 'single_select',
    required: true,
    options: [
      {
        value: 'EU',
        label: 'EU / EEA / Swiss Citizen',
        description: 'You have freedom of movement - no visa needed!',
        help: 'Includes all EU countries plus Iceland, Liechtenstein, Norway, Switzerland'
      },
      {
        value: 'NON_EU_VISA_FREE',
        label: 'Non-EU, Visa-Free',
        description: 'From: USA, Canada, UK, Australia, Japan, etc.',
        help: 'Can enter Schengen for 90 days without visa'
      },
      {
        value: 'NON_EU_VISA_REQUIRED',
        label: 'Non-EU, Visa Required',
        description: 'From: India, China, Russia, Philippines, etc.',
        help: 'Need Schengen visa to enter Slovakia'
      }
    ]
  },
  
  {
    id: 'current_location',
    question: "Where are you right now?",
    description: "This affects which processes you can start",
    icon: '📍',
    type: 'single_select',
    required: true,
    options: [
      {
        value: 'OUTSIDE_SK',
        label: "Outside Slovakia",
        description: "I haven't arrived yet / I'm in another country",
        help: 'You\'ll need to apply for visas/permits from outside'
      },
      {
        value: 'IN_SK',
        label: "In Slovakia",
        description: "I'm already physically in Slovakia",
        help: 'Different processes available for people already here'
      }
    ]
  },
  
  {
    id: 'urgency_level',
    question: "How urgent is your situation?",
    description: "Are you in an emergency/time-sensitive situation?",
    icon: '⏱️',
    type: 'single_select',
    required: true,
    options: [
      {
        value: 'EMERGENCY',
        label: 'Emergency / Just Landed',
        description: 'I just arrived and need immediate help',
        help: 'Critical deadlines like Foreign Police registration'
      },
      {
        value: 'NORMAL',
        label: 'Normal Planning',
        description: 'I have time to plan properly',
        help: 'Standard immigration timeline'
      }
    ],
    show_when: {
      current_location: 'IN_SK'
    }
  },
  
  {
    id: 'visit_purpose',
    question: "What's your main purpose in Slovakia?",
    description: "Why are you coming to / living in Slovakia?",
    icon: '🎯',
    type: 'single_select',
    required: true,
    options: [
      {
        value: 'TOURISM',
        label: 'Tourism / Short Visit',
        description: 'Tourist visit up to 90 days',
        help: 'No work allowed'
      },
      {
        value: 'EMPLOYMENT',
        label: 'Employment',
        description: 'I have a job offer from a Slovak company',
        help: 'Most common for workers'
      },
      {
        value: 'BUSINESS',
        label: 'Business / Freelancing',
        description: 'Self-employed, freelancer, or starting a business',
        help: 'Živnosť (trade license) route'
      },
      {
        value: 'FAMILY',
        label: 'Join Family',
        description: 'My family member already has residence in Slovakia',
        help: 'Family reunification'
      },
      {
        value: 'PERMANENT',
        label: 'Permanent Residence',
        description: 'I\'ve been here 5+ years and want permanent residence',
        help: 'After 5 years temporary residence'
      },
      {
        value: 'CITIZENSHIP',
        label: 'Slovak Citizenship',
        description: 'I want to become a Slovak citizen',
        help: '8+ year commitment'
      }
      // NOTE: STUDY option removed until sk_student_first_entry flow is created
      // If you need student guidance, browse all flows and check employment flow as reference
    ]
  },
  
  {
    id: 'visit_duration',
    question: "How long do you plan to stay?",
    description: "Estimated duration in Slovakia",
    icon: '📅',
    type: 'single_select',
    required: true,
    options: [
      {
        value: 'SHORT_STAY',
        label: 'Short Stay (< 90 days)',
        description: 'Tourist visit or short business trip',
        help: 'Maximum without residence permit'
      },
      {
        value: 'MEDIUM_STAY',
        label: 'Medium Stay (3 months - 2 years)',
        description: 'Temporary residence',
        help: 'Requires residence permit'
      },
      {
        value: 'LONG_STAY',
        label: 'Long Stay (2-5 years)',
        description: 'Long-term temporary residence',
        help: 'Towards permanent residence'
      },
      {
        value: 'PERMANENT',
        label: 'Indefinite / Permanent',
        description: 'Planning to settle permanently',
        help: '5+ years required for permanent residence'
      }
    ],
    show_when: {
      visit_purpose: ['EMPLOYMENT', 'BUSINESS', 'FAMILY', 'TOURISM']
    }
  },
  
  {
    id: 'years_in_slovakia',
    question: "How long have you already lived in Slovakia?",
    description: "On legal residence (not tourist visits)",
    icon: '⏳',
    type: 'single_select',
    required: true,
    options: [
      {
        value: '0',
        label: '0 years',
        description: 'Haven\'t started yet / just arrived',
        help: 'Starting your journey'
      },
      {
        value: '1-2',
        label: '1-2 years',
        description: 'Recently arrived',
        help: 'Early temporary residence phase'
      },
      {
        value: '3-4',
        label: '3-4 years',
        description: 'Mid-term resident',
        help: 'Approaching 5-year mark'
      },
      {
        value: '5-7',
        label: '5-7 years',
        description: 'Long-term resident',
        help: 'Eligible for permanent residence'
      },
      {
        value: '8+',
        label: '8+ years',
        description: 'Very long-term resident',
        help: 'Eligible for citizenship'
      }
    ],
    show_when: {
      visit_purpose: ['PERMANENT', 'CITIZENSHIP']
    }
  },
  
  {
    id: 'city',
    question: "Which city will you live in?",
    description: "Some processes vary slightly by location",
    icon: '🏙️',
    type: 'single_select',
    required: true,
    options: [
      {
        value: 'BRATISLAVA',
        label: 'Bratislava',
        description: 'Capital city',
        help: 'Most resources available'
      },
      {
        value: 'OTHER',
        label: 'Other City',
        description: 'Košice, Žilina, Nitra, etc.',
        help: 'Process similar but may have different office locations'
      }
    ]
  }
]

/**
 * Get the next question based on previous answers
 * 
 * @param {Object} answers - Object with question_id: answer_value pairs
 * @returns {Object|null} - Next question object or null if done
 */
export function getNextQuestion(answers) {
  for (const question of intakeQuestions) {
    // Skip if already answered
    if (answers[question.id] !== undefined) {
      continue
    }
    
    // Check if question should be shown based on show_when conditions
    if (question.show_when) {
      const shouldShow = Object.entries(question.show_when).every(([key, value]) => {
        if (Array.isArray(value)) {
          return value.includes(answers[key])
        }
        return answers[key] === value
      })
      
      if (!shouldShow) {
        continue
      }
    }
    
    // This is the next question to ask
    return question
  }
  
  // No more questions
  return null
}

/**
 * Validate that all required answers are present
 * 
 * @param {Object} answers - Object with question_id: answer_value pairs
 * @returns {Object} - { valid: boolean, missing: string[] }
 */
export function validateAnswers(answers) {
  const requiredQuestions = intakeQuestions.filter(q => {
    if (!q.required) return false
    
    // Check if question should be shown
    if (q.show_when) {
      const shouldShow = Object.entries(q.show_when).every(([key, value]) => {
        if (Array.isArray(value)) {
          return value.includes(answers[key])
        }
        return answers[key] === value
      })
      if (!shouldShow) return false
    }
    
    return true
  })
  
  const missingAnswers = requiredQuestions
    .filter(q => answers[q.id] === undefined)
    .map(q => q.id)
  
  return {
    valid: missingAnswers.length === 0,
    missing: missingAnswers
  }
}

/**
 * Get total number of questions that should be answered given current answers
 * 
 * @param {Object} answers - Object with question_id: answer_value pairs (optional)
 * @returns {number} - Total number of applicable questions
 */
export function getTotalQuestions(answers = {}) {
  return intakeQuestions.filter(q => {
    // Check if question should be shown based on current answers
    if (q.show_when) {
      const shouldShow = Object.entries(q.show_when).every(([key, value]) => {
        if (Array.isArray(value)) {
          return value.includes(answers[key])
        }
        return answers[key] === value
      })
      return shouldShow
    }
    return true
  }).length
}
