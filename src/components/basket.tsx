import React from 'react'
import BasketItem from './basketItem.tsx'
import './basket.scss'
import { ReactComponent as PlusIcon } from '@assets/svg/plus.svg'
import { Video } from '../types'

interface BasketProps {
	video: {
		objects: {
			id: string
			title: string
			objectColor: string
			child: any[]
		}[]
	}
	thumbnails: object
	createObject: (object: { frameNumber: number | null; x: number | null; y: number | null }) => void
	selectedObject: { id: string } | null
	setSelectedObject: (object: { id: string; title: string; objectColor: string; child: any[] }) => void
	deleteObject: (id: string) => void
	description: string
	step: number
	setVideo: (video: Video) => void
}

const Basket: React.FC<BasketProps> = ({ video, step, thumbnails, createObject, selectedObject, setSelectedObject, deleteObject, description, setVideo }) => {
	const handleCreateObject = () => {
		createObject({ frameNumber: null, x: null, y: null })
	}

	const onSaveObjectTitle = (title: string) => {
		const objectIndex = video.objects.findIndex((o) => o.id === selectedObject?.id)
		const videoObjects = [...video.objects]
		videoObjects.splice(objectIndex, 1, { ...selectedObject, title })

		setVideo({ ...video, objects: videoObjects })
	}

	const list = () => {
		return (
			<div className="basket">
				<div className="basket__header">
					<p>{description}</p>
				</div>

				<div className="basket__items scroll">
					{video.objects.map((object) => (
						<BasketItem
							key={`bi-${object.id}`}
							object={object}
							step={step}
							selectedObject={selectedObject}
							setSelectedObject={setSelectedObject}
							deleteObject={deleteObject}
							onSaveObjectTitle={onSaveObjectTitle}
							thumbnails={thumbnails}
						/>
					))}

					{video.objects[video.objects.length - 1].child.length > 0 && step !== 3 && (
						<button className="flex gap-6 items-center p-2 cursor-pointer transition-opacity hover:opacity-80" onClick={handleCreateObject}>
							<div className="border border-white relative h-12 w-12 md:w-20 md:h-20 shrink-0 rounded-lg flex items-center justify-center">
								<PlusIcon style={{ width: 120, color: 'white' }} />
							</div>
							<div className="font-medium text-white">Add another object</div>
						</button>
					)}
				</div>
			</div>
		)
	}

	const empty = () => {
		return <h1 className="text-center text-2xl text-white">Click an object in the video to start</h1>
	}

	return video?.objects?.length > 0 ? list() : empty()
}

export default Basket
