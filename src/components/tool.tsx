import React from 'react'
import './tool.scss'
import { ReactComponent as PlusCircleIcon } from '@assets/svg/plus-circle.svg'
import { ReactComponent as RemoveIcon } from '@assets/svg/remove.svg'
import { ReactComponent as PlayCircleIcon } from '@assets/svg/play-circle.svg'
import { ReactComponent as PauseIcon } from '@assets/svg/pause.svg'

interface ToolProps {
	isPlaying: boolean
	setIsPlaying: (isPlaying: boolean) => void
	loadedImages: boolean
	markerType: number
	setMarkerType: (markerType: (prev: number) => 1 | 0) => void
}

const Tool: React.FC<ToolProps> = ({ isPlaying, setIsPlaying, loadedImages, markerType, setMarkerType }) => {
	const togglePlayer = () => {
		setIsPlaying(!isPlaying)
	}

	const toggleMarkerType = () => {
		setMarkerType((prev: number) => (prev === 1 ? 0 : 1))
	}

	const iconStyle = {
		color: loadedImages ? 'rgb(56, 128, 243)' : 'rgb(56, 128, 243, 0.5)',
		width: 36,
		height: 36,
	}

	return (
		<div className="tool">
			<div className="tool__item">
				<button onClick={togglePlayer} disabled={!loadedImages} title="Play & Pause">
					{isPlaying ? <PauseIcon style={{ ...iconStyle }} /> : <PlayCircleIcon style={{ ...iconStyle }} />}
				</button>
			</div>
			<div className="tool__item">
				<button onClick={toggleMarkerType} disabled={!loadedImages} title="Marker Positive & Negative">
					{markerType === 1 ? <PlusCircleIcon style={{ ...iconStyle }} /> : <RemoveIcon style={{ ...iconStyle, color: 'red' }} />}
				</button>
			</div>
			<div className="tool__item rotate">TOOLS</div>
		</div>
	)
}

export default Tool
