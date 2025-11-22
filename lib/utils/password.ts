export interface PasswordStrength {
	score: number // 0-4
	feedback: string[]
	isStrong: boolean
}

/**
 * Evaluate password strength based on multiple criteria
 * Returns a score from 0 (very weak) to 4 (very strong)
 */
export function evaluatePasswordStrength(password: string): PasswordStrength {
	const feedback: string[] = []
	let score = 0

	// Length check
	if (password.length >= 8) score++
	if (password.length >= 12) score++
	if (password.length < 8) {
		feedback.push('Password should be at least 8 characters long')
	}

	// Character type checks
	const hasLowercase = /[a-z]/.test(password)
	const hasUppercase = /[A-Z]/.test(password)
	const hasNumbers = /\d/.test(password)
	const hasSpecialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)

	// Award points for character diversity
	const characterTypes = [
		hasLowercase,
		hasUppercase,
		hasNumbers,
		hasSpecialChars,
	].filter(Boolean).length

	if (characterTypes >= 3) score++
	if (characterTypes === 4) score++

	// Provide specific feedback
	if (!hasLowercase) feedback.push('Add lowercase letters')
	if (!hasUppercase) feedback.push('Add uppercase letters')
	if (!hasNumbers) feedback.push('Add numbers')
	if (!hasSpecialChars) feedback.push('Add special characters')

	// Check for common patterns (reduce score)
	const commonPatterns = [
		/^(.)\1+$/, // All same character
		/^123456/, // Sequential numbers
		/^abcdef/i, // Sequential letters
		/password/i, // Contains "password"
		/qwerty/i, // Keyboard pattern
	]

	for (const pattern of commonPatterns) {
		if (pattern.test(password)) {
			score = Math.max(0, score - 1)
			feedback.push('Avoid common patterns')
			break
		}
	}

	// Determine if password is strong enough (score >= 3)
	const isStrong = score >= 3

	if (score === 4) {
		feedback.unshift('Very strong password!')
	} else if (score === 3) {
		feedback.unshift('Strong password')
	} else if (score === 2) {
		feedback.unshift('Moderate password')
	} else if (score === 1) {
		feedback.unshift('Weak password')
	} else {
		feedback.unshift('Very weak password')
	}

	return {
		score,
		feedback,
		isStrong,
	}
}

/**
 * Get color class based on password strength score
 */
export function getPasswordStrengthColor(score: number): string {
	if (score >= 4) return 'text-green-500'
	if (score === 3) return 'text-blue-500'
	if (score === 2) return 'text-yellow-500'
	if (score === 1) return 'text-orange-500'
	return 'text-red-500'
}

/**
 * Get progress bar color based on password strength score
 */
export function getPasswordStrengthBgColor(score: number): string {
	if (score >= 4) return 'bg-green-500'
	if (score === 3) return 'bg-blue-500'
	if (score === 2) return 'bg-yellow-500'
	if (score === 1) return 'bg-orange-500'
	return 'bg-red-500'
}
