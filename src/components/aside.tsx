import React, { ReactNode } from 'react'
import './aside.scss'
import Button from './button.tsx'

const stepsTitle: { [key: number]: string } = {
	1: 'Select Video',
	2: 'Select Object',
	3: 'Track Objects',
}

interface ButtonOptions {
	show?: boolean
	[key: string]: any
}

interface AsideProps {
	children: ReactNode
	step: number
	footerConfirmHandler: () => void
	footerCancelHandler: () => void
	confirmButtonOptions?: ButtonOptions
	cancelButtonOptions?: ButtonOptions
}

const Aside: React.FC<AsideProps> = ({ children, step, footerConfirmHandler, footerCancelHandler, confirmButtonOptions = {}, cancelButtonOptions = {} }) => {
	const defaultConfirmButtonOptions = {
		show: true,
		...confirmButtonOptions,
	}

	const defaultCancelButtonOptions = {
		show: false,
		...cancelButtonOptions,
	}

	return (
		<div className="aside">
			<div className="aside__header">
				<div className="flex gap-2 items-center">
					<div className="steps">{step}/3</div>
					<div className="text-xl">{stepsTitle[step]}</div>
				</div>
			</div>

			<div className="aside__content">{children}</div>

			<div className={`aside__footer ${step > 1 ? 'justify-between' : 'self-end'}`}>
				{defaultCancelButtonOptions.show && <Button onClick={footerCancelHandler} {...defaultCancelButtonOptions} type="danger" />}
				{defaultConfirmButtonOptions.show && <Button onClick={footerConfirmHandler} {...defaultConfirmButtonOptions} />}
			</div>
		</div>
	)
}

export default Aside
