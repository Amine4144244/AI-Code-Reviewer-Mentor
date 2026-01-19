"""
Pattern detection modules for the AI Code Reviewer & Mentor.
Detects bugs, anti-patterns, security issues, performance problems, and clean code violations.
"""

import re
from typing import List, Dict, Any
from abc import ABC, abstractmethod


class BaseDetector(ABC):
    """Base class for all code detectors."""

    @abstractmethod
    def detect(
        self,
        code: str,
        language: str,
        lines: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Detect issues in code.

        Args:
            code: Full source code
            language: Programming language
            lines: List of code lines

        Returns:
            List of detected issues
        """
        pass


class BugDetector(BaseDetector):
    """Detects logic errors, null pointer risks, and edge case misses."""

    def detect(
        self,
        code: str,
        language: str,
        lines: List[str]
    ) -> List[Dict[str, Any]]:
        issues = []

        # Detect potential null/undefined access
        if language in ["javascript", "typescript"]:
            issues.extend(self._detect_null_access(lines))
            issues.extend(self._detect_async_errors(lines))
            issues.extend(self._detect_type_coercion(lines))

        elif language == "python":
            issues.extend(self._detect_none_errors(lines))
            issues.extend(self._detect_key_errors(lines))

        # Common bugs across languages
        issues.extend(self._detect_off_by_one(lines))
        issues.extend(self._detect_infinite_loops(lines))

        return issues

    def _detect_null_access(self, lines: List[str]) -> List[Dict[str, Any]]:
        issues = []
        pattern = r'\w+\.\w+\.\w+'  # Nested property access without null check

        for i, line in enumerate(lines, 1):
            if re.search(pattern, line) and '?.?' not in line and '?.(' not in line:
                if 'if' not in line and 'try' not in line:
                    issues.append({
                        "line": i,
                        "severity": "warning",
                        "category": "bug",
                        "message": "Potential null/undefined access on nested properties",
                        "explanation": "Accessing nested properties without null checks can throw runtime errors if intermediate values are null or undefined.",
                        "suggestion": "Use optional chaining (?.) or explicit null checks before accessing nested properties."
                    })

        return issues

    def _detect_async_errors(self, lines: List[str]) -> List[Dict[str, Any]]:
        issues = []

        for i, line in enumerate(lines, 1):
            # Detect async/await without error handling
            if 'await ' in line and 'try' not in ''.join(lines[max(0, i-5):i]):
                if '.catch(' not in line:
                    issues.append({
                        "line": i,
                        "severity": "warning",
                        "category": "bug",
                        "message": "Async operation without error handling",
                        "explanation": "Unhandled promise rejections can crash your application or lead to silent failures.",
                        "suggestion": "Wrap await in try/catch or use .catch() to handle errors gracefully."
                    })

        return issues

    def _detect_type_coercion(self, lines: List[str]) -> List[Dict[str, Any]]:
        issues = []
        pattern = r'==\s*\w+|\w+\s*=='

        for i, line in enumerate(lines, 1):
            if '==' in line and '===' not in line and '!==' not in line:
                issues.append({
                    "line": i,
                    "severity": "warning",
                    "category": "bug",
                    "message": "Using loose equality (==) instead of strict equality (===)",
                    "explanation": "Loose equality can lead to unexpected type coercion bugs (e.g., '' == 0 is true).",
                    "suggestion": "Always use strict equality (===) and (!==) to avoid type coercion surprises."
                })

        return issues

    def _detect_none_errors(self, lines: List[str]) -> List[Dict[str, Any]]:
        issues = []

        for i, line in enumerate(lines, 1):
            # Detect method calls without None check
            if '.' in line and 'if' not in ''.join(lines[max(0, i-3):i]):
                if re.search(r'\w+\.\w+\(', line) and 'try' not in line:
                    issues.append({
                        "line": i,
                        "severity": "warning",
                        "category": "bug",
                        "message": "Method call without None check",
                        "explanation": "Calling methods on potentially None objects will raise AttributeError.",
                        "suggestion": "Add explicit None check or use optional chaining (python 3.10+)."
                    })

        return issues

    def _detect_key_errors(self, lines: List[str]) -> List[Dict[str, Any]]:
        issues = []
        pattern = r'\[\w+\]|\["\w+"\]'  # Dict access without .get()

        for i, line in enumerate(lines, 1):
            if re.search(pattern, line) and '.get(' not in line:
                if 'if' not in line and 'try' not in line:
                    issues.append({
                        "line": i,
                        "severity": "warning",
                        "category": "bug",
                        "message": "Dictionary access without key check",
                        "explanation": "Direct dictionary access will raise KeyError if key doesn't exist.",
                        "suggestion": "Use .get() method with default value or check key existence first."
                    })

        return issues

    def _detect_off_by_one(self, lines: List[str]) -> List[Dict[str, Any]]:
        issues = []

        for i, line in enumerate(lines, 1):
            # Check for loop conditions that might have off-by-one errors
            if re.search(r'for.*<.*\.length', line) and '+ 1' not in line:
                if re.search(r'i\s*<\s*\w+\.length', line):
                    issues.append({
                        "line": i,
                        "severity": "info",
                        "category": "bug",
                        "message": "Verify loop boundary for off-by-one error",
                        "explanation": "Common source of bugs - ensure you're accessing the correct indices.",
                        "suggestion": "Double-check your loop conditions and array access patterns."
                    })

        return issues

    def _detect_infinite_loops(self, lines: List[str]) -> List[Dict[str, Any]]:
        issues = []
        open_braces = 0

        for i, line in enumerate(lines, 1):
            if 'while(' in line or 'while (' in line:
                # Check if loop condition never changes
                if 'true' in line.lower() or 'true' in line.lower():
                    if 'break' not in ''.join(lines[i:i+10]):
                        issues.append({
                            "line": i,
                            "severity": "error",
                            "category": "bug",
                            "message": "Potential infinite loop",
                            "explanation": "While loop with condition that never becomes false will run forever.",
                            "suggestion": "Ensure loop condition changes within the loop body or add explicit break condition."
                        })

        return issues


class AntiPatternDetector(BaseDetector):
    """Identifies code smells and anti-patterns."""

    def detect(
        self,
        code: str,
        language: str,
        lines: List[str]
    ) -> List[Dict[str, Any]]:
        issues = []

        issues.extend(self._detect_deep_nesting(lines))
        issues.extend(self._detect_code_duplication(code, lines))
        issues.extend(self._detect_long_functions(code, lines))
        issues.extend(self._detect_magic_numbers(lines))
        issues.extend(self._detect_poor_naming(lines))

        return issues

    def _detect_deep_nesting(self, lines: List[str]) -> List[Dict[str, Any]]:
        issues = []

        for i, line in enumerate(lines, 1):
            # Count indentation level
            stripped = line.lstrip()
            indent = len(line) - len(stripped)

            # Estimate nesting level (assuming 2 or 4 space indentation)
            indent_size = 2 if '  ' in line[:10] else 4
            nesting_level = indent // indent_size

            if nesting_level > 4:
                issues.append({
                    "line": i,
                    "severity": "warning",
                    "category": "anti-pattern",
                    "message": f"Deep nesting ({nesting_level} levels) detected",
                    "explanation": "Deep nesting makes code hard to read and understand. It often indicates complex logic that could be simplified.",
                    "suggestion": "Extract nested blocks into separate functions, use early returns, or apply guard clauses."
                })

        return issues

    def _detect_code_duplication(self, code: str, lines: List[str]) -> List[Dict[str, Any]]:
        issues = []

        # Simple duplication detection - look for repeated patterns
        # In production, use more sophisticated algorithms
        seen_lines = {}
        for i, line in enumerate(lines, 1):
            normalized = re.sub(r'\s+', ' ', line.strip())
            if len(normalized) > 20:  # Ignore short lines
                if normalized in seen_lines:
                    issues.append({
                        "line": i,
                        "severity": "info",
                        "category": "anti-pattern",
                        "message": "Potential code duplication",
                        "explanation": "Duplicate code violates DRY principle and makes maintenance harder.",
                        "suggestion": "Extract common logic into a function or constant."
                    })
                else:
                    seen_lines[normalized] = i

        return issues[:5]  # Limit to avoid too many warnings

    def _detect_long_functions(self, code: str, lines: List[str]) -> List[Dict[str, Any]]:
        issues = []

        # Simple function length detection
        in_function = False
        function_start = 0
        function_lines = 0
        brace_count = 0

        for i, line in enumerate(lines, 1):
            if re.search(r'(def |function |=> )', line):
                in_function = True
                function_start = i
                function_lines = 0
                brace_count = 0

            if in_function:
                function_lines += 1
                brace_count += line.count('{') - line.count('}')

                if brace_count == 0 and function_lines > 50:
                    issues.append({
                        "line": function_start,
                        "severity": "warning",
                        "category": "anti-pattern",
                        "message": f"Long function ({function_lines} lines)",
                        "explanation": "Long functions are hard to understand, test, and maintain.",
                        "suggestion": "Break down into smaller, single-responsibility functions."
                    })
                    in_function = False

        return issues

    def _detect_magic_numbers(self, lines: List[str]) -> List[Dict[str, Any]]:
        issues = []

        for i, line in enumerate(lines, 1):
            # Detect standalone numbers (not 0, 1, or in comments)
            if re.search(r'\b(?!0|1\b)\d{2,}\b', line) and '#' not in line and '//' not in line:
                if '=' in line or 'return' in line or 'if' in line or '<' in line or '>' in line:
                    issues.append({
                        "line": i,
                        "severity": "info",
                        "category": "anti-pattern",
                        "message": "Magic number detected",
                        "explanation": "Hard-coded numbers without explanation make code harder to maintain.",
                        "suggestion": "Replace with named constants that explain the value's purpose."
                    })

        return issues[:5]

    def _detect_poor_naming(self, lines: List[str]) -> List[Dict[str, Any]]:
        issues = []
        poor_names = ['temp', 'tmp', 'data', 'info', 'var1', 'var2', 'x', 'y']

        for i, line in enumerate(lines, 1):
            for name in poor_names:
                pattern = rf'\b{name}\b'
                if re.search(pattern, line):
                    # Skip if it's in a comment
                    if '#' not in line and '//' not in line:
                        issues.append({
                            "line": i,
                            "severity": "info",
                            "category": "anti-pattern",
                            "message": f"Poor variable name: '{name}'",
                            "explanation": "Generic names don't convey intent and make code harder to understand.",
                            "suggestion": "Use descriptive names that explain the variable's purpose."
                        })

        return issues[:3]


class SecurityDetector(BaseDetector):
    """Detects security vulnerabilities."""

    def detect(
        self,
        code: str,
        language: str,
        lines: List[str]
    ) -> List[Dict[str, Any]]:
        issues = []

        issues.extend(self._detect_sql_injection(lines))
        issues.extend(self._detect_xss(lines))
        issues.extend(self._detect_hardcoded_secrets(lines))
        issues.extend(self._detect_insecure_crypto(lines))
        issues.extend(self._detect_auth_bypass(lines))

        return issues

    def _detect_sql_injection(self, lines: List[str]) -> List[Dict[str, Any]]:
        issues = []
        dangerous_patterns = [
            r'execute\(\s*["\'].*\+.*["\']',
            r'query\(\s*["\'].*\+.*["\']',
            r'"SELECT.*" \+ ',
            r'"INSERT.*" \+ ',
            r'"UPDATE.*" \+ ',
            r'"DELETE.*" \+ '
        ]

        for i, line in enumerate(lines, 1):
            for pattern in dangerous_patterns:
                if re.search(pattern, line, re.IGNORECASE):
                    issues.append({
                        "line": i,
                        "severity": "error",
                        "category": "security",
                        "message": "Potential SQL injection vulnerability",
                        "explanation": "Concatenating user input into SQL queries allows attackers to execute arbitrary SQL.",
                        "suggestion": "Use parameterized queries or prepared statements instead."
                    })

        return issues

    def _detect_xss(self, lines: List[str]) -> List[Dict[str, Any]]:
        issues = []

        for i, line in enumerate(lines, 1):
            if 'innerHTML' in line or 'outerHTML' in line:
                if 'sanitize' not in line and 'DOMPurify' not in line:
                    issues.append({
                        "line": i,
                        "severity": "error",
                        "category": "security",
                        "message": "Potential XSS vulnerability via innerHTML",
                        "explanation": "Setting innerHTML with untrusted data can lead to cross-site scripting attacks.",
                        "suggestion": "Use textContent or sanitize HTML with a library like DOMPurify."
                    })

            if 'eval(' in line:
                issues.append({
                    "line": i,
                    "severity": "error",
                    "category": "security",
                    "message": "Use of eval() is dangerous",
                    "explanation": "eval() executes arbitrary code and is a major security risk.",
                    "suggestion": "Never use eval(). Find alternative approaches to achieve your goal."
                })

        return issues

    def _detect_hardcoded_secrets(self, lines: List[str]) -> List[Dict[str, Any]]:
        issues = []
        secret_patterns = [
            (r'api[_-]?key\s*=\s*["\'][\w-]{20,}["\']', "API key"),
            (r'password\s*=\s*["\'][^"\']{4,}["\']', "password"),
            (r'secret\s*=\s*["\'][\w-]{10,}["\']', "secret"),
            (r'token\s*=\s*["\'][\w-]{20,}["\']', "token"),
            (r'private[_-]?key\s*=\s*["\'][\w-]{20,}["\']', "private key")
        ]

        for i, line in enumerate(lines, 1):
            for pattern, secret_type in secret_patterns:
                if re.search(pattern, line, re.IGNORECASE):
                    # Skip if it's a comment or placeholder
                    if '#' not in line and '//' not in line and 'TODO' not in line:
                        issues.append({
                            "line": i,
                            "severity": "error",
                            "category": "security",
                            "message": f"Hardcoded {secret_type} detected",
                            "explanation": "Hardcoded secrets in code are a security risk and will be exposed in version control.",
                            "suggestion": "Use environment variables or a secret management system."
                        })

        return issues

    def _detect_insecure_crypto(self, lines: List[str]) -> List[Dict[str, Any]]:
        issues = []
        weak_crypto = ['md5', 'sha1', 'rc4', 'des', 'ecb']

        for i, line in enumerate(lines, 1):
            for algo in weak_crypto:
                if algo in line.lower():
                    issues.append({
                        "line": i,
                        "severity": "error",
                        "category": "security",
                        "message": f"Weak cryptographic algorithm: {algo.upper()}",
                        "explanation": f"{algo.upper()} is cryptographically broken and should not be used.",
                        "suggestion": f"Use stronger alternatives like SHA-256, SHA-3, or AES-GCM."
                    })

        return issues

    def _detect_auth_bypass(self, lines: List[str]) -> List[Dict[str, Any]]:
        issues = []

        for i, line in enumerate(lines, 1):
            # Check for commented out auth checks
            if re.search(r'//\s*(if|require|auth)', line) or re.search(r'#\s*(if|require|auth)', line):
                issues.append({
                    "line": i,
                    "severity": "warning",
                    "category": "security",
                    "message": "Commented out authorization check",
                    "explanation": "Commented auth checks may be accidentally left that way in production.",
                    "suggestion": "Remove commented code or ensure proper authorization is in place."
                })

        return issues


class PerformanceDetector(BaseDetector):
    """Detects performance issues and bottlenecks."""

    def detect(
        self,
        code: str,
        language: str,
        lines: List[str]
    ) -> List[Dict[str, Any]]:
        issues = []

        issues.extend(self._detect_n_plus_one(lines))
        issues.extend(self._detect_inefficient_loops(lines))
        issues.extend(self._detect_memory_leaks(lines))
        issues.extend(self._detect_unnecessary_operations(lines))

        return issues

    def _detect_n_plus_one(self, lines: List[str]) -> List[Dict[str, Any]]:
        issues = []

        for i, line in enumerate(lines, 1):
            # Look for database queries inside loops
            if re.search(r'for.*\{', line):
                # Check next few lines for query patterns
                for j in range(i, min(i + 5, len(lines))):
                    next_line = lines[j]
                    if re.search(r'(query|find|select|execute)', next_line, re.IGNORECASE):
                        issues.append({
                            "line": i,
                            "severity": "warning",
                            "category": "performance",
                            "message": "Potential N+1 query problem",
                            "explanation": "Executing database queries inside loops causes severe performance issues.",
                            "suggestion": "Use eager loading, batch queries, or joins to fetch data in a single query."
                        })
                        break

        return issues

    def _detect_inefficient_loops(self, lines: List[str]) -> List[Dict[str, Any]]:
        issues = []

        for i, line in enumerate(lines, 1):
            # Check for operations inside loops that could be outside
            if 'for' in line or 'while' in line:
                # Look for expensive operations in the next few lines
                for j in range(i, min(i + 10, len(lines))):
                    next_line = lines[j]
                    if re.search(r'\.(length|size|count)\(\)', next_line):
                        issues.append({
                            "line": j,
                            "severity": "warning",
                            "category": "performance",
                            "message": "Repeated calculation inside loop",
                            "explanation": "Calculating array length/count inside loops is inefficient.",
                            "suggestion": "Move the calculation outside the loop or cache the value."
                        })
                        break

        return issues

    def _detect_memory_leaks(self, lines: List[str]) -> List[Dict[str, Any]]:
        issues = []

        for i, line in enumerate(lines, 1):
            # Check for event listeners without cleanup
            if 'addEventListener' in line or 'on(' in line:
                # Look for removeEventListener nearby
                context = '\n'.join(lines[max(0, i-5):min(i+20, len(lines))])
                if 'removeEventListener' not in context and 'off(' not in context:
                    issues.append({
                        "line": i,
                        "severity": "warning",
                        "category": "performance",
                        "message": "Event listener without cleanup",
                        "explanation": "Event listeners that are never removed can cause memory leaks.",
                        "suggestion": "Store references to listeners and remove them when no longer needed."
                    })

        return issues

    def _detect_unnecessary_operations(self, lines: List[str]) -> List[Dict[str, Any]]:
        issues = []

        for i, line in enumerate(lines, 1):
            # Check for redundant operations
            if re.search(r'\+\s*0|-\s*0|\*\s*1|/\s*1', line):
                issues.append({
                    "line": i,
                    "severity": "info",
                    "category": "performance",
                    "message": "Unnecessary arithmetic operation",
                    "explanation": "These operations don't change the value and waste CPU cycles.",
                    "suggestion": "Remove the unnecessary operation."
                })

        return issues


class CleanCodeDetector(BaseDetector):
    """Detects violations of clean code principles."""

    def detect(
        self,
        code: str,
        language: str,
        lines: List[str]
    ) -> List[Dict[str, Any]]:
        issues = []

        issues.extend(self._detect_long_lines(lines))
        issues.extend(self._detect_commented_code(lines))
        issues.extend(self._detect_dead_code(lines))
        issues.extend(self._detect_solid_violations(code, lines))

        return issues

    def _detect_long_lines(self, lines: List[str]) -> List[Dict[str, Any]]:
        issues = []

        for i, line in enumerate(lines, 1):
            if len(line) > 120:
                issues.append({
                    "line": i,
                    "severity": "info",
                    "category": "clean-code",
                    "message": f"Line too long ({len(line)} characters)",
                    "explanation": "Long lines are hard to read and don't fit well on screens or in diffs.",
                    "suggestion": "Break long lines into multiple lines or extract logic to variables."
                })

        return issues[:5]

    def _detect_commented_code(self, lines: List[str]) -> List[Dict[str, Any]]:
        issues = []
        consecutive_comments = 0

        for i, line in enumerate(lines, 1):
            if line.strip().startswith('//') or line.strip().startswith('#'):
                consecutive_comments += 1
                if consecutive_comments > 3:
                    issues.append({
                        "line": i - 2,
                        "severity": "info",
                        "category": "clean-code",
                        "message": "Multiple consecutive commented lines",
                        "explanation": "Commented code clutters the codebase and should be removed.",
                        "suggestion": "Delete commented code or use version control to recover it if needed."
                    })
                    consecutive_comments = 0
            else:
                consecutive_comments = 0

        return issues

    def _detect_dead_code(self, lines: List[str]) -> List[Dict[str, Any]]:
        issues = []

        for i, line in enumerate(lines, 1):
            # Check for unreachable code patterns
            if 'return' in line and 'else:' not in line and 'else ' not in line:
                # Check if there's code after return
                context = lines[i:i+3]
                if any(code.strip() and not code.strip().startswith(('#', '//', '}')) for code in context):
                    issues.append({
                        "line": i + 1,
                        "severity": "warning",
                        "category": "clean-code",
                        "message": "Unreachable code after return",
                        "explanation": "Code after a return statement will never execute.",
                        "suggestion": "Remove the unreachable code or restructure the logic."
                    })

        return issues

    def _detect_solid_violations(self, code: str, lines: List[str]) -> List[Dict[str, Any]]:
        issues = []

        # Check for God class (too many methods/lines)
        class_pattern = re.compile(r'class \w+')
        in_class = False
        class_lines = 0
        class_methods = 0

        for i, line in enumerate(lines, 1):
            if class_pattern.search(line):
                in_class = True
                class_lines = 0
                class_methods = 0
            elif in_class:
                class_lines += 1
                if re.search(r'(def |function )\w+\(', line):
                    class_methods += 1

                # End of class
                if class_lines > 500 or class_methods > 20:
                    issues.append({
                        "line": i - class_lines,
                        "severity": "warning",
                        "category": "clean-code",
                        "message": "Class may be doing too much (Single Responsibility Principle)",
                        "explanation": "Large classes with many methods violate SRP and are hard to maintain.",
                        "suggestion": "Split the class into smaller, focused classes with single responsibilities."
                    })
                    in_class = False

        return issues[:2]
