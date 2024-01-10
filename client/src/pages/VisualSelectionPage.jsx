import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./VisualSelection.module.css";

import StepTracker from "../components/StepTracker";

async function checkTokenValidity() {
	const token = localStorage.getItem("token");

	if (!token) {
		return false;
	}

	try {
		const response = await fetch(
			"https://aimagine-kessel.vercel.app/api/auth/validate",
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

function Campaign({ campaign, onSelectVisual, selections, showSelected }) {
	return (
		<div>
			<h2>{campaign.name}</h2>
			{campaign.visuals
				.filter(
					(visual) =>
						!showSelected || selections[campaign.id] === visual.id
				)
				.map((visual) => (
					<div
						className={`${styles.visualContainer} ${
							selections[campaign.id] === visual.id
								? styles.selected
								: ""
						}`}
						key={visual.id}
						onClick={() => onSelectVisual(campaign.id, visual.id)}
					>
						<div className={styles.infoWrapper}>
							<label className={styles.id}>{visual.id}</label>
							<label className={styles.dim}>{visual.dim}</label>
						</div>
						<iframe
							src={visual.src}
							title="visual"
							height="238"
							width="100%"
						></iframe>
						<div className={styles.buttonWrapper}>
							<button>Copy html code</button>
						</div>
					</div>
				))}
		</div>
	);
}

export default function VisualSelection() {
	const [currentStep, setCurrentStep] = useState(0);
	const [steps, setSteps] = useState([]);
	const navigate = useNavigate();
	const [selections, setSelections] = useState({});
	const [campaigns, setCampaigns] = useState([]);
	const [currentUser, setCurrentUser] = useState(null);

	useEffect(() => {
		const fetchCampaign = async () => {
			checkTokenValidity();
			try {
				const response = await fetch(
					"https://aimagine-kessel.vercel.app/api/campaigns"
				);
				const data = await response.json();
				if (response.ok) {
					setCampaigns(data);

					const campaignNames = data.map((campaign) => campaign.name);
					setSteps([...campaignNames, "Valider"]);
				} else {
					console.error("Failed to fetch campaigns:", data.error);
				}
			} catch (err) {
				console.error("Request failed", err);
			}
		};

		const fetchCurrentUser = async () => {
			const token = localStorage.getItem("token");
			if (token) {
				try {
					const response = await fetch(
						"https://aimagine-kessel.vercel.app/api/current-user",
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

		fetchCampaign();
		fetchCurrentUser();
	}, []);

	const handleSelectVisual = (campaignId, visualId) => {
		setSelections({ ...selections, [campaignId]: visualId });
	};

	const handleLogOut = () => {
		localStorage.removeItem("token");
		navigate("/");
	};

	const handleButtonClick = async () => {
		if (currentStep < campaigns.length) {
			setCurrentStep(currentStep + 1);
		} else {
			try {
				const token = localStorage.getItem("token");
				if (!token) {
					console.error("No token found");
					return;
				}

				for (const [campaignId, visualId] of Object.entries(
					selections
				)) {
					await fetch(
						"https://aimagine-kessel.vercel.app/api/user-choice",
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								Authorization: `Bearer ${token}`,
							},
							body: JSON.stringify({ campaignId, visualId }),
						}
					);
				}

				navigate("/exit-page");
			} catch (err) {
				console.error("Failed to submit choices", err);
			}
		}
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
				<StepTracker
					steps={steps}
					currentStep={currentStep}
					setCurrentStep={setCurrentStep}
				/>
				<div className="form-container">
					<div className="form">
						<h1>
							{currentStep < campaigns.length
								? "Choisissez votre visuel"
								: "Validez vos choix"}
						</h1>
						<hr />
						{currentStep < campaigns.length ? (
							<Campaign
								key={campaigns[currentStep].id}
								campaign={campaigns[currentStep]}
								onSelectVisual={handleSelectVisual}
								selections={selections}
								showSelected={false}
							/>
						) : (
							campaigns.map((campaign) => (
								<Campaign
									key={campaign.id}
									campaign={campaign}
									onSelectVisual={() => console.log("ok")}
									selections={selections}
									showSelected={true}
								/>
							))
						)}
					</div>
				</div>

				<div className="info-container">
					<div>
						<h1>Objectif de la campagne</h1>
						<p>
							Lorem ipsum dolor sit amet, consectetur adipiscing
							elit, sed do eiusmod tempor incididunt ut labore et
							dolore magna aliqua. Ut enim ad minim veniam
						</p>
					</div>

					{currentStep < campaigns.length &&
						selections[campaigns[currentStep].id] && (
							<div>
								<h1>{selections[campaigns[currentStep].id]}</h1>
								<p>
									Lorem ipsum dolor sit amet, consectetur
									adipiscing elit, sed do eiusmod tempor
									incididunt ut labore et dolore magna aliqua.
									Ut enim ad minim veniam
								</p>
							</div>
						)}

					<button
						className={`${
							currentStep === campaigns.length ||
							(currentStep < campaigns.length &&
								selections[campaigns[currentStep].id])
								? ""
								: "notSelected"
						}`}
						type="button"
						onClick={handleButtonClick}
						disabled={
							currentStep < campaigns.length &&
							!selections[campaigns[currentStep].id]
						}
					>
						{currentStep < campaigns.length
							? "Continuer"
							: "Valider"}
					</button>

					<div className="logoutWrapper">
						<button className="logout" onClick={handleLogOut}>
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
