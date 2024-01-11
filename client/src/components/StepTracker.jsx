import React from "react";
import styles from "./StepTracker.module.css"; // Make sure the CSS module file exists and is correctly named

function StepTracker({ steps, currentStep, setCurrentStep }) {
	return (
		<div className={styles.step_tracker}>
			{steps.map((step, index) => (
				<div
					key={step}
					className={`${styles.step} ${
						index === currentStep ? styles.current : ""
					} ${index < currentStep ? styles.completed : ""}`}
					onClick={() =>
						index < currentStep
							? setCurrentStep(index)
							: console.log("")
					}
				>
					<span className={styles.step_name}>{step}</span>
					<div
						className={`${styles.step_line} ${
							index < currentStep ? styles.completed : ""
						}`}
					></div>
				</div>
			))}
		</div>
	);
}

export default StepTracker;
