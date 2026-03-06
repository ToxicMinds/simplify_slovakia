// frontend/src/services/flowService.js
// Service to fetch flows and steps from backend API

import { API_URL } from '../config.js'

/**
 * Fetch available flows list
 */
export async function getAvailableFlows() {
  try {
    const response = await fetch(`${API_URL}/flows`)

    if (!response.ok) {
      throw new Error(`Failed to fetch flows: ${response.status}`)
    }

    const data = await response.json()
    return data.flows || []
  } catch (error) {
    console.error('Error fetching flows:', error)
    return []
  }
}

/**
 * Fetch a specific flow with all its steps
 */
export async function getFlow(flowId) {
  try {
    const response = await fetch(`${API_URL}/flow/${flowId}`)

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Flow not found: ${flowId}`)
      }
      throw new Error(`Failed to fetch flow: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching flow ${flowId}:`, error)
    throw error
  }
}

/**
 * Fetch a specific step
 */
export async function getStep(stepId) {
  try {
    const response = await fetch(`${API_URL}/step/${stepId}`)

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Step not found: ${stepId}`)
      }
      throw new Error(`Failed to fetch step: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching step ${stepId}:`, error)
    throw error
  }
}
