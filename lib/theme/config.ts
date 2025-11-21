/**
 * Theme Configuration
 * Defines all available themes in the application
 */

export type ThemeDefinition = {
	id: string
	name: string
	description: string
	previewColors: {
		primary: string
		secondary: string
		accent: string
	}
}

export const AVAILABLE_THEMES: ThemeDefinition[] = [
	{
		id: 'default',
		name: 'Default',
		description: 'Neutral slate palette - clean and professional',
		previewColors: {
			primary: '#36363a',
			secondary: '#f7f7f8',
			accent: '#f7f7f8',
		},
	},
	{
		id: 'bubblegum',
		name: 'Bubblegum',
		description: 'Playful pink and purple palette',
		previewColors: {
			primary: '#e94b9f',
			secondary: '#fce8f4',
			accent: '#d891e0',
		},
	},
	{
		id: 'ocean',
		name: 'Ocean',
		description: 'Calm blue and teal palette',
		previewColors: {
			primary: '#2563eb',
			secondary: '#eff6ff',
			accent: '#60a5fa',
		},
	},
	{
		id: 'forest',
		name: 'Forest',
		description: 'Natural green and earth tones',
		previewColors: {
			primary: '#059669',
			secondary: '#f0fdf4',
			accent: '#34d399',
		},
	},
	{
		id: 'claymorphism',
		name: 'Claymorphism',
		description: 'Claymorphism palette',
		previewColors: {
			primary: '#8b5cf6',
			secondary: '#e5e7eb',
			accent: '#f3e8ff',
		},
	},
	{
		id: 'elegant-luxury',
		name: 'Elegant Luxury',
		description: 'Elegant, luxurious, and modern',
		previewColors: {
			primary: '#b45309',
			secondary: '#fef3c7',
			accent: '#fde68a',
		},
	},
	{
		id: 'neo-brutalism',
		name: 'Neo Brutalism',
		description: 'Neo, brutalism, and modern',
		previewColors: {
			primary: '#f97316',
			secondary: '#fef08a',
			accent: '#a855f7',
		},
	},
	{
		id: 'supabase',
		name: 'Supabase',
		description: 'Supabase palette',
		previewColors: {
			primary: '#3ecf8e',
			secondary: '#f0f9ff',
			accent: '#6366f1',
		},
	},
	{
		id: 'vercel',
		name: 'Vercel',
		description: 'Vercel palette',
		previewColors: {
			primary: '#000000',
			secondary: '#f0f0f0',
			accent: '#f0f0f0',
		},
	},
	{
		id: 'vintage-paper',
		name: 'Vintage Paper',
		description: 'Vintage, paper, and modern',
		previewColors: {
			primary: '#9a7a4f',
			secondary: '#e8dcc4',
			accent: '#d4c4a8',
		},
	},
	{
		id: 'violet-bloom',
		name: 'Violet Bloom',
		description: 'Violet, bloom, and modern',
		previewColors: {
			primary: '#9333ea',
			secondary: '#f3e8ff',
			accent: '#e9d5ff',
		},
	},
	{
		id: 'claude',
		name: 'Claude',
		description: 'Claude AI palette',
		previewColors: {
			primary: '#e879f9',
			secondary: '#cffafe',
			accent: '#f0f9ff',
		},
	},
	{
		id: 'darkmatter',
		name: 'Dark Matter',
		description: 'Dark, bold, and modern',
		previewColors: {
			primary: '#f59e0b',
			secondary: '#3b82f6',
			accent: '#f3f4f6',
		},
	},
	{
		id: 'clean-slate',
		name: 'Clean Slate',
		description: 'Minimalist, clean, and modern',
		previewColors: {
			primary: '#8b5cf6',
			secondary: '#f3f4f6',
			accent: '#e9d5ff',
		},
	},
]

export const DEFAULT_THEME = 'default'

export function getThemeById(id: string): ThemeDefinition | undefined {
	return AVAILABLE_THEMES.find((theme) => theme.id === id)
}

export function isValidTheme(id: string): boolean {
	return AVAILABLE_THEMES.some((theme) => theme.id === id)
}
