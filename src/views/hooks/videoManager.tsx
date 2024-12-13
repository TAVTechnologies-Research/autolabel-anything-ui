import { useState } from 'react'
import { Video, VideoObject, VideoMarker } from '@types/index.tsx'
import { objectColor } from '@utils/index.tsx'
import { v4 as uuidv4 } from 'uuid'

const filterByFrameNumber = (data: VideoObject[], frameNumber: number): VideoObject[] => {
	return [...data]
		.map((obj: VideoObject) => ({
			...obj,
			child: obj.child.filter((marker: VideoMarker) => marker.frameNumber === frameNumber),
		}))
		.filter((obj) => obj.child.length > 0)
}

const useVideoManager = (ws) => {
	const [video, setVideo] = useState<Video>({
		video_id: null,
		objects: [],
	})
	const [scale, setScale] = useState<number>(1)
	const [fps, setFps] = useState<number>(25)
	const [frameDuration, setFrameDuration] = useState<number>(1000 / fps)
	const [selectedObject, setSelectedObject] = useState<VideoObject | undefined>(undefined)

	const createObject = ({ frameNumber }: { frameNumber: number }): Promise<VideoObject> => {
		if (video.objects.some((item) => item.child.some((child) => child.frameNumber === frameNumber))) {
			return Promise.reject('Frame already exists')
		}

		const uuid = uuidv4()
		const newObject: VideoObject = {
			id: uuid,
			title: `Object ${video.objects.length + 1}`,
			objectColor: objectColor(video.objects.length),
			child: [],
		}

		const newVideo = {
			...video,
		}

		newVideo.objects.push({ ...newObject })
		setVideo(newVideo)
		setSelectedObject(newObject)
		return Promise.resolve(newObject)
	}

	const removeObject = (data: VideoObject[]) => {
		const wsMessageObject = {
			msg_type: 'remove_object',
			data: [...data.map((item) => item.id)],
			meta: { returnType: 'frame', scale },
		}
		const wsMessage = JSON.stringify(wsMessageObject)
		ws.send(wsMessage)
	}

	const addMarker = (data: VideoObject[]) => {
		const wsMessageObject = {
			msg_type: 'add_points',
			data: [...data].map((i) => ({ ...i, label: i.title })),
			meta: { returnType: 'frame', scale, returnObjectThumbnail: true },
		}
		const wsMessage = JSON.stringify(wsMessageObject)
		ws.send(wsMessage)
	}

	const addChild = async ({ frameNumber, x, y, markerType }: { frameNumber: number; x: number; y: number; markerType: number }): Promise<void> => {
		if (!x) return

		let newObject = null

		if (!selectedObject || video.objects.length === 0) {
			newObject = await createObject({ frameNumber })
		}

		const uuid = uuidv4()
		const newChild = {
			id: uuid,
			frameNumber,
			x,
			y,
			markerType,
		}

		const newVideo = {
			...video,
		}

		const findedObject = newVideo.objects.find((item) => item.id === (newObject?.id || selectedObject?.id))

		if (findedObject) {
			findedObject.child.push({ ...newChild })
		}

		const wsData = filterByFrameNumber(newVideo.objects, frameNumber)

		addMarker(wsData)
		setVideo(newVideo)
	}

	const deleteObject = (objectId: string): void => {
		const stateVideo = { ...video }
		const index = video.objects.findIndex((a) => a.id === objectId)

		if (index > -1) {
			const removedObject = stateVideo.objects.splice(index, 1)
			removeObject(removedObject)
			setVideo(stateVideo)
		}
	}

	const removeMarker = (childId: string, frameIndex: number): void => {
		const newVideo = {
			...video,
			objects: video.objects.map((object) => ({
				...object,
				child: object.child.filter((child) => child.id !== childId),
			})),
		}
		const wsData = filterByFrameNumber(newVideo.objects, frameIndex)

		addMarker(wsData)
		setVideo(newVideo)
	}

	const trackObjects = () => {
		const wsMessageObject = {
			msg_type: 'run_inference',
			data: [...video.objects].map((i) => ({ ...i, label: i.title })),
			meta: { returnType: 'frame', scale },
		}
		const wsMessage = JSON.stringify(wsMessageObject)
		ws.send(wsMessage)
	}

	const clearVideo = (): void => {
		setVideo({
			video_id: null,
			objects: [],
		})
	}

	return {
		video,
		setVideo,
		createObject,
		removeObject,
		addChild,
		deleteObject,
		clearVideo,
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
	}
}

export default useVideoManager
