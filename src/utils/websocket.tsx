import { WebsocketMessage } from '@types/index.tsx'

export class Websocket {
	private socket: WebSocket | null = null
	private readonly url: string
	private messageHandlers: Set<(data: any) => void> = new Set()

	constructor(url: string) {
		this.url = url
	}

	public connect(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.socket = new WebSocket(this.url)

			this.socket.onopen = (event: Event) => {
				resolve()
			}

			this.socket.onmessage = this.handleMessage.bind(this)
			this.socket.onclose = this.onClose.bind(this)

			this.socket.onerror = (event: Event) => {
				console.error('WebSocket Error:', event)
				reject(event)
			}
		})
	}

	private handleMessage(event: MessageEvent): void {
		const data = JSON.parse(event.data)
		this.messageHandlers.forEach((handler) => handler(data))
	}

	public addMessageHandler(handler: (data: WebsocketMessage) => void): void {
		this.messageHandlers.add(handler)
	}

	public removeMessageHandler(handler: (data: WebsocketMessage) => void): void {
		this.messageHandlers.delete(handler)
	}

	private onClose(event: CloseEvent): void {
		console.log('WebSocket connection closed:', event)
		this.socket = null
	}

	public send(message: string): void {
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.send(message)
		} else {
			console.error('Websocket Connection Is Offline')
		}
	}

	public close(): void {
		if (this.socket) {
			this.socket.close()
		}
	}
}
