import { useRef, useState } from 'react'

const useCacheImages = () => {
	const cachedImagesRef = useRef({})
	const [cachedImages, setCachedImages] = useState([])

	const cacheImageUpdate = (item: { image_base64: string }, index: number): Promise<HTMLImageElement> => {
		return new Promise((resolve, reject) => {
			const img = new Image()
			img.src = `data:image/webp;base64,${item.image_base64}`
			img.onload = () => {
				cachedImagesRef.current[index] = img
				setCachedImages(Object.values(cachedImagesRef.current))
				resolve(img)
			}
			img.onerror = () => reject(new Error(`Failed to load image: ${item}`))
		})
	}

	const cacheImages = async (images: { image_base64: string }[]): Promise<void> => {
		await Promise.all(
			images.map((item, index) => {
				if (!cachedImagesRef.current[index]) {
					return cacheImageUpdate(item, index)
				} else {
					return Promise.resolve(cachedImagesRef.current[index])
				}
			}),
		)
	}

	const cachedImagesClear = () => {
		cachedImagesRef.current = {}
		setCachedImages([])
	}

	return { cacheImages, cacheImageUpdate, cachedImages, cachedImagesClear }
}

export default useCacheImages
