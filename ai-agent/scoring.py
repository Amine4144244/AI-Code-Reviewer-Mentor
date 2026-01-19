"""
Code scoring system for the AI Code Reviewer & Mentor.
Calculates scores across multiple dimensions of code quality.
"""

from typing import Dict, List, Any


def score_code(
    issues: List[Dict[str, Any]],
    code_quality_assessment: Dict[str, str]
) -> Dict[str, int]:
    """
    Calculate scores for code across multiple dimensions.

    Args:
        issues: List of detected issues
        code_quality_assessment: LLM-based quality assessment

    Returns:
        Dictionary with scores for each dimension
    """
    # Base score starts at 100
    base_score = 100

    # Categorize issues by severity and category
    severity_weights = {
        "error": 15,
        "warning": 8,
        "info": 3
    }

    category_impacts = {
        "bug": {"correctness": 1.5, "security": 0.5},
        "security": {"security": 2.0, "correctness": 0.5},
        "performance": {"performance": 1.5},
        "clean-code": {"readability": 1.0, "maintainability": 1.0},
        "anti-pattern": {"maintainability": 1.5, "readability": 0.5}
    }

    # Initialize scores
    scores = {
        "correctness": base_score,
        "readability": base_score,
        "maintainability": base_score,
        "performance": base_score,
        "security": base_score
    }

    # Apply deductions for issues
    for issue in issues:
        severity = issue.get("severity", "info")
        category = issue.get("category", "bug")

        deduction = severity_weights.get(severity, 5)

        if category in category_impacts:
            for dimension, impact in category_impacts[category].items():
                scores[dimension] = max(0, scores[dimension] - (deduction * impact))
        else:
            # Apply to correctness by default
            scores["correctness"] = max(0, scores["correctness"] - deduction)

    # Apply LLM assessment adjustments
    scores = _apply_llm_assessments(scores, code_quality_assessment)

    # Ensure scores are within 0-100 range
    for key in scores:
        scores[key] = max(0, min(100, round(scores[key])))

    # Calculate overall score
    scores["overall"] = round(sum(scores.values()) / 5)

    return scores


def _apply_llm_assessments(
    scores: Dict[str, int],
    assessment: Dict[str, str]
) -> Dict[str, int]:
    """
    Apply adjustments based on LLM quality assessment.

    Args:
        scores: Current scores
        assessment: LLM-based quality assessment text

    Returns:
        Adjusted scores
    """
    assessment_text = " ".join(assessment.values()).lower()

    # Positive indicators
    positive_keywords = {
        "excellent": 10,
        "outstanding": 10,
        "great": 8,
        "good": 5,
        "solid": 5,
        "clean": 5,
        "well-structured": 5,
        "efficient": 5,
        "scalable": 5
    }

    # Negative indicators
    negative_keywords = {
        "poor": -15,
        "bad": -15,
        "problematic": -12,
        "concerning": -10,
        "difficult": -10,
        "inefficient": -10,
        "slow": -8,
        "messy": -8,
        "confusing": -8,
        "risky": -12,
        "fragile": -10,
        "brittle": -10
    }

    # Apply adjustments based on assessment text
    for keyword, adjustment in positive_keywords.items():
        if keyword in assessment_text:
            # Distribute adjustment across dimensions
            for key in scores:
                scores[key] = min(100, scores[key] + adjustment / 5)

    for keyword, adjustment in negative_keywords.items():
        if keyword in assessment_text:
            # Distribute adjustment across dimensions
            for key in scores:
                scores[key] = max(0, scores[key] + adjustment / 5)

    return scores


def calculate_confidence(
    issues: List[Dict[str, Any]],
    code_length: int
) -> float:
    """
    Calculate confidence score for the review.

    Args:
        issues: List of detected issues
        code_length: Length of code in characters

    Returns:
        Confidence score between 0 and 1
    """
    # More issues detected = higher confidence
    # Very short or very long code may reduce confidence
    issue_count = len(issues)

    if code_length < 100:
        # Very short code - less confident
        return min(0.7, issue_count * 0.1)
    elif code_length > 10000:
        # Very long code - may miss things
        return min(0.8, issue_count * 0.05)
    else:
        # Normal code length
        return min(0.95, 0.5 + issue_count * 0.05)


def get_score_grade(score: int) -> str:
    """
    Get letter grade for a numeric score.

    Args:
        score: Numeric score (0-100)

    Returns:
        Letter grade (A-F)
    """
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    elif score >= 60:
        return "D"
    else:
        return "F"


def get_score_status(score: int) -> str:
    """
    Get status description for a numeric score.

    Args:
        score: Numeric score (0-100)

    Returns:
        Status description
    """
    if score >= 90:
        return "Excellent"
    elif score >= 80:
        return "Good"
    elif score >= 70:
        return "Satisfactory"
    elif score >= 60:
        return "Needs Improvement"
    else:
        return "Poor"
