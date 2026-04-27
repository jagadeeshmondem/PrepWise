"""
Coding Recommendation Agent
Suggests coding problems based on weak areas, gradually increasing difficulty.
Aligns with DSA patterns and interview trends.
"""
from .llm_utils import generate_json


class CodingRecommendationAgent:
    """Agent responsible for recommending coding problems."""

    def get_suggestions(self, weak_areas, difficulty='medium'):
        """Get a full set of coding problem suggestions."""
        weak_str = ', '.join(weak_areas) if weak_areas else 'general DSA'

        prompt = f"""You are a Coding Recommendation Agent in an AI Interview Coach system.
Generate personalized coding problem suggestions for a placement-preparing student.

Weak Areas Identified: {weak_str}
Current Difficulty Level: {difficulty}

Generate 6-8 coding problems that:
1. Target the identified weak areas
2. Start at {difficulty} difficulty and gradually increase
3. Cover important DSA patterns (arrays, strings, trees, graphs, DP, etc.)
4. Are commonly asked in tech interviews
5. Include a mix of patterns

Return a JSON object:
{{
  "suggestions": [
    {{
      "title": "Problem Name",
      "topic": "DSA topic (e.g., Arrays, Trees, DP)",
      "difficulty": "Easy/Medium/Hard",
      "description": "Brief problem description (2-3 sentences)",
      "pattern": "Algorithm pattern (e.g., Two Pointers, Sliding Window, BFS)",
      "hint": "A helpful hint without giving away the solution",
      "link": "https://leetcode.com/problems/relevant-problem-name/"
    }}
  ]
}}

Make problems progressively harder. Use real LeetCode problem names when possible.
Ensure diversity in topics and patterns."""

        result = generate_json(prompt)
        return result

    def get_quick_suggestions(self, weaknesses, difficulty='medium'):
        """Get 2-3 quick suggestions based on immediate feedback weaknesses."""
        if not weaknesses:
            return []

        weak_str = ', '.join(weaknesses[:3])

        prompt = f"""Based on these interview weaknesses: {weak_str}

Suggest 2-3 coding problems to practice. Difficulty: {difficulty}.

Return a JSON array:
[
  {{
    "title": "Problem Name",
    "topic": "DSA Topic",
    "difficulty": "{difficulty.capitalize()}",
    "description": "Brief description",
    "pattern": "Algorithm pattern",
    "hint": "Brief hint",
    "link": "https://leetcode.com/problems/example/"
  }}
]"""

        result = generate_json(prompt)
        if isinstance(result, list):
            return result[:3]
        elif isinstance(result, dict) and 'suggestions' in result:
            return result['suggestions'][:3]
        return []
