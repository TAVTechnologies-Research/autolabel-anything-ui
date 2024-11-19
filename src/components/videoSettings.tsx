import React, { useEffect, useState } from 'react'
import { AIModel } from '@types/index.tsx'

interface SearchProps {
	setAiModel: (model: any) => void
	setScale: (scale: number) => void
	aiModel: any
	scale: number
}

const VideoSettings: React.FC<SearchProps> = ({ setAiModel, setScale, aiModel, scale }) => {
	const [options, setOptions] = useState<AIModel[]>([])

	useEffect(() => {
		getOptions()
	}, [])

	const getOptions = () => {
		const serverUrl = process.env?.REACT_APP_SERVER_URL
		fetch(`${serverUrl}/ai-models/all`)
			.then((res) => res.json())
			.then((data: AIModel[]) => {
				setOptions(data)
			})
	}

	return (
		<div className="flex justify-center gap-4 relative w-full max-w-sm min-w-[200px] py-2">
			<div className="w-1/2 gap-2 flex flex-col">
				<div className="text-white text-sm font-medium">Select Model</div>
				<select
					className="w-full bg-[rgb(26,28,31)] text-slate-400 text-sm border border-slate-700 rounded-lg px-3 py-2.5 
					transition-all duration-200 ease-in-out 
					focus:outline-none focus:border-[rgb(56,128,243)] focus:ring-2 focus:ring-[rgb(56,128,243)]/20
					hover:border-slate-600"
					value={aiModel}
					onChange={(e) => setAiModel(e.target.value)}
				>
					{options.map((v, index) => (
						<option key={`model-option-${index}`} value={v.ai_model_id}>
							{v.ai_model_name}
						</option>
					))}
				</select>
			</div>

			<div className="w-1/2 gap-2 flex flex-col">
				<div className="text-white text-sm font-medium">Video Scale</div>
				<input
					type="number"
					min={0}
					max={1}
					step={0.1}
					className="w-full bg-[rgb(26,28,31)] text-slate-400 text-sm border border-slate-700 rounded-lg px-3 py-2.5
					transition-all duration-200 ease-in-out
					focus:outline-none focus:border-[rgb(56,128,243)] focus:ring-2 focus:ring-[rgb(56,128,243)]/20
					hover:border-slate-600
					[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
					placeholder="Enter Scale"
					value={scale}
					onChange={(e) => setScale(Math.max(0, Math.min(1, Number(e.target.value))))}
				/>
			</div>
		</div>
	)
}

export default VideoSettings
