"""
AI Code Reviewer & Mentor Agent
Orchestrates code analysis, scoring, and mentor feedback generation.
"""

import json
import logging
from typing import Dict, List, Any, Optional
from groq import Groq
from .prompts import get_system_prompt, get_analysis_prompt
from .scoring import score_code
from .detectors import (
    BugDetector,
    AntiPatternDetector,
    SecurityDetector,
    PerformanceDetector,
    CleanCodeDetector
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CodeReviewAgent:
    """
    Main agent class that orchestrates code review analysis.
    Acts as a strict senior developer mentor.
    """

    def __init__(self, api_key: str, model: str = "mixtral-8x7b-32768"):
        """
        Initialize the code review agent.

        Args:
            api_key: Groq API key
            model: Model to use for inference
        """
        self.client = Groq(api_key=api_key)
        self.model = model
        self.temperature = 0.3
        self.max_tokens = 2000

        # Initialize detectors
        self.bug_detector = BugDetector()
        self.anti_pattern_detector = AntiPatternDetector()
        self.security_detector = SecurityDetector()
        self.performance_detector = PerformanceDetector()
        self.clean_code_detector = CleanCodeDetector()

    def analyze(
        self,
        code: str,
        language: str,
        skill_level: str = "mid",
        focus_areas: List[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze code and provide comprehensive review.

        Args:
            code: Source code to analyze
            language: Programming language
            skill_level: Target skill level (junior, mid, senior)
            focus_areas: Areas to focus on (bugs, performance, security, clean-code, all)

        Returns:
            Structured review object with scores, issues, improvements, and mentor feedback
        """
        if focus_areas is None:
            focus_areas = ["bugs", "performance", "security", "clean-code"]

        logger.info(f"Analyzing {language} code for {skill_level} level developer")

        try:
            # Step 1: Run rule-based detectors
            issues = self._run_detectors(code, language, focus_areas)

            # Step 2: Get LLM-based analysis for deeper insights
            llm_analysis = self._get_llm_analysis(
                code, language, skill_level, focus_areas, issues
            )

            # Step 3: Combine detector results with LLM analysis
            all_issues = issues + llm_analysis.get("additional_issues", [])

            # Step 4: Score the code
            scores = score_code(all_issues, llm_analysis.get("code_quality", {}))

            # Step 5: Generate improved code
            improved_code = llm_analysis.get("improved_code", "")

            # Step 6: Generate mentor explanation
            mentor_explanation = self._generate_mentor_explanation(
                code, language, skill_level, all_issues, scores
            )

            # Step 7: Generate follow-up questions
            follow_up_questions = llm_analysis.get("follow_up_questions", [])

            return {
                "score": scores,
                "issues": all_issues,
                "improvedCode": improved_code,
                "mentorExplanation": mentor_explanation,
                "followUpQuestions": follow_up_questions
            }

        except Exception as e:
            logger.error(f"Error during code analysis: {str(e)}")
            raise

    def _run_detectors(
        self,
        code: str,
        language: str,
        focus_areas: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Run all rule-based detectors.

        Args:
            code: Source code to analyze
            language: Programming language
            focus_areas: Areas to focus on

        Returns:
            List of detected issues
        """
        issues = []
        lines = code.split("\n")

        # Run detectors based on focus areas
        if "bugs" in focus_areas or "all" in focus_areas:
            issues.extend(self.bug_detector.detect(code, language, lines))

        if "security" in focus_areas or "all" in focus_areas:
            issues.extend(self.security_detector.detect(code, language, lines))

        if "performance" in focus_areas or "all" in focus_areas:
            issues.extend(self.performance_detector.detect(code, language, lines))

        if "clean-code" in focus_areas or "all" in focus_areas:
            issues.extend(self.clean_code_detector.detect(code, language, lines))
            issues.extend(self.anti_pattern_detector.detect(code, language, lines))

        return issues

    def _get_llm_analysis(
        self,
        code: str,
        language: str,
        skill_level: str,
        focus_areas: List[str],
        existing_issues: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Get LLM-based analysis for deeper insights and improvements.

        Args:
            code: Source code to analyze
            language: Programming language
            skill_level: Target skill level
            focus_areas: Areas to focus on
            existing_issues: Issues found by rule-based detectors

        Returns:
            LLM analysis results
        """
        system_prompt = get_system_prompt(skill_level)
        analysis_prompt = get_analysis_prompt(
            code, language, skill_level, focus_areas, existing_issues
        )

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": analysis_prompt}
                ],
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                response_format={"type": "json_object"}
            )

            content = response.choices[0].message.content
            return json.loads(content)

        except Exception as e:
            logger.error(f"Error getting LLM analysis: {str(e)}")
            return {
                "additional_issues": [],
                "improved_code": "",
                "follow_up_questions": [],
                "code_quality": {}
            }

    def _generate_mentor_explanation(
        self,
        code: str,
        language: str,
        skill_level: str,
        issues: List[Dict[str, Any]],
        scores: Dict[str, int]
    ) -> str:
        """
        Generate mentor-style explanation in markdown format.

        Args:
            code: Source code that was analyzed
            language: Programming language
            skill_level: Target skill level
            issues: All detected issues
            scores: Code quality scores

        Returns:
            Markdown-formatted explanation
        """
        explanation_parts = []

        # Overall assessment
        explanation_parts.append(f"# Code Review Summary\n")
        overall_score = scores.get("overall", 0)
        explanation_parts.append(f"**Overall Score: {overall_score}/100**\n\n")

        if overall_score >= 80:
            explanation_parts.append("This is solid work! Here are some suggestions to take it from good to great.\n\n")
        elif overall_score >= 60:
            explanation_parts.append("The code works but needs attention in several areas. Let's improve it together.\n\n")
        else:
            explanation_parts.append("This code needs significant improvements. Here's what we need to address.\n\n")

        # Score breakdown
        explanation_parts.append("## Score Breakdown\n\n")
        explanation_parts.append("| Dimension | Score | Status |\n")
        explanation_parts.append("|-----------|-------|--------|\n")

        for dimension, score in scores.items():
            if dimension == "overall":
                continue
            status = "✅ Good" if score >= 80 else "⚠️ Needs Work" if score >= 60 else "❌ Poor"
            explanation_parts.append(f"| {dimension.capitalize()} | {score}/100 | {status} |\n")

        explanation_parts.append("\n")

        # Key issues summary
        if issues:
            explanation_parts.append("## Key Issues Found\n\n")

            # Group by category
            categories = {}
            for issue in issues:
                category = issue.get("category", "other")
                if category not in categories:
                    categories[category] = []
                categories[category].append(issue)

            for category, category_issues in categories.items():
                explanation_parts.append(f"### {category.capitalize()}\n\n")
                for issue in category_issues[:5]:  # Limit to top 5 per category
                    line = issue.get("line", "?")
                    severity = issue.get("severity", "info")
                    message = issue.get("message", "")
                    explanation_parts.append(f"**Line {line} ({severity})**: {message}\n\n")

        # Skill-level specific advice
        explanation_parts.append("## Recommendations\n\n")
        if skill_level == "junior":
            explanation_parts.append(
                "As you're growing as a developer, focus on:\n"
                "- Understanding edge cases and error handling\n"
                "- Writing self-documenting code with clear names\n"
                "- Learning to think about performance early\n"
                "- Studying common security patterns\n\n"
            )
        elif skill_level == "mid":
            explanation_parts.append(
                "To advance to senior level:\n"
                "- Consider scalability and maintainability\n"
                "- Write tests for edge cases\n"
                "- Refactor for cleaner abstractions\n"
                "- Think about the bigger system architecture\n\n"
            )
        else:  # senior
            explanation_parts.append(
                "For production-quality code:\n"
                "- Optimize for the 99th percentile\n"
                "- Consider concurrency and distributed scenarios\n"
                "- Document trade-offs and alternatives\n"
                "- Plan for observability and debugging\n\n"
            )

        # Next steps
        explanation_parts.append("## Next Steps\n\n")
        explanation_parts.append(
            "1. Review the improved code example\n"
            "2. Address the high-priority issues\n"
            "3. Refactor with the suggested improvements\n"
            "4. Consider the follow-up questions below\n\n"
        )

        return "".join(explanation_parts)


def create_agent(api_key: str) -> CodeReviewAgent:
    """
    Factory function to create a code review agent.

    Args:
        api_key: Groq API key

    Returns:
        CodeReviewAgent instance
    """
    return CodeReviewAgent(api_key)
