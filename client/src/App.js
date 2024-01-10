import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import VisualSelectionPage from "./pages/VisualSelectionPage";
import ExitPage from "./pages/ExitPage";
import SignIn from "./pages/SignInPage";
import ProtectedRoute from "./components/ProtectedRoute"; // Import your ProtectedRoute

const App = () => {
	return (
		<Router>
			<Routes>
				<Route path="/login" element={<SignIn />} />
				<Route
					path="/visual-selection"
					element={
						<ProtectedRoute>
							<VisualSelectionPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/exit-page"
					element={
						<ProtectedRoute>
							<ExitPage />
						</ProtectedRoute>
					}
				/>
				{/* Redirect all other paths to login */}
				<Route path="/" element={<Navigate to="/login" replace />} />
			</Routes>
		</Router>
	);
};

export default App;
