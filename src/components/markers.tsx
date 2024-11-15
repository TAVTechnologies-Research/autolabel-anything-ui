import React from 'react'
import { ReactComponent as PlusCircleIcon } from '@assets/svg/plus-circle.svg'
import { ReactComponent as RemoveIcon } from '@assets/svg/remove.svg'
import './marker.scss'

interface MarkerProps {
	video: {
		objects: {
			id: string
			child: {
				id: string
				frameNumber: number
				markerType: number
				x: number
				y: number
			}[]
		}[]
	}
	selectedObject: {
		id: string
	}
	frameIndex: number
	frameWidth: number
	frameHeight: number
	removeMarker: (id: string, frameIndex: number) => void
}

const Markers: React.FC<MarkerProps> = ({ video, selectedObject, frameIndex, frameWidth, frameHeight, removeMarker }) => {
	const generateMarkers = () => {
		const findObject = video?.objects.find((object) => object.id === selectedObject?.id)

		if (findObject) {
			return findObject.child.map((child) => {
				if (child.frameNumber === frameIndex) {
					return child.markerType === 1 ? (
						<PlusCircleIcon
							key={`marker-positive-${child.id}`}
							className="marker-item"
							style={{
								position: 'absolute',
								left: child.x * frameWidth,
								top: child.y * frameHeight,
								transform: 'translate(-50%, -50%) scale(1.5)',
								cursor: 'pointer',
								color: 'rgb(56, 128, 243)',
							}}
							onClick={() => removeMarker(child.id, frameIndex)}
						/>
					) : (
						<RemoveIcon
							key={`marker-negative-${child.id}`}
							className="marker-item"
							style={{
								position: 'absolute',
								left: child.x * frameWidth,
								top: child.y * frameHeight,
								transform: 'translate(-50%, -50%) scale(1.5)',
								cursor: 'pointer',
								color: 'red',
							}}
							onClick={() => removeMarker(child.id, frameIndex)}
						/>
					)
				}
				return null
			})
		}
		return null
	}

	return <>{generateMarkers()}</>
}

export default Markers
