import React from "react";
import "./StepTracker.css"; // Make sure to create a corresponding CSS file

function StepTracker({ steps, currentStep, setCurrentStep }) {
	return (
		<div className="step-tracker">
			{steps.map((step, index) => (
				<div
					key={step}
					className={`step ${
						index === currentStep ? "current" : ""
					} ${index < currentStep ? "completed" : ""}`}
					onClick={() => setCurrentStep(index)}
				>
					<span className="step-name">{step}</span>
					<div
						className={`step-line ${
							index < currentStep ? "completed" : ""
						}`}
					></div>
				</div>
			))}
		</div>
	);
}

export default StepTracker;
