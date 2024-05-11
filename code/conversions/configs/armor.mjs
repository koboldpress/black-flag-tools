export function convertArmor(initial) {
	return initial
		.replace(/^lgt/, "light")
		.replace(/^med/, "medium")
		.replace(/^hvy/, "heavy")
		.replace(/^shl/, "shield")
		.replace(/chainmail$/, "chainMail")
		.replace(/chainshirt$/, "chainShirt")
		.replace(/halfplate$/, "halfPlate")
		.replace(/ringmail$/, "ringMail")
		.replace(/scalemail$/, "scaleMail")
		.replace(/studded$/, "studdedLeather");
}
