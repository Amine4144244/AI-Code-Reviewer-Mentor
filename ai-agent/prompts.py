"""
Prompt templates for the AI Code Reviewer & Mentor.
Enforces a strict senior developer mentorship persona.
"""


def get_system_prompt(skill_level: str = "mid") -> str:
    """
    Get the system prompt that establishes the mentor persona.

    Args:
        skill_level: Target skill level of the developer

    Returns:
        System prompt string
    """
    base_prompt = """You are an expert code reviewer and senior engineering mentor with 15+ years of experience. Your role is to provide honest, actionable feedback that helps developers grow.

Your approach:
- Be direct and honest - sugarcoating doesn't help anyone improve
- Explain the "why" behind every critique
- Highlight real-world risks and consequences
- Suggest senior-level solutions and patterns
- Balance criticism with constructive guidance
- Think about edge cases, security, performance, and maintainability

Your feedback should:
1. Identify bugs and logic errors with clear explanations
2. Point out performance bottlenecks with specific improvements
3. Flag security vulnerabilities with mitigation strategies
4. Highlight code smells and anti-patterns
5. Suggest architectural improvements
6. Provide concrete, implementable solutions

Always provide specific line references and code examples. Don't just say "fix this" - show how."""

    skill_level_guidance = {
        "junior": """
When reviewing for junior developers:
- Explain fundamental concepts thoroughly
- Provide detailed step-by-step solutions
- Include educational context about why something matters
- Suggest resources for learning
- Be encouraging but firm about quality standards
- Focus on preventing common beginner mistakes""",

        "mid": """
When reviewing for mid-level developers:
- Assume understanding of fundamentals
- Focus on architectural decisions and patterns
- Push for better abstractions and separation of concerns
- Discuss trade-offs between different approaches
- Encourage thinking about scalability and maintainability
- Challenge them to consider edge cases and failure modes""",

        "senior": """
When reviewing for senior developers:
- Assume deep technical knowledge
- Critique architectural decisions rigorously
- Question assumptions and design choices
- Discuss performance at scale, concurrency, distributed systems
- Consider operational concerns (monitoring, debugging, deployment)
- Push for production-ready, battle-tested code
- Ask critical questions about edge cases and failure scenarios"""
    }

    return base_prompt + "\n\n" + skill_level_guidance.get(skill_level, skill_level_guidance["mid"])


def get_analysis_prompt(
    code: str,
    language: str,
    skill_level: str,
    focus_areas: list,
    existing_issues: list
) -> str:
    """
    Get the analysis prompt for code review.

    Args:
        code: Source code to analyze
        language: Programming language
        skill_level: Target skill level
        focus_areas: Areas to focus on
        existing_issues: Issues already found by rule-based detectors

    Returns:
        Analysis prompt string
    """
    focus_areas_str = ", ".join(focus_areas)

    prompt = f"""Analyze this {language} code thoroughly.

**Code to Review:**
```{language}
{code}
```

**Context:**
- Skill Level: {skill_level}
- Focus Areas: {focus_areas_str}

**Issues Already Detected (by rule-based checkers):**
{format_existing_issues(existing_issues)}

Your task:
1. Identify additional issues not caught by rule-based detectors
2. Provide deep analysis of the code's quality and architecture
3. Generate an improved version of the code addressing all issues
4. Create follow-up questions to challenge the developer's thinking

Respond in this exact JSON format:
{{
  "additional_issues": [
    {{
      "line": <line_number>,
      "severity": "error|warning|info",
      "category": "bug|performance|security|clean-code|anti-pattern",
      "message": "Brief description of the issue",
      "explanation": "Detailed explanation of why this is a problem",
      "suggestion": "How a senior engineer would fix this"
    }}
  ],
  "improved_code": "Complete refactored code with all improvements applied",
  "follow_up_questions": [
    "Question 1 that challenges thinking",
    "Question 2 about edge cases",
    "Question 3 about trade-offs"
  ],
  "code_quality": {{
    "architecture": "Assessment of overall architecture",
    "readability": "Assessment of code readability",
    "maintainability": "Assessment of maintainability",
    "performance": "Assessment of performance characteristics",
    "security": "Assessment of security posture"
  }}
}}

Focus on producing actionable, senior-level feedback that helps the developer improve."""

    return prompt


def format_existing_issues(issues: list) -> str:
    """
    Format existing issues for the prompt.

    Args:
        issues: List of existing issues

    Returns:
        Formatted string
    """
    if not issues:
        return "No issues detected by rule-based checkers."

    formatted = []
    for issue in issues:
        formatted.append(
            f"- Line {issue.get('line', '?')}: [{issue.get('severity', 'info')}] "
            f"{issue.get('message', 'Unknown issue')}"
        )

    return "\n".join(formatted)


def get_improvement_prompt(
    original_code: str,
    improved_code: str,
    issues: list,
    language: str
) -> str:
    """
    Get prompt for explaining improvements.

    Args:
        original_code: Original source code
        improved_code: Improved version
        issues: Issues that were addressed
        language: Programming language

    Returns:
        Improvement explanation prompt
    """
    return f"""Explain the improvements made to this code.

**Original Code:**
```{language}
{original_code}
```

**Improved Code:**
```{language}
{improved_code}
```

**Issues Addressed:**
{format_existing_issues(issues)}

Provide a concise explanation of:
1. What changed and why
2. The benefits of each improvement
3. Any trade-offs or considerations

Keep it technical and actionable."""


def get_followup_questions_prompt(
    code: str,
    language: str,
    skill_level: str,
    review_context: dict
) -> str:
    """
    Get prompt for generating follow-up questions.

    Args:
        code: Source code that was reviewed
        language: Programming language
        skill_level: Target skill level
        review_context: Context from the review

    Returns:
        Follow-up questions prompt
    """
    return f"""Generate thoughtful follow-up questions for this code review.

**Code:**
```{language}
{code}
```

**Review Context:**
- Skill Level: {skill_level}
- Key Issues: {len(review_context.get('issues', []))} found
- Overall Score: {review_context.get('score', {}).get('overall', 'N/A')}/100

Generate 3-5 questions that:
1. Challenge assumptions and design choices
2. Explore edge cases and failure scenarios
3. Consider scalability and performance at scale
4. Encourage thinking about maintainability
5. Push for deeper understanding of trade-offs

Questions should be open-ended and provoke thoughtful answers, not yes/no questions."""
