import React from 'react'
import EditableInput from './editableInput.tsx'

interface BasketItemProps {
	object: {
		id: string
		title: string
		objectColor: string
		child: any[]
		thumbnail: string
	}
	selectedObject: { id: string } | null
	setSelectedObject: (object: { id: string; title: string; objectColor: string; child: any[] }) => void
	deleteObject: (id: string) => void
	onSaveObjectTitle: (title: string) => void
	thumbnails: object
	step: number
}

const BasketItem: React.FC<BasketItemProps> = ({ object, step, thumbnails, selectedObject, setSelectedObject, deleteObject, onSaveObjectTitle }) => {
	return (
		<div
			className={`basket__item transition-opacity hover:opacity-90`}
			style={{ border: `2px dotted ${object.id === selectedObject?.id ? object.objectColor : 'transparent'}` }}
			onClick={() => setSelectedObject(object)}
		>
			<img
				src={thumbnails[object.id] ? `data:image/webp;base64,${thumbnails[object.id]}` : 'https://picsum.photos/id/237/100/100'}
				className="w-[100px] h-[100px] object-cover rounded-lg"
				alt="object"
			/>
			<div className="flex flex-col flex-1 justify-between">
				<div className="text-white font-medium">
					<EditableInput text={object.title} onSave={onSaveObjectTitle} />
				</div>

				{object.child.length > 0 ? (
					<>
						<div className="text-sm text-slate-600">{`Markers: ${object.child.length}`}</div>
						{step !== 3 && (
							<button
								type="button"
								className="self-end focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-2 py-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
								onClick={() => deleteObject(object.id)}
							>
								Remove
							</button>
						)}
					</>
				) : (
					<div className="text-slate-600">No object is currently selected. Click an object in the video.</div>
				)}
			</div>
		</div>
	)
}

export default BasketItem
