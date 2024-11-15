import * as React from 'react'
import { createRoot } from 'react-dom/client'
import './assets/css/index.scss'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './views/main.tsx'

const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
	},
])

createRoot(document.getElementById('root') as HTMLElement).render(<RouterProvider router={router} />)
