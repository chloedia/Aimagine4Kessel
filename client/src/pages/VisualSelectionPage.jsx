import React, { useDebugValue, useEffect, useState } from "react";
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

function Campaign({
	campaign,
	onSelectVisual,
	selections,
	showSelected,
	last = false,
}) {
	const handleCopyClick = async (distantUrl) => {
		try {
			const response = await fetch(distantUrl);
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			const htmlCode = await response.text();
			await navigator.clipboard.writeText(htmlCode);
			console.log("HTML code copied to clipboard:", htmlCode);
		} catch (error) {
			console.error("Error fetching or copying HTML code:", error);
		}
	};
	const renderVisuals = (visuals) => {
		return visuals
			.filter(
				(visual) =>
					!showSelected ||
					selections[campaign.name]?.visual?.id === visual.id
			)
			.map((visual) => (
				<div
					className={`${styles.visualContainer} ${
						selections[campaign.name]?.visual?.id === visual.id
							? styles.selected
							: ""
					} ${
						visual.status === "personalized"
							? styles.personalized
							: ""
					}`}
					key={visual.id}
					onClick={() => onSelectVisual(visual.id)}
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
						<button onClick={() => handleCopyClick(visual.src)}>
							Copy HTML Code
						</button>
					</div>
				</div>
			));
	};
	return (
		<div>
			<h2>{campaign.name}</h2>
			{campaign?.personalized_visuals && !last && (
				<h3>Personnalisé pour vous</h3>
			)}
			{campaign?.personalized_visuals &&
				renderVisuals(campaign?.personalized_visuals)}
			{!last && <h3>Alternatives</h3>}
			{renderVisuals(campaign?.agnostic_visuals)}
		</div>
	);
}

export default function VisualSelection() {
	const [selections, setSelections] = useState({});
	const [campaigns, setCampaigns] = useState([]);
	const [steps, setSteps] = useState([]);

	const [currentStep, setCurrentStep] = useState(0);
	const [currentUser, setCurrentUser] = useState(null);
	const currentCampaign = steps[currentStep];

	const navigate = useNavigate();

	useEffect(() => {
		const fetchCampaign = async () => {
			checkTokenValidity();
			try {
				const token = localStorage.getItem("token");
				const response = await fetch(
					"http://localhost:8080/api/campaigns",
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
				const data = await response.json();
				if (response.ok) {
					setCampaigns(data);
					console.log(data);
					const campaignNames = data.map((data) => data.name);
					setSteps([...campaignNames, "Valider"]);

					const campaignDict = {};
					data.forEach((data) => {
						campaignDict[data.name] = {
							visual: null,
							trackdUrl: "",
						};
					});

					setSelections(campaignDict);
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

		fetchCampaign();

		fetchCurrentUser();
	}, []);

	const handleInputChange = (e) => {
		const inputValue = e.target.value;
		const campaignName = steps[currentStep];

		setSelections({
			...selections,
			[campaignName]: {
				...selections[campaignName],
				trackdUrl: inputValue,
			},
		});

		console.log("Selections : ", selections);
	};
	const handleSelectVisual = (visualId) => {
		// Find the current campaign
		const currentCampaignObject = campaigns.find(
			(campaign) => campaign.name === currentCampaign
		);

		if (!currentCampaignObject) {
			console.error("Current campaign not found");
			return;
		}

		// Find the selected visual within the current campaign
		const selectedVisual =
			currentCampaignObject.personalized_visuals.find(
				(visual) => visual.id === visualId
			) ||
			currentCampaignObject.agnostic_visuals.find(
				(visual) => visual.id === visualId
			);

		if (!selectedVisual) {
			console.error("Selected visual not found");
			return;
		}

		// Update selections with the entire visual object
		setSelections({
			...selections,
			[currentCampaign]: {
				...selections[currentCampaign],
				visual: selectedVisual,
			},
		});

		console.log("Selections : ", selections);
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

				// Use Promise.all to wait for all fetch operations to complete
				await Promise.all(
					Object.entries(selections).map(
						async ([campaignID, { visual, trackedUrl }]) => {
							await fetch(
								"http://localhost:8080/api/user-choice",
								{
									method: "POST",
									headers: {
										"Content-Type": "application/json",
										Authorization: `Bearer ${token}`,
									},
									body: JSON.stringify({
										campaignID,
										visualId: visual.id,
										tracked_link: trackedUrl,
									}),
								}
							);
						}
					)
				);

				// Navigate after all fetch operations are complete
				navigate("/exit-page");
			} catch (err) {
				console.error("Failed to submit choices", err);
			}
		}
	};

	return (
		<>
			<div className="header">
				<img className="logo" alt="logo" src="/img/logo.png" />
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
									last={currentStep === campaigns.length}
								/>
							))
						)}
					</div>
				</div>

				<div className="info-container">
					<div>
						{currentStep < campaigns.length ? (
							<img
								alt="advertiser logo"
								src={campaigns[currentStep].logo_url}
							/>
						) : (
							<img
								alt="Validation_img"
								src="/img/Illustration1.png"
							/>
						)}

						<h1>
							{currentStep < campaigns.length
								? "Objectif de la campagne"
								: "Valider vos choix"}
						</h1>
						<p>{campaigns[currentStep]?.description}</p>
					</div>

					{currentStep < campaigns.length &&
						selections[currentCampaign]?.visual && (
							<div>
								<h1>
									{selections[currentCampaign]?.visual?.id}
								</h1>
								<p>
									{
										selections[currentCampaign]?.visual
											?.description
									}
								</p>
							</div>
						)}
					<form action={handleButtonClick}>
						{currentStep < campaigns.length && (
							<div>
								<label>Votre lien traqué</label>
								<input
									type="text"
									name="trackdUrl"
									id="trackdUrl"
									required
									minLength="5"
									value={
										selections[currentCampaign].trackdUrl
									}
									onChange={handleInputChange}
								/>
							</div>
						)}

						<button
							type="button"
							onClick={handleButtonClick}
							disabled={
								currentStep < campaigns.length &&
								!(
									selections[currentCampaign]?.visual &&
									selections[currentCampaign]?.trackdUrl
								)
							}
						>
							{currentStep < campaigns.length
								? "Continuer"
								: "Valider"}
						</button>
					</form>

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
