import React, { useState, useEffect } from "react";
import "./SignInPage.module.css";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
	const navigate = useNavigate();
	const [newsLetterIds, setNewsLetterIds] = useState([]);
	const [selectedNewsLetterId, setSelectedNewsLetterId] = useState("");
	const [loginError, setLoginError] = useState(false); // State to track login error

	const [password, setPassword] = useState("");

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			navigate("/visual-selection");
		}
	}, [navigate]);

	useEffect(() => {
		const fetchUserIDs = async () => {
			try {
				const response = await fetch(
					"https://aimagine-kessel.vercel.app/api/users"
				);
				const data = await response.json();
				if (response.ok) {
					const newsletterIds = data.map((user) => user.newsLetterId);
					setNewsLetterIds(newsletterIds);

					// Check if there are any newsletter IDs and set the first one
					if (newsletterIds.length > 0) {
						setSelectedNewsLetterId(newsletterIds[0]);
					}
				} else {
					console.error("Failed to fetch user IDs:", data.error);
					setLoginError(true); // Set login error
				}
			} catch (err) {
				console.error("Request failed", err);
				setLoginError(true); // Set login error
			}
		};

		fetchUserIDs();
	}, []);

	const handleLogin = async () => {
		try {
			const response = await fetch(
				"https://aimagine-kessel.vercel.app/api/login",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						newsLetterId: selectedNewsLetterId,
						password: password,
					}),
				}
			);

			const data = await response.json();
			if (response.ok) {
				localStorage.setItem("token", data.token);
				navigate("/visual-selection");
			} else {
				setLoginError(true); // Set login error
			}
		} catch (err) {
			console.error("Login request failed", err);
			setLoginError(true); // Set login error
		}
	};

	return (
		<>
			<div className="header">
				<img className="logo" alt="logo" src="/logo.png" />
			</div>
			<div className="content">
				<div className="form-container">
					<div className="form">
						<h1>Connectez-vous</h1>
						<hr />
						<div className="form-elmt">
							<label htmlFor="newsletter">
								Quel journaliste êtes vous ?
							</label>
							<select
								id="newsletter"
								value={selectedNewsLetterId}
								onChange={(e) =>
									setSelectedNewsLetterId(e.target.value)
								}
							>
								{newsLetterIds.map((id) => (
									<option key={id} value={id}>
										{id}
									</option>
								))}
							</select>
						</div>
						<div className="form-elmt">
							<label htmlFor="code">Code donné par Kessel</label>
							<input
								id="code"
								type="password"
								placeholder="Code"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
							{loginError && (
								<div className="error-message">
									Invalid login credentials.
								</div>
							)}
						</div>
					</div>
				</div>
				<div className="info-container">
					<img
						src="/img/Illustration1.png"
						alt="Description of Illustration"
					/>
					<p>
						Aimagine vous permet de proposer des publicités adaptées
						à la charte graphique de votre contenu ...
					</p>
					<button type="button" onClick={handleLogin}>
						Continuer
					</button>
				</div>
			</div>
		</>
	);
};

export default SignIn;
