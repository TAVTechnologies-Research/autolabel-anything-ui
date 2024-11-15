import { useLocation } from 'react-router-dom'

interface Params {
	scale: number | string
	startFrame: number | string
}

export default function useParams(): Params {
	const location = useLocation()
	const queryParams = new URLSearchParams(location.search)
	const scale = queryParams.get('scale') || process.env?.REACT_APP_SCALE || 0.5
	const startFrame = queryParams.get('startFrame') || process.env?.REACT_APP_START_FRAME || 0

	return {
		scale: typeof scale === 'string' ? parseFloat(scale) : scale,
		startFrame: typeof startFrame === 'string' ? parseInt(startFrame, 10) : startFrame,
	}
}
