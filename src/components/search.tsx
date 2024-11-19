import React from 'react'
interface SearchProps {
	onSearch: (value: string) => void
	value: string
}

const Search: React.FC<SearchProps> = ({ onSearch, value }) => {
	return (
		<div className="relative w-full max-w-sm min-w-[200px]">
			<input
				className="w-full bg-[rgb(26,28,31)] text-slate-400 text-sm border border-slate-700 rounded-lg px-3 py-2.5
transition-all duration-200 ease-in-out
focus:outline-none focus:border-[rgb(56,128,243)] focus:ring-2 focus:ring-[rgb(56,128,243)]/20
hover:border-slate-600
[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
				placeholder="Search for AI videos..."
				value={value}
				onChange={(e) => onSearch(e.target.value)}
			/>
			<button
				className="absolute top-1.5 right-1 flex items-center rounded bg-slate-800 py-1 px-2.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:cursor-default"
				type="button"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
					<path
						fillRule="evenodd"
						d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
						clipRule="evenodd"
					/>
				</svg>
			</button>
		</div>
	)
}

export default Search
