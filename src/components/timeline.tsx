import React, { useState, useEffect, useRef } from 'react'
import { Video, VideoObject } from '@types/index.tsx'
import useWindowResize from '@hooks/window-resize.tsx'

interface TimelineProps {
	video: Video
	framesLength: number
	frameWidth: number
	loadedImages: boolean
	setIsPlaying: (isPlaying: boolean) => void
	setCurrentSecond: (second: number) => void
	setCurrentFrame: (frame: number) => void
	currentSecond: number
	frameDuration: number
	currentFrame: number
	drawFrame: (frame: number) => void
	setSelectedObject: (object: VideoObject) => void
}

const Timeline: React.FC<TimelineProps> = ({
	video,
	framesLength,
	frameWidth,
	loadedImages,
	setIsPlaying,
	setCurrentSecond,
	setCurrentFrame,
	currentSecond,
	frameDuration,
	currentFrame,
	drawFrame,
	setSelectedObject,
}) => {
	const timelineRef = useRef<HTMLCanvasElement>(null)
	const [isDragging, setIsDragging] = useState(false)
	const windowResize = useWindowResize()

	useEffect(() => {
		const drawTimeline = () => {
			const timelineCanvas = timelineRef.current
			if (!timelineCanvas) return
			const ctx = timelineCanvas.getContext('2d')
			if (!ctx) return
			const timelineWidth = timelineCanvas.width
			const timelineHeight = timelineCanvas.height
			const segmentWidth = timelineWidth / framesLength
			const currentX = currentFrame * segmentWidth

			ctx.clearRect(0, 0, timelineWidth, timelineHeight)

			ctx.strokeStyle = 'gray'
			ctx.lineWidth = 1
			for (let i = 0; i < framesLength; i++) {
				ctx.beginPath()
				ctx.moveTo(i * segmentWidth, 0)
				ctx.lineTo(i * segmentWidth, timelineHeight)
				ctx.stroke()
			}

			ctx.strokeStyle = 'rgb(56, 128, 243)'
			ctx.lineWidth = 2
			ctx.beginPath()
			ctx.moveTo(currentX, 0)
			ctx.lineTo(currentX, timelineHeight)
			ctx.stroke()

			const triangleHeight = 10
			ctx.beginPath()
			ctx.moveTo(currentX - 5, 0)
			ctx.lineTo(currentX + 5, 0)
			ctx.lineTo(currentX, triangleHeight)
			ctx.closePath()
			ctx.fillStyle = 'rgb(56, 128, 243)'
			ctx.fill()

			const canvasWidth = ctx.canvas.width
			const textPadding = 5
			const textOffsetY = 20
			const textWidth = 100

			let textX = currentX + textPadding
			if (currentX + textPadding + textWidth > canvasWidth) {
				textX = currentX - textWidth - textPadding
			}

			ctx.fillStyle = 'white'
			ctx.font = '16px Open-Sans'
			ctx.textAlign = 'left'
			ctx.textBaseline = 'top'
			ctx.fillText(`Time: ${currentSecond.toFixed(3)}s`, textX, textOffsetY)
			ctx.fillText(`Frame: ${currentFrame} / ${framesLength - 1}`, textX, textOffsetY + 20)
		}

		drawTimeline()
	}, [currentSecond, currentFrame, framesLength, windowResize])

	const calculateClickedPosition = (child: { frameNumber: number }) => {
		const timelineCanvas = timelineRef.current
		if (!timelineCanvas) return 0
		const timelineWidth = timelineCanvas.width
		const segmentWidth = timelineWidth / framesLength
		const markerX = child.frameNumber * segmentWidth

		return markerX
	}

	const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
		setIsDragging(true)
		handleTimelineMove(event)
	}

	const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
		if (isDragging) {
			handleTimelineMove(event)
		}
	}

	const handleMouseUp = () => {
		setIsDragging(false)
	}

	const handleTimelineMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
		const timelineCanvas = timelineRef.current
		if (!timelineCanvas) return
		const rect = timelineCanvas.getBoundingClientRect()
		const x = event.clientX - rect.left
		const timelineWidth = timelineCanvas.width
		const frameIndex = Math.floor((x / timelineWidth) * framesLength)
		const clampedFrameIndex = Math.max(0, Math.min(framesLength, frameIndex))

		setCurrentFrame(clampedFrameIndex)
		setCurrentSecond((clampedFrameIndex * frameDuration) / 1000)
		drawFrame(clampedFrameIndex)
	}

	const goMarkerPosition = (frameNumber: number, object: VideoObject) => {
		setCurrentFrame(frameNumber)
		setCurrentSecond((frameNumber * frameDuration) / 1000)
		setSelectedObject(object)
		drawFrame(frameNumber)
	}

	return (
		<>
			<div className="flex relative items-center mb-2 mt-5" style={{ width: frameWidth }}>
				<canvas
					ref={timelineRef}
					width={frameWidth}
					height={75}
					style={{
						cursor: loadedImages ? 'pointer' : 'progress',
						pointerEvents: loadedImages ? 'all' : 'none',
					}}
					onMouseDown={handleMouseDown}
					onMouseMove={handleMouseMove}
					onMouseUp={handleMouseUp}
					onClick={() => setIsPlaying(false)}
				/>
			</div>
			<div className="h-40 scroll overflow-auto" style={{ width: frameWidth }}>
				{video.objects.map((obj) => (
					<div className="flex items-center mb-2 mt-10 relative" key={`object-${obj.id}`}>
						<div className="text-white absolute text-sm z-10 -top-8"> {obj.title}</div>
						<div className="h-full relative w-full">
							<div className="h-px absolute top-1/2 left-0 w-full" style={{ backgroundColor: obj.objectColor }}></div>
							{obj.child.map((child) => (
								<div
									key={`object-${obj.id}-child${child.id}`}
									style={{
										backgroundColor: obj.objectColor,
										left: Math.max(calculateClickedPosition(child) - 6, 0),
										top: '-6px',
										cursor: 'pointer',
									}}
									className="w-3 h-3 absolute rounded-full"
									onClick={() => goMarkerPosition(child.frameNumber, obj)}
								></div>
							))}
						</div>
					</div>
				))}
			</div>
		</>
	)
}

export default Timeline
