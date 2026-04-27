"""
Feedback Agent
Evaluates interview answers and provides structured feedback
with scores, strengths, weaknesses, and improved sample answers.
"""
import json
from .llm_utils import generate_json


class FeedbackAgent:
    """Agent responsible for evaluating interview answers."""

    def evaluate(self, question, answer, resume_data):
        """
        Evaluate a candidate's answer to an interview question.
        Returns: { score, strengths, weaknesses, improved_answer }
        """
        skills = ', '.join(resume_data.get('skills', [])[:10])
        projects = ', '.join([
            p.get('name', p) if isinstance(p, dict) else str(p)
            for p in resume_data.get('projects', [])[:5]
        ])

        prompt = f"""You are a Feedback Agent in an AI Interview Coach system.
Evaluate the candidate's answer to the interview question.

Candidate Profile:
- Skills: {skills}
- Projects: {projects}

Interview Question:
\"{question}\"

Candidate's Answer:
\"{answer}\"

Evaluate the answer critically but fairly. Consider:
1. Relevance to the question
2. Technical accuracy
3. Depth and completeness
4. Communication clarity
5. Use of examples/specifics
6. Structure and organization

Return a JSON object:
{{
  "score": <integer 0-10>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "improved_answer": "A model answer that addresses the weaknesses while building on the strengths. Keep it concise but thorough. 3-5 sentences."
}}

Scoring guidelines:
- 9-10: Exceptional — industry-ready, clear, deep, well-structured
- 7-8: Good — solid understanding, minor gaps
- 5-6: Average — basic understanding, needs improvement
- 3-4: Below average — significant gaps in knowledge or clarity
- 0-2: Poor — answer is irrelevant, incorrect, or too brief

Be honest and constructive. Focus on actionable improvement tips."""

        result = generate_json(prompt)

        # Validate and sanitize the response
        if isinstance(result, dict):
            result['score'] = max(0, min(10, int(result.get('score', 5))))
            result['strengths'] = result.get('strengths', [])[:5]
            result['weaknesses'] = result.get('weaknesses', [])[:5]
            result['improved_answer'] = result.get('improved_answer', '')
        else:
            result = {
                'score': 5,
                'strengths': ['Answer was provided'],
                'weaknesses': ['Could not fully evaluate'],
                'improved_answer': 'Please try again with a more detailed answer.',
            }

        return result
