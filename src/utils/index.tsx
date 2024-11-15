export const objectColor = (index: number): string => {
	const palet: { [key: number]: string } = {
		0: '#FF5722FF',
		1: '#FFC107FF',
		2: '#3880F3FF',
	}

	const randomColor = (): string =>
		'#' +
		Math.floor(Math.random() * 16777215)
			.toString(16)
			.padStart(6, '0')

	return palet[index] || randomColor()
}
