"""Static condition knowledge: display names, care guidance, and contextual questionnaires."""
from __future__ import annotations

CONDITIONS: dict[str, dict] = {
    "eczema": {
        "display": "Eczema (Atopic Dermatitis)",
        "short": "Eczema",
        "description": "A chronic inflammatory condition causing dry, itchy, red patches; flares are commonly linked to stress, sweat, irritants and low humidity.",
        "stress_link": "Psychological stress raises cortisol and weakens the skin barrier, a well-documented eczema flare trigger.",
        "care": [
            "Moisturise with a fragrance-free emollient at least twice daily, ideally within 3 minutes of bathing.",
            "Use lukewarm (not hot) water and a soap-free cleanser.",
            "Keep nails short and try cool compresses instead of scratching.",
            "Track flares against stress, sleep and humidity to find personal triggers.",
        ],
        "see_doctor": "Seek care if patches ooze, crust yellow, spread quickly, or disrupt sleep despite moisturising.",
    },
    "psoriasis": {
        "display": "Psoriasis (Plaque)",
        "short": "Psoriasis",
        "description": "An immune-mediated condition producing thick, scaly, well-defined plaques, often on elbows, knees and scalp.",
        "stress_link": "Stress is one of the most commonly reported psoriasis flare triggers, and flares in turn increase anxiety and low mood.",
        "care": [
            "Apply thick moisturisers or ointments to soften scale.",
            "Short, sensible sun exposure can help — avoid sunburn, which can trigger new plaques.",
            "Limit alcohol and smoking, both associated with more severe disease.",
            "Note joint pain or stiffness — it can signal psoriatic arthritis.",
        ],
        "see_doctor": "See a dermatologist for widespread plaques, joint pain, or if topical treatment isn't helping.",
    },
    "vitiligo": {
        "display": "Vitiligo",
        "short": "Vitiligo",
        "description": "Loss of pigment-producing cells leading to well-demarcated white or light patches; not contagious and not painful.",
        "stress_link": "Emotional stress is associated with onset and spread in some people, and visible patches can strongly affect self-esteem.",
        "care": [
            "Protect depigmented skin with SPF 50+ — it burns easily.",
            "Photograph patches under the same lighting weekly to track spread or repigmentation.",
            "Avoid skin trauma (friction, cuts) which can trigger new patches (Koebner phenomenon).",
            "Emotional support matters — consider talking things through with Solace or a counsellor.",
        ],
        "see_doctor": "A dermatologist can discuss phototherapy and topical treatments, which work best when started early.",
    },
    "normal": {
        "display": "No active condition detected",
        "short": "Healthy skin",
        "description": "The image does not show patterns of eczema, psoriasis or vitiligo.",
        "stress_link": "Even with clear skin, stress management and sleep help maintain a healthy skin barrier.",
        "care": [
            "Keep up a gentle cleanse-moisturise-protect routine.",
            "Use daily broad-spectrum sunscreen.",
            "Re-scan if you notice new redness, scaling or colour change.",
        ],
        "see_doctor": "See a doctor for any new, changing, bleeding or painful spot.",
    },
}

_COMMON_QUESTIONS = [
    {"id": "duration", "question": "How long have you had this patch?", "type": "choice",
     "options": ["Less than a week", "1-4 weeks", "1-6 months", "More than 6 months"]},
    {"id": "stress", "question": "How stressed have you felt in the past week?", "type": "scale", "min": 1, "max": 10},
    {"id": "sleep", "question": "How has your sleep been lately?", "type": "choice",
     "options": ["Good", "Somewhat disrupted", "Poor"]},
]

QUESTIONNAIRES: dict[str, list[dict]] = {
    "eczema": [
        {"id": "itch", "question": "How itchy is it right now?", "type": "scale", "min": 0, "max": 10},
        {"id": "oozing", "question": "Is there any oozing, weeping or crusting?", "type": "boolean"},
        {"id": "triggers", "question": "Have you noticed any of these before a flare?", "type": "multi",
         "options": ["Stress", "Sweat/heat", "New soap or detergent", "Dry weather", "Certain foods", "Pets/dust"]},
        *_COMMON_QUESTIONS,
    ],
    "psoriasis": [
        {"id": "scaling", "question": "How much scaling/flaking do you notice?", "type": "choice",
         "options": ["None", "Light", "Moderate", "Heavy"]},
        {"id": "joint_pain", "question": "Do you have joint pain, swelling or morning stiffness?", "type": "boolean"},
        {"id": "family_history", "question": "Does anyone in your family have psoriasis?", "type": "boolean"},
        {"id": "triggers", "question": "Have you noticed any of these before a flare?", "type": "multi",
         "options": ["Stress", "Infection/sore throat", "Skin injury", "Alcohol", "Cold weather", "New medication"]},
        *_COMMON_QUESTIONS,
    ],
    "vitiligo": [
        {"id": "spreading", "question": "Have the patches spread in the last 3 months?", "type": "boolean"},
        {"id": "sunburn", "question": "Do the light patches burn easily in the sun?", "type": "boolean"},
        {"id": "autoimmune", "question": "Do you have a thyroid or other autoimmune condition?", "type": "choice",
         "options": ["Yes", "No", "Not sure"]},
        {"id": "emotional_impact", "question": "How much do the patches affect how you feel about yourself?", "type": "scale", "min": 0, "max": 10},
        *_COMMON_QUESTIONS,
    ],
    "normal": [
        {"id": "concern", "question": "What prompted this scan?", "type": "choice",
         "options": ["Routine check", "New spot", "Itching", "Colour change", "Other"]},
        *_COMMON_QUESTIONS,
    ],
}


def info(condition: str) -> dict:
    return CONDITIONS.get(condition, CONDITIONS["normal"])


def questionnaire(condition: str) -> list[dict]:
    return QUESTIONNAIRES.get(condition, QUESTIONNAIRES["normal"])
