import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router"
import "@workspace/ui/globals.css"

import { Shell } from "./shell"
import Feed from "./routes/feed"
import Thread from "./routes/thread"

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route element={<Shell />}>
					<Route index element={<Feed />} />
					<Route path="thread/:id" element={<Thread />} />
				</Route>
			</Routes>
		</BrowserRouter>
	</StrictMode>,
)
