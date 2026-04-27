"""
Daily Planner Agent
Generates structured daily preparation plans including DSA practice,
core subjects, mock interviews, and revision strategy.
"""
import json
from .llm_utils import generate_json


class DailyPlannerAgent:
    """Agent responsible for generating daily study plans."""

    def generate_plan(self, resume_data, analytics, company=''):
        """Generate a personalized daily preparation plan."""
        skills = ', '.join(resume_data.get('skills', [])[:10])
        weak_areas = ', '.join(analytics.get('weakAreas', analytics.get('weak_areas', [])))
        avg_score = analytics.get('averageScore', analytics.get('average_score', 'N/A'))
        company_context = f"\nTarget Company: {company}" if company else ""

        prompt = f"""You are a Daily Planner Agent in an AI Interview Coach system.
Generate a structured daily preparation plan for a placement-preparing student.

Student Profile:
- Skills: {skills}
- Weak Areas: {weak_areas or 'Not yet identified'}
- Average Interview Score: {avg_score}
{company_context}

Create a comprehensive daily preparation plan. Return JSON:
{{
  "blocks": [
    {{
      "category": "DSA",
      "title": "Data Structures & Algorithms Practice",
      "time": "9:00 AM - 11:00 AM",
      "tasks": [
        "Specific task 1",
        "Specific task 2",
        "Specific task 3"
      ]
    }},
    {{
      "category": "Core Subjects",
      "title": "DBMS & Operating Systems",
      "time": "11:30 AM - 1:00 PM",
      "tasks": [
        "Specific task 1",
        "Specific task 2"
      ]
    }},
    {{
      "category": "Mock Interview",
      "title": "Interview Practice Session",
      "time": "2:00 PM - 3:30 PM",
      "tasks": [
        "Specific task 1",
        "Specific task 2"
      ]
    }},
    {{
      "category": "Coding",
      "title": "Competitive Coding Practice",
      "time": "4:00 PM - 5:30 PM",
      "tasks": [
        "Specific task 1",
        "Specific task 2"
      ]
    }},
    {{
      "category": "Revision",
      "title": "Evening Revision & Review",
      "time": "7:00 PM - 8:30 PM",
      "tasks": [
        "Specific task 1",
        "Specific task 2"
      ]
    }}
  ]
}}

Rules:
1. Make tasks SPECIFIC and actionable (not generic)
2. Focus on weak areas if identified
3. Include a mix of DSA, core CS subjects (DBMS, OS, CN, OOP), mock interviews, and revision
4. Each block should have 3-5 specific tasks
5. Personalize based on the student's skill level
{f'6. Include {company}-specific preparation tasks' if company else ''}
7. Include progressive difficulty in DSA tasks"""

        result = generate_json(prompt)
        return result
