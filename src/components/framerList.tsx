import React, { useEffect, useState } from 'react'
import './framerList.scss'
import Search from './search.tsx'
import VideoSettings from './videoSettings.tsx'

interface Video {
	video_id: string
	video_name: string
	created_at: string
	status: string
	thumbnail: {
		image_base64: string
		height: number
		width: number
	}
}

interface FramerListProps {
	setFetching: (fetching: boolean) => void
	selectedVideo: Video | null
	setSelectedVideo: (video: Video) => void
	setAiModel: (model: any) => void
	setScale: (scale: number) => void
	aiModel: any
	scale: number
}

const FramerList: React.FC<FramerListProps> = ({ setAiModel, setScale, aiModel, scale, setFetching, selectedVideo, setSelectedVideo }) => {
	const [videos, setVideos] = useState<Video[]>([])
	const [filterText, setFilterText] = useState<string>('')

	useEffect(() => {
		setFetching(true)
		const serverUrl = process.env?.REACT_APP_SERVER_URL

		const fetchAllList = () => {
			fetch(`${serverUrl}/videos?thumbnail=true`)
				.then((res) => res.json())
				.then((data: Video[]) => {
					const filteredData = data.filter((item) => item.status === 'ready')
					setVideos(filteredData)
				})
				.catch((err) => console.error(err))
				.finally(() => setFetching(false))
		}

		fetchAllList()
	}, [setFetching])

	const formatDate = (dateString: string): string => {
		const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
		const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
		const date = new Date(dateString)
		return `${date.toLocaleDateString(undefined, options)} ${date.toLocaleTimeString(undefined, timeOptions)}`
	}

	const onSearch = (text: string) => setFilterText(text)

	return (
		<div className="frames">
			<div className="frames__content">
				<Search onSearch={onSearch} value={filterText} />
				<VideoSettings setAiModel={setAiModel} setScale={setScale} aiModel={aiModel} scale={scale} onSearch={onSearch} value={filterText} />

				{videos
					.filter((v) => v.video_name.toLowerCase().includes(filterText.toLowerCase()))
					.map((v, index) => (
						<div
							key={`frames-${index}`}
							className={`content-item ${v.video_id === selectedVideo?.video_id ? 'selected' : ''}`}
							onClick={() => setSelectedVideo(v)}
						>
							<img src={`data:image/webp;base64,${v.thumbnail.image_base64}`} alt="video" />
							<div>
								<div>Video Name: {v.video_name}</div>
								<div>Created Date: {formatDate(v.created_at)}</div>
							</div>
						</div>
					))}
			</div>
		</div>
	)
}

export default FramerList
