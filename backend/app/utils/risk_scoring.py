from typing import Dict


def calculate_composite_risk(
    ai_risk_score: int,
    seller_reputation: int = 50,  # 0-100, default neutral
    transaction_velocity: int = 0  # Number of transactions in last hour
) -> Dict:
    """
    Combine multiple risk factors into a final score.

    Args:
        ai_risk_score: Risk score from AI (0-100)
        seller_reputation: Seller's historical score (0-100, higher is better)
        transaction_velocity: Number of recent transactions

    Returns:
        {
            "final_score": int (0-100),
            "recommendation": str ("approve", "review", "block"),
            "breakdown": dict
        }
    """

    # Weight factors
    weights = {
        "ai": 0.6,           # AI gets 60% weight
        "reputation": 0.3,   # Seller reputation gets 30%
        "velocity": 0.1      # Transaction velocity gets 10%
    }

    # Convert seller reputation to risk (invert: high reputation = low risk)
    reputation_risk = 100 - seller_reputation

    # Velocity risk (too many transactions = suspicious)
    velocity_risk = min(transaction_velocity * 10, 100)

    # Calculate weighted average
    final_score = (
        ai_risk_score * weights["ai"] +
        reputation_risk * weights["reputation"] +
        velocity_risk * weights["velocity"]
    )

    final_score = round(final_score)

    # Recommendation
    if final_score < 40:
        recommendation = "approve"
    elif final_score < 70:
        recommendation = "review"  # Manual review needed
    else:
        recommendation = "block"

    return {
        "final_score": final_score,
        "recommendation": recommendation,
        "breakdown": {
            "ai_risk": ai_risk_score,
            "reputation_risk": reputation_risk,
            "velocity_risk": velocity_risk
        }
    }
