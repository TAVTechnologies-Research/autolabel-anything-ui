import React, { useEffect, useRef, useState } from 'react'
import FramePlayer from '@components/framePlayer.tsx'
import FramerList from '@components/framerList.tsx'
import Basket from '@components/basket.tsx'
import Aside from '@components/aside.tsx'
import { ReactComponent as Refresh } from '@assets/svg/refresh.svg'
import useParams from '@hooks/params.tsx'
import { SelectedVideo, WebsocketMessage } from '@types/index.tsx'
import { Websocket } from '@utils/websocket.tsx'
import useCacheImages from './hooks/cachedImages.tsx'
import useVideoManager from './hooks/videoManager.tsx'

const App: React.FC = () => {
	const [ws, setWs] = useState<Websocket | null>(null)
	const {
		video,
		setVideo,
		clearVideo,
		createObject,
		addChild,
		deleteObject,
		selectedObject,
		setSelectedObject,
		scale,
		setScale,
		removeMarker,
		fps,
		setFps,
		frameDuration,
		setFrameDuration,
		trackObjects,
	} = useVideoManager(ws)
	const [step, setStep] = useState<number>(1)
	const [loadedImages, setLoadedImages] = useState<boolean>(false)
	const [markerType, setMarkerType] = useState<number>(1)
	const [fetching, setFetching] = useState<boolean>(false)
	const [selectedVideo, setSelectedVideo] = useState<SelectedVideo | null>(null)
	const [modelUuid, setModelUuid] = useState<string>('')
	const framePlayerRef = useRef<HTMLCanvasElement>(null)
	const [thumbnails, setThumbnails] = useState<object>({})
	const [aiModel, setAiModel] = useState<any>(4)
	const { startFrame } = useParams()
	const { cachedImages, cacheImages, cacheImageUpdate, cachedImagesClear } = useCacheImages()

	useEffect(() => {
		if (ws) {
			ws.close()
			ws.connect()

			ws.addMessageHandler(async (message: WebsocketMessage) => {
				switch (message.msg_type) {
					case 'frame':
						const messageThumbnails: object = message.meta?.objectThumbnails || {}

						setThumbnails((prevThumbnails) => ({
							...prevThumbnails,
							...messageThumbnails,
						}))

						const data = message.data
						await cacheImageUpdate({ image_base64: data.image_base64 }, data.frame_number)

						setTimeout(() => {
							framePlayerRef.current?.drawFrame(data.frame_number)
							framePlayerRef.current?.setCurrentFrame(data.frame_number)
							framePlayerRef.current?.setCurrentSecond((data.frame_number * frameDuration) / 1000)
						}, 0)

						break
				}
			})
		}
	}, [ws])

	useEffect(() => {
		console.log(modelUuid)
	}, [modelUuid])

	useEffect(() => {
		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			const serverUrl = process.env?.REACT_APP_SERVER_URL

			if (modelUuid && aiModel && video?.video_id) {
				const data = new Blob([JSON.stringify({ ai_model_id: aiModel, video_id: video.video_id })], { type: 'application/json' })

				navigator.sendBeacon(`${serverUrl}/tasks/inference/terminate?task_uuid=${modelUuid}`, data)
			}
		}

		window.addEventListener('beforeunload', handleBeforeUnload)
		return () => window.removeEventListener('beforeunload', handleBeforeUnload)
	}, [modelUuid, aiModel, video])

	const fetchVideoMetadata = (videoId: string): void => {
		setFetching(true)
		const serverUrl = process.env?.REACT_APP_SERVER_URL

		fetch(`${serverUrl}/videos/${videoId}`)
			.then((res) => res.json())
			.then((data) => {
				const { video_fps, frame_count, video_id } = data

				setVideo({
					...data,
					objects: [],
				})

				setFps(video_fps)
				setFrameDuration(1000 / video_fps)

				fetch(`${serverUrl}/frames/${videoId}?scale=${scale}&start_frame=${startFrame}&end_frame=${frame_count - 1}&thumbnail=true`)
					.then((res) => res.json())
					.then(async (data) => {
						const filterFrames = data.frames.filter((item: any) => item)

						const uuid = await initModel(video_id)

						const checkReadyStatus = async () => {
							const status = await getReadyStatus(uuid)
							if (status === 'ready') {
								cacheImages(filterFrames)
									.then(() => {
										setLoadedImages(true)
										setStep(2)
									})
									.catch((error) => console.error(error.message))
									.finally(() => {
										openWebSocket(uuid)
										setFetching(false)
									})
							} else if (status !== 'failed') {
								setTimeout(checkReadyStatus, 1000)
							}
						}

						await checkReadyStatus()
					})
			})
			.catch((error) => setFetching(false))
	}

	const clearHandler = (): void => {
		clearVideo()
		setSelectedObject(null)
		setStep(1)
		setLoadedImages(false)
		cachedImagesClear()
		setMarkerType(1)
		setAiModel(4)
		setScale(1)
	}

	const startOverHandler = (): void => {
		clearHandler()
		terminateModel(modelUuid).then()
	}

	const initModel = async (video_id: number) => {
		const serverUrl = process.env?.REACT_APP_SERVER_URL
		try {
			const response = await fetch(`${serverUrl}/tasks/inference/initialize`, {
				body: JSON.stringify({ ai_model_id: aiModel, video_id }),
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			})
			const data = await response.json()
			setModelUuid(data.data.uuid)
			return data.data.uuid
		} catch (error) {
			console.error(error)
		}
	}

	const terminateModel = async (uuid: string) => {
		const serverUrl = process.env?.REACT_APP_SERVER_URL
		try {
			await fetch(`${serverUrl}/tasks/inference/terminate?task_uuid=${uuid}`, {
				method: 'POST',
				body: JSON.stringify({ ai_model_id: aiModel, video_id: video.video_id }),
				headers: { 'Content-Type': 'application/json' },
			})
		} catch (error) {
			console.error(error)
		}
	}

	const getReadyStatus = async (taskUuid: string) => {
		const serverUrl = process.env?.REACT_APP_SERVER_URL
		try {
			const response = await fetch(`${serverUrl}/tasks/status?task_uuid=${taskUuid}`, {
				method: 'GET',
			})
			const data = await response.json()
			return data.data.status
		} catch (error) {
			console.error(error)
		}
	}

	const openWebSocket = async (uuid: string): Promise<Websocket> => {
		const serverUrl = process.env?.REACT_APP_WS_URL
		try {
			setWs(new Websocket(`${serverUrl}/tasks/inference/${uuid}`))
		} catch (error) {
			console.error(error)
		}
	}

	const isAnnotationReady = async () => {
		const serverUrl = process.env?.REACT_APP_SERVER_URL
		try {
			const annotationStatus = await fetch(`${serverUrl}/tasks/annotation/status?task_uuid=${modelUuid}`)
			const { data } = await annotationStatus.json()
			return data.status
		} catch (error) {
			console.error(error)
		}
	}

	const exportAnnotation = async () => {
		const serverUrl = process.env?.REACT_APP_SERVER_URL
		try {
			await fetch(`${serverUrl}/tasks/export/${modelUuid}?overwrite=true`, {
				method: 'POST',
			})
		} catch (error) {
			console.error(error)
		}
	}

	const step1ConfirmHandler = (videoId: string): void => {
		fetchVideoMetadata(videoId)
	}

	const step2ConfirmHandler = (): void => {
		trackObjects()
		setStep(3)
	}

	const step3ConfirmHandler = async () => {
		const checkAnnotationStatus = async () => {
			const status = await isAnnotationReady()
			if (status === 'ready') {
				await exportAnnotation()
			} else if (status !== 'failed') {
				setTimeout(checkAnnotationStatus, 1000)
			}
		}

		await checkAnnotationStatus()
		setStep(1)
		clearHandler()
	}

	return (
		<div className="flex p-6 h-dvh gap-4 bg-black">
			{step === 1 && (
				<Aside
					step={step}
					confirmButtonOptions={{ text: !selectedVideo ? 'Please select a video' : 'Continue', disabled: !selectedVideo, loading: fetching }}
					footerConfirmHandler={() => step1ConfirmHandler(selectedVideo!.video_id)}
				>
					<FramerList
						setAiModel={setAiModel}
						scale={scale}
						setScale={setScale}
						aiModel={aiModel}
						setFetching={setFetching}
						selectedVideo={selectedVideo}
						setSelectedVideo={setSelectedVideo}
					/>
				</Aside>
			)}

			{step === 2 && (
				<Aside
					video={video}
					step={step}
					fetching={fetching}
					selectedVideo={selectedVideo}
					selectedObject={selectedObject}
					confirmButtonOptions={{ text: 'Track Objects', loading: fetching, show: video.objects.length > 0 }}
					cancelButtonOptions={{ show: true, text: 'Start Over', child: <Refresh className="mr-1" />, type: 'danger' }}
					footerConfirmHandler={step2ConfirmHandler}
					footerCancelHandler={startOverHandler}
				>
					<Basket
						description={
							'Adjust the selection of your object, or add additional objects. Press “Track objects” to track your objects throughout the video.'
						}
						video={video}
						setStep={setStep}
						step={step}
						thumbnails={thumbnails}
						createObject={createObject}
						selectedObject={selectedObject}
						setSelectedObject={setSelectedObject}
						deleteObject={deleteObject}
						loadedImages={loadedImages}
					/>
				</Aside>
			)}
			{step === 3 && (
				<Aside
					step={step}
					cancelButtonOptions={{ show: true, text: 'Start Over', child: <Refresh className="mr-1" />, type: 'danger' }}
					confirmButtonOptions={{ show: true, text: 'Export' }}
					footerCancelHandler={startOverHandler}
					footerConfirmHandler={step3ConfirmHandler}
				>
					<Basket
						description={'Adjust the selection of your object.'}
						video={video}
						setStep={setStep}
						step={step}
						thumbnails={thumbnails}
						createObject={createObject}
						selectedObject={selectedObject}
						setSelectedObject={setSelectedObject}
						deleteObject={deleteObject}
						loadedImages={loadedImages}
					/>
				</Aside>
			)}

			<FramePlayer
				cachedImages={cachedImages}
				video={video}
				addChild={addChild}
				loadedImages={loadedImages}
				frameDuration={frameDuration}
				fps={fps}
				setSelectedObject={setSelectedObject}
				selectedObject={selectedObject}
				markerType={markerType}
				setMarkerType={setMarkerType}
				removeMarker={removeMarker}
				step={step}
				fetching={fetching}
				ref={framePlayerRef}
			/>
		</div>
	)
}

export default App
