"""
Interview Agent (Question Generator + Mock Interview Agent)
Generates personalized interview questions based on resume data,
interview type, company, and dynamically adapts difficulty.
"""
import json
from .llm_utils import generate_text


class InterviewAgent:
    """Agent responsible for generating interview questions."""

    def generate_first_question(self, resume_data, interview_type, company, difficulty, role=""):
        """Generate the first question for a new interview session."""
        skills = ', '.join(resume_data.get('skills', [])[:15])
        projects = json.dumps(resume_data.get('projects', [])[:5], indent=2)
        experience = json.dumps(resume_data.get('experience', [])[:3], indent=2)

        company_context = f"\nTarget Company: {company}" if company else ""
        role_context = f"\nTarget Role: {role}" if role else ""
        type_instructions = self._get_type_instructions(interview_type)

        prompt = f"""You are a Mock Interview Agent in an AI Interview Coach system.
You are starting a new {interview_type} interview session for a candidate.

Candidate Profile:
- Skills: {skills}
- Projects: {projects}
- Experience: {experience}
{company_context}
{role_context}

Difficulty Level: {difficulty}

{type_instructions}

Generate ONE opening interview question that is:
1. Personalized to the candidate's profile
2. STRICTLY aligned with the {interview_type} guidelines specified above
3. At {difficulty} difficulty level
{f'4. Relevant to {company} interview culture and patterns' if company else ''}

CRITICAL: Do NOT drift into project questions if the round is HR/Technical. Adhere heavily to the specified Type.
Return ONLY the question text, nothing else. No explanations, no prefixes like "Question:".
Make it natural, as a real interviewer would ask."""

        return generate_text(prompt)

    def generate_next_question(self, resume_data, interview_type, company,
                              difficulty, history, last_feedback, role=""):
        """Generate the next question based on conversation context."""
        skills = ', '.join(resume_data.get('skills', [])[:15])
        projects = json.dumps(resume_data.get('projects', [])[:5], indent=2)

        company_context = f"\nTarget Company: {company}" if company else ""
        role_context = f"\nTarget Role: {role}" if role else ""

        # Build conversation history summary
        history_summary = ""
        if history:
            history_parts = []
            for i, entry in enumerate(history[-5:]):  # Last 5 Q&As
                q = entry.get('question', '')
                a = entry.get('answer', '')
                score = entry.get('feedback', {}).get('score', '?')
                history_parts.append(f"Q{i+1}: {q}\nA{i+1}: {a}\nScore: {score}/10")
            history_summary = "\n---\n".join(history_parts)

        # Adapt based on performance
        score = last_feedback.get('score', 5)
        weaknesses = last_feedback.get('weaknesses', [])
        adaptation = ""

        if score >= 8:
            adaptation = "The candidate did very well. INCREASE the difficulty. Ask something deeper or more challenging."
        elif score >= 5:
            adaptation = "The candidate did okay. Maintain similar difficulty but probe a different area."
        else:
            adaptation = f"The candidate struggled. Focus on their weak areas: {', '.join(weaknesses)}. Ask a related but slightly easier question to help them learn."

        type_instructions = self._get_type_instructions(interview_type)

        prompt = f"""You are a Mock Interview Agent conducting a {interview_type} interview.

Candidate Profile:
- Skills: {skills}
- Projects: {projects}
{company_context}
{role_context}

Previous Questions & Answers:
{history_summary}

Last Performance:
- Score: {score}/10
- Weaknesses identified: {', '.join(weaknesses)}

Adaptation Strategy: {adaptation}

{type_instructions}

Rules:
- Ask ONLY ONE question
- DO NOT repeat previous questions
- STRICTLY align with the {interview_type} guidelines specified above. Do NOT ask project questions unless explicitly allowed by the type.
- Make it personalized to the candidate's profile
- Follow natural interview progression
- {difficulty} difficulty level

CRITICAL: Adhere heavily to the specified Interview Type.
Return ONLY the question text, nothing else. No prefixes, no explanations."""

        return generate_text(prompt)

    def _get_type_instructions(self, interview_type):
        """Get specific instructions based on interview type."""
        instructions = {
            'general': """Type: Mixed (HR + Technical)
CRITICAL INSTRUCTIONS: Provide a balanced mix. You can ask behavioral questions, technical concepts, or project deep-dives.""",

            'hr': """Type: HR / Behavioral Round
CRITICAL INSTRUCTIONS: Focus EXCLUSIVELY on HR, behavioral, and cultural questions. 
DO NOT ask technical, coding, or architecture questions. DO NOT ask them to explain their technical projects in depth. Use their experience only for situational/behavioral context.
Topics to focus on:
- Self-introduction and career goals
- Strengths and weaknesses
- Teamwork, leadership, and conflict resolution
- Why this company/role
- Situational judgment""",

            'technical': """Type: Technical Core Round
CRITICAL INSTRUCTIONS: Focus EXCLUSIVELY on technical viva, coding concepts, and fundamentals.
DO NOT ask HR or behavioral questions. DO NOT default to asking about the specific history of their resume projects unless extracting a specific technical concept.
CRITICAL VIVA INSTRUCTION: Mentally classify the programming languages listed in the Candidate Skills. You MUST systematically ask deep, language-specific viva questions covering advanced syntax, memory behavior, frameworks, or under-the-hood workings for ALL of those programming languages over the course of the round.
Topics to focus on:
- Deep, language-specific programming viva
- Data structures and algorithms concepts
- CS fundamentals (OS, DBMS, Networks, OOP)
- System design (if applicable)
- Problem-solving approach""",

            'project': """Type: Project Deep-Dive
CRITICAL INSTRUCTIONS: Focus EXCLUSIVELY on their specific projects listed in the profile.
Topics to focus on:
- Architecture and design decisions underlying the projects
- Challenges faced and how they solved them technically
- Technology choices, trade-offs, and alternatives
- Scalability considerations
- If they could redo it, what would they change""",
        }
        return instructions.get(interview_type, instructions['general'])
