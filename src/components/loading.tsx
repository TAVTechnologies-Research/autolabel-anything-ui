import React from 'react'
import './loader.scss'

interface LoadingProps {
	show: boolean
}

const Loading: React.FC<LoadingProps> = ({ show }) => {
	return show ? <div className="loader"></div> : null
}

export default Loading
