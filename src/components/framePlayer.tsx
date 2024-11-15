import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import useWindowResize from '@hooks/window-resize.tsx'
import Timeline from './timeline.tsx'
import Loading from './loading.tsx'
import Markers from './markers.tsx'
import Tool from './tool.tsx'

interface FramePlayerProps {
	video: any
	cachedImages: any
	addChild: (params: { frameNumber: number; x: number; y: number; markerType: any }) => void
	frameDuration: number
	loadedImages: boolean
	fps: number
	selectedObject: any
	setSelectedObject: (object: any) => void
	markerType: any
	setMarkerType: (type: any) => void
	removeMarker: (marker: any) => void
	step: number
	fetching: boolean
	drawFrame: (frameIndex: number) => void
	currentFrame: number
	setCurrentFrame: (frame: number) => void
	currentSecond: number
	setCurrentSecond: (second: number) => void
}

export interface FramePlayerMethods {
	setCurrentFrame: (currentFrame: number) => void
	setCurrentSecond: (currentSecond: number) => void
	drawFrame: (frameIndex: number) => void
}

const FramePlayer = forwardRef<FramePlayerMethods, FramePlayerProps>(
	(
		{
			video,
			cachedImages,
			addChild,
			frameDuration,
			loadedImages,
			fps,
			selectedObject,
			setSelectedObject,
			markerType,
			setMarkerType,
			removeMarker,
			step,
			fetching,
		},
		ref,
	) => {
		const frameRate = 0.7
		const [isPlaying, setIsPlaying] = useState<boolean>(false)
		const animationRef = useRef<number | null>(null)
		const [frameWidth, setFrameWidth] = useState<number>(window.screen.width * frameRate)
		const [frameHeight, setFrameHeight] = useState<number>(576)
		const windowResize = useWindowResize()
		const startTimeRef = useRef<number>(0)
		const pauseTimeRef = useRef<number>(0)
		const [currentSecond, setCurrentSecond] = useState<number>(0)
		const [currentFrame, setCurrentFrame] = useState<number>(0)
		const framePlayerRef = useRef<HTMLCanvasElement>(null)

		const drawFrame = (frameIndex: number) => {
			const canvas = framePlayerRef.current
			if (!canvas) return
			const ctx = canvas.getContext('2d')
			const img = cachedImages[frameIndex]

			if (ctx && img) {
				ctx.clearRect(0, 0, canvas.width, canvas.height)
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
			}
		}

		useImperativeHandle(ref, () => ({
			setCurrentFrame: (currentFrame: number) => {
				setCurrentFrame(currentFrame)
			},
			setCurrentSecond: (currentSecond: number) => {
				setCurrentSecond(currentSecond)
			},
			drawFrame: (frameIndex: number) => {
				drawFrame(frameIndex)
			},
		}))

		useEffect(() => {
			const { width } = windowResize
			const newFrameRate = width * frameRate

			setFrameWidth(newFrameRate)
			drawFrame(currentFrame)
		}, [windowResize])

		useEffect(() => {
			if (loadedImages) {
				drawFrame(0)
				setCurrentFrame(0)
				setCurrentSecond(0)
			}
		}, [loadedImages])

		useEffect(() => {
			if (cachedImages.length === 0) {
				const canvas = framePlayerRef.current
				if (!canvas) return
				const ctx = canvas.getContext('2d')
				if (ctx) {
					ctx.clearRect(0, 0, canvas.width, canvas.height)
				}
			}
		}, [cachedImages])

		useEffect(() => {
			const render = (time: number) => {
				if (!isPlaying) return
				const elapsed = time - startTimeRef.current
				const frameIndex = Math.floor(elapsed / frameDuration) % cachedImages.length
				drawFrame(frameIndex)
				setCurrentFrame(frameIndex)
				setCurrentSecond((frameIndex * frameDuration) / 1000)
				animationRef.current = requestAnimationFrame(render)
			}

			if (isPlaying) {
				startTimeRef.current = performance.now() - currentFrame * frameDuration
				animationRef.current = requestAnimationFrame(render)
			} else {
				if (animationRef.current) {
					cancelAnimationFrame(animationRef.current)
				}
				pauseTimeRef.current = performance.now()
			}

			return () => {
				if (animationRef.current) {
					cancelAnimationFrame(animationRef.current)
				}
			}
		}, [fps, isPlaying])

		const handleFrameClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
			const canvas = framePlayerRef.current
			if (!canvas) return
			const rect = canvas.getBoundingClientRect()
			const x = (event.clientX - rect.left) / frameWidth
			const y = (event.clientY - rect.top) / frameHeight

			setIsPlaying(false)
			addChild({ frameNumber: currentFrame, x, y, markerType })
		}

		return (
			<div
				className="flex flex-1 pr-4 py-6 items-center justify-center"
				style={{
					background: 'rgb(26, 28, 31)',
					borderRadius: 12,
					pointerEvents: loadedImages ? 'all' : 'none',
				}}
			>
				<Tool setIsPlaying={setIsPlaying} isPlaying={isPlaying} loadedImages={loadedImages} markerType={markerType} setMarkerType={setMarkerType} />

				<div className="flex flex-col flex-1 relative items-center">
					<canvas
						ref={framePlayerRef}
						width={frameWidth}
						height={frameHeight}
						onClick={handleFrameClick}
						style={{ cursor: loadedImages ? 'pointer' : 'progress' }}
					/>

					<Markers
						video={video}
						selectedObject={selectedObject}
						frameIndex={currentFrame}
						frameWidth={frameWidth}
						frameHeight={frameHeight}
						removeMarker={removeMarker}
					/>

					{step === 1 && (
						<div role="status" className="flex absolute items-center justify-center w-full h-96 bg-gray-300 rounded-lg dark:bg-gray-700">
							<svg
								className="w-10 h-10 text-gray-200 dark:text-gray-600"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								fill="currentColor"
								viewBox="0 0 16 20"
							>
								<path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z" />
								<path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM9 13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2Zm4 .382a1 1 0 0 1-1.447.894L10 13v-2l1.553-1.276a1 1 0 0 1 1.447.894v2.764Z" />
							</svg>
							<span className="sr-only">Select a video</span>

							<Loading show={fetching && !loadedImages} />
						</div>
					)}

					<Timeline
						video={video}
						frameWidth={frameWidth}
						framesLength={cachedImages.length}
						loadedImages={loadedImages}
						setIsPlaying={setIsPlaying}
						isPlaying={isPlaying}
						setCurrentSecond={setCurrentSecond}
						setCurrentFrame={setCurrentFrame}
						currentSecond={currentSecond}
						currentFrame={currentFrame}
						windowResize={windowResize}
						drawFrame={drawFrame}
						frameDuration={frameDuration}
						setSelectedObject={setSelectedObject}
					/>
				</div>
			</div>
		)
	},
)

export default FramePlayer
