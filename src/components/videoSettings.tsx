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
		<div className="flex justify-center gap-1 relative w-full max-w-sm min-w-[200px]">
			<select
				className="w-1/2 bg-transparent truncate placeholder:text-slate-400 text-slate-400 text-sm border border-slate-200 rounded-md pl-3  py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
				value={aiModel}
				onChange={(e) => setAiModel(e.target.value)}
			>
				{options.map((v, index) => (
					<option key={`model-option-${index}`} value={v.ai_model_id}>
						{v.ai_model_name}
					</option>
				))}
			</select>
			<input
				type="number"
				min={0}
				max={1}
				step={0.1}
				className="w-1/2 bg-transparent placeholder:text-slate-400 text-slate-400 text-sm border border-slate-200 rounded-md pl-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
				placeholder="Enter Scale"
				value={scale}
				onChange={(e) => setScale(Math.max(0, Math.min(1, Number(e.target.value))))}
			/>
		</div>
	)
}

export default VideoSettings
