import React, { useState, ChangeEvent, FocusEvent } from 'react'

interface EditableTextProps {
	text: string
	onSave: (text: string) => void
}

const EditableText: React.FC<EditableTextProps> = ({ text, onSave }) => {
	const [isEditing, setIsEditing] = useState<boolean>(false)
	const [currentText, setCurrentText] = useState<string>(text)
	const defaultText = text

	const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
		setIsEditing(false)

		if (currentText) onSave(currentText)
		else setCurrentText(defaultText)
	}

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setCurrentText(e.target.value)
	}

	return (
		<div>
			{isEditing ? (
				<input
					type="text"
					value={currentText}
					onChange={handleChange}
					onBlur={handleBlur}
					autoFocus
					className="w-full bg-transparent placeholder:text-slate-400 text-slate-400 text-xs border border-slate-200 rounded-md pl-3 pr-28 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
				/>
			) : (
				<span onClick={() => setIsEditing(true)} className="cursor-pointer text-white leading-8 hover:text-blue-200 transition duration-300">
					{currentText}
				</span>
			)}
		</div>
	)
}

export default EditableText
