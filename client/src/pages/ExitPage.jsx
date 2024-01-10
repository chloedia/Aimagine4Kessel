import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./VisualSelection.module.css";

async function checkTokenValidity() {
	const token = localStorage.getItem("token");

	if (!token) {
		return false;
	}

	try {
		const response = await fetch(
			"http://localhost:8080/api/auth/validate",
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (response.ok) {
			const data = await response.json();
			return data.valid;
		} else {
			// If the token is invalid or expired, clear it from localStorage
			localStorage.removeItem("token");
			return false;
		}
	} catch (error) {
		console.error("Error validating token:", error);
		return false;
	}
}

export default function ExitPage() {
	const navigate = useNavigate();
	const [currentUser, setCurrentUser] = useState(null);

	useEffect(() => {
		const fetchCurrentUser = async () => {
			const token = localStorage.getItem("token");
			checkTokenValidity();
			if (token) {
				try {
					const response = await fetch(
						"http://localhost:8080/api/current-user",
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					);
					const data = await response.json();
					if (response.ok) {
						console.log(data);
						setCurrentUser(data);
					} else {
						console.error("Failed to fetch user data:", data.error);
					}
				} catch (error) {
					console.error("Error fetching user data:", error);
				}
			}
		};

		fetchCurrentUser();
	}, []);

	const handleLogOut = () => {
		localStorage.removeItem("token");
		navigate("/");
	};

	return (
		<>
			<div className="header">
				<img className="logo" alt="logo" src="/logo.png" />
				<div className="user">
					{currentUser ? currentUser.newsLetterId : ""}
				</div>
			</div>

			<div className="content">
				<div className="form-container">
					<div className="form">
						<h1>Super choix, merci pour votre contribution !</h1>
						<hr />
						<p>
							Nous allons faire part de votre choix au plus vite à
							Kessel...
						</p>
					</div>
				</div>
				<div className="info-container">
					<div>
						<img
							src="/img/IllustrationValidate.png"
							alt="Description of Illustration"
						/>

						<p>
							Aimagine vous permet de proposer des publicités
							adaptées à la charte graphique de votre contenu ...
						</p>
					</div>
					<div className="logoutWrapper">
						<button onClick={handleLogOut}>
							<img
								src="/img/logout.png"
								alt="Déconnexion Icon"
								style={{ marginRight: "5px" }}
							/>
							Déconnexion
						</button>
					</div>
				</div>
			</div>
		</>
	);
}
