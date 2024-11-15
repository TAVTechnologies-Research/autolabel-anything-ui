export interface VideoMarker {
	id: string
	frameNumber: number
	x: number
	y: number
	markerType: number
}

export interface VideoObject {
	id: string
	title: string
	objectColor: string
	label?: string
	child: VideoMarker[]
}

export interface Video {
	video_id: string | null
	objects: VideoObject[]
}

export interface SelectedVideo {
	video_id: string
}

export interface Websocket {
	connect: () => void
	close: () => void
	addMessageHandler: (handler: (message: WebsocketMessage) => void) => void
}

export interface WebsocketMessage {
	msg_type: string
	data: Object
	error: string | null
	meta: Object | null
	message: string | null
}

export interface AIModel {
	ai_model_id: number
	ai_model_name: string
	checkpoint_path: string
	config_path: string
}
