"""
Resume Analyzer Agent
Extracts skills, projects, experience, and education from resumes using NLP + LLM.
"""
import re
import os
from .llm_utils import generate_json


class ResumeAnalyzerAgent:
    """Agent responsible for parsing and analyzing resumes."""

    # Common tech skills for keyword extraction
    TECH_SKILLS = {
        'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'c', 'go', 'rust',
        'kotlin', 'swift', 'ruby', 'php', 'scala', 'r', 'matlab', 'perl', 'dart',
        'react', 'angular', 'vue', 'svelte', 'next.js', 'nuxt', 'express', 'django',
        'flask', 'fastapi', 'spring', 'spring boot', 'node.js', 'nodejs',
        'html', 'css', 'tailwind', 'bootstrap', 'sass', 'less',
        'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
        'firebase', 'supabase', 'dynamodb', 'cassandra', 'neo4j',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
        'git', 'github', 'gitlab', 'ci/cd', 'jenkins', 'github actions',
        'machine learning', 'deep learning', 'nlp', 'computer vision',
        'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy',
        'opencv', 'keras', 'transformers', 'langchain', 'llm',
        'rest api', 'graphql', 'grpc', 'websocket', 'microservices',
        'linux', 'unix', 'bash', 'powershell',
        'agile', 'scrum', 'jira', 'confluence',
        'data structures', 'algorithms', 'system design', 'oop',
        'dbms', 'operating systems', 'computer networks', 'dsa',
    }

    def analyze_file(self, filepath):
        """Analyze a resume file (PDF, DOCX, or TXT)."""
        text = self._extract_text(filepath)
        return self.analyze_text(text)

    def analyze_text(self, text):
        """Analyze resume from raw text using NLP + LLM."""
        # First pass: keyword extraction
        keyword_skills = self._extract_skills_keywords(text)

        # LLM-powered deep analysis
        prompt = f"""You are a Resume Analyzer Agent in an AI Interview Coach system.
Analyze the following resume text and extract structured information.

Resume Text:
\"\"\"
{text}
\"\"\"

Extract and return a JSON object with these fields:
{{
  "skills": ["list of technical and soft skills found"],
  "projects": [
    {{
      "name": "project name",
      "description": "brief description",
      "technologies": ["tech used"]
    }}
  ],
  "experience": [
    {{
      "role": "job title",
      "company": "company name",
      "duration": "time period",
      "highlights": ["key achievements"]
    }}
  ],
  "education": [
    {{
      "degree": "degree name",
      "institution": "school/university",
      "year": "graduation year or period",
      "gpa": "if mentioned"
    }}
  ],
  "certifications": ["list of certifications"],
  "summary": "2-3 sentence professional summary of the candidate",
  "strengths": ["top 3-5 strengths based on the resume"],
  "improvement_areas": ["areas where the candidate could improve"]
}}

Be thorough and extract everything relevant. If a field has no data, use an empty array.
Make the skills list comprehensive - include both explicit and implicit skills."""

        result = generate_json(prompt)

        # Merge keyword-extracted skills with LLM-extracted skills
        if isinstance(result, dict) and 'skills' in result:
            all_skills = set(result['skills'])
            all_skills.update(keyword_skills)
            result['skills'] = sorted(list(all_skills))

        return result

    def _extract_text(self, filepath):
        """Extract text from various file formats."""
        ext = os.path.splitext(filepath)[1].lower()

        if ext == '.pdf':
            return self._extract_pdf(filepath)
        elif ext in ('.docx', '.doc'):
            return self._extract_docx(filepath)
        elif ext == '.txt':
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
        else:
            raise ValueError(f'Unsupported file format: {ext}')

    def _extract_pdf(self, filepath):
        """Extract text from PDF."""
        try:
            from PyPDF2 import PdfReader
            reader = PdfReader(filepath)
            text_parts = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    text_parts.append(text)
            return '\n'.join(text_parts)
        except ImportError:
            raise ImportError("PyPDF2 is required for PDF parsing")

    def _extract_docx(self, filepath):
        """Extract text from DOCX."""
        try:
            from docx import Document
            doc = Document(filepath)
            return '\n'.join([para.text for para in doc.paragraphs])
        except ImportError:
            raise ImportError("python-docx is required for DOCX parsing")

    def _extract_skills_keywords(self, text):
        """Extract skills using keyword matching (NLP pass)."""
        text_lower = text.lower()
        found = set()
        for skill in self.TECH_SKILLS:
            # Use word boundary matching
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text_lower):
                found.add(skill.title() if len(skill) > 3 else skill.upper())
        return found
