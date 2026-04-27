"""
Company-Specific Agent using RAG (ChromaDB + Langchain)
Retrieves interview patterns locally using HuggingFace embeddings.
No external API keys required.
"""
import json
from .llm_utils import generate_json

# We will initialize Chroma and Embeddings locally lazily to save startup time
vectorstore = None

def init_rag():
    global vectorstore
    if vectorstore is not None:
        return
        
    try:
        from langchain_community.vectorstores import Chroma
        from langchain_community.embeddings import HuggingFaceEmbeddings
        from langchain_core.documents import Document
        
        print("[RAG] Initializing local ChromaDB and Sentence-Transformers...")
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        
        docs = [
            Document(page_content="Google interview focuses on System Design, Algorithms, Data Structures, Behavioral (Googleyness). Rounds: Phone Screen, Coding x2, System Design, Behavioral. Difficulty is hard. Tips: Focus on optimal solutions, Think out loud.", metadata={"company": "google"}),
            Document(page_content="Amazon interview focuses on Leadership Principles, System Design, OOP, Behavioral. Rounds: Online Assessment, Phone Screen, Virtual Onsite (4-5 rounds). Difficulty is hard. Tips: Use STAR method, Know all 16 Leadership Principles.", metadata={"company": "amazon"}),
            Document(page_content="Microsoft interview focuses on Problem Solving, System Design, Coding, Behavioral. Rounds: Phone Screen, Coding x2, System Design, Behavioral. Difficulty is hard. Tips: Focus on clean code, Discuss trade-offs.", metadata={"company": "microsoft"}),
            Document(page_content="Meta interview focuses on Algorithms, System Design, Behavioral, Product Sense. Rounds: Phone Screen, Coding x2, System Design, Behavioral. Difficulty is hard. Tips: Practice graph problems, Speed matters.", metadata={"company": "meta"}),
            Document(page_content="TCS interview focuses on Aptitude, Basic Coding, HR. Rounds: Online Test, Technical Interview, Managerial, HR. Difficulty is medium. Tips: Focus on aptitude, Know DBMS basics.", metadata={"company": "tcs"})
        ]
        
        vectorstore = Chroma.from_documents(docs, embeddings)
        print("[RAG] OK - Local Knowledge Base loaded.")
    except Exception as e:
        print(f"[RAG] ERROR - Failed to load ChromaDB: {e}")

class CompanySpecificAgent:
    """Agent that provides company-specific interview preparation via Local RAG."""

    def prepare(self, company, resume_data):
        """Generate company-specific preparation data using Retriever."""
        init_rag()
        
        kb_context = ""
        if vectorstore:
            try:
                # Semantic search using ChromaDB
                results = vectorstore.similarity_search(company, k=1)
                if results:
                    kb_context = f"Company Context from Vector DB: {results[0].page_content}"
            except:
                pass

        skills = ', '.join(resume_data.get('skills', [])[:10])
        projects = ', '.join([
            p.get('name', p) if isinstance(p, dict) else str(p)
            for p in resume_data.get('projects', [])[:5]
        ])

        prompt = f"""You are a Company-Specific Agent.
{kb_context}
Target: {company}
Candidate Skills: {skills}
Candidate Projects: {projects}

You MUST return your response as a JSON object matching this schema:
{{
    "overview": "Short company overview",
    "placement_insights": ["Specific suggestions and insights needed to get placed at this company"],
    "interview_pattern": {{
        "rounds": [
            {{"name": "Round name", "description": "Round description"}}
        ]
    }},
    "focus_topics": ["Topic 1", "Topic 2"],
    "tips": ["Preparation tip 1"],
    "sample_questions": ["Sample question 1"],
    "coding_questions": [
        {{"title": "Question Title", "difficulty": "Medium", "description": "Short description of the problem"}}
    ]
}}
IMPORTANT: You MUST provide at least 5-7 varied coding questions in the 'coding_questions' array that are frequently asked at this specific company.
"""
        return generate_json(prompt, agent_type="company")
