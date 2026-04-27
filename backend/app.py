"""
AI Interview Coach — Flask Backend
Agentic architecture with specialized AI agents for interview preparation.
"""
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from database import db, User, InterviewSession

from agents.resume_agent import ResumeAnalyzerAgent
from agents.interview_agent import InterviewAgent
from agents.feedback_agent import FeedbackAgent
from agents.coding_agent import CodingRecommendationAgent
from agents.company_agent import CompanySpecificAgent
from agents.planner_agent import DailyPlannerAgent
from agents.analytics_agent import AnalyticsAgent

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///prepwise.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()

# Initialize agents
resume_agent = ResumeAnalyzerAgent()
interview_agent = InterviewAgent()
feedback_agent = FeedbackAgent()
coding_agent = CodingRecommendationAgent()
company_agent = CompanySpecificAgent()
planner_agent = DailyPlannerAgent()
analytics_agent = AnalyticsAgent()

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ─── RESUME ENDPOINTS ───────────────────────────────────────────────

@app.route('/api/resume/analyze', methods=['POST'])
def analyze_resume():
    """Upload and analyze a resume file."""
    if 'resume' not in request.files:
        return jsonify({'error': 'No resume file provided'}), 400

    file = request.files['resume']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    try:
        result = resume_agent.analyze_file(filepath)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)


@app.route('/api/resume/analyze-text', methods=['POST'])
def analyze_resume_text():
    """Analyze resume from pasted text."""
    data = request.get_json()
    text = data.get('text', '')
    if not text.strip():
        return jsonify({'error': 'No text provided'}), 400

    try:
        result = resume_agent.analyze_text(text)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─── INTERVIEW ENDPOINTS ────────────────────────────────────────────

@app.route('/api/interview/start', methods=['POST'])
def start_interview():
    """Start a new mock interview session."""
    data = request.get_json()
    resume_data = data.get('resume_data', {})
    interview_type = data.get('type', 'general')
    company = data.get('company', '')
    role = data.get('role', '')
    difficulty = data.get('difficulty', 'medium')

    try:
        question = interview_agent.generate_first_question(
            resume_data, interview_type, company, difficulty, role
        )
        return jsonify({'question': question})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/interview/answer', methods=['POST'])
def submit_answer():
    """Submit an answer and get feedback + next question."""
    data = request.get_json()
    resume_data = data.get('resume_data', {})
    question = data.get('question', '')
    answer = data.get('answer', '')
    interview_type = data.get('type', 'general')
    company = data.get('company', '')
    role = data.get('role', '')
    difficulty = data.get('difficulty', 'medium')
    history = data.get('history', [])

    try:
        # Get feedback from feedback agent
        feedback = feedback_agent.evaluate(question, answer, resume_data)

        # Generate next question from interview agent
        next_question = interview_agent.generate_next_question(
            resume_data, interview_type, company, difficulty, history, feedback, role
        )

        # Get coding suggestions if score is low
        coding_suggestions = []
        if feedback.get('score', 10) < 6:
            coding_suggestions = coding_agent.get_quick_suggestions(
                feedback.get('weaknesses', []), difficulty
            )

        # Analytics hints
        analytics_hint = analytics_agent.get_hint(feedback, history)

        return jsonify({
            'feedback': feedback,
            'question': next_question,
            'coding_suggestions': coding_suggestions,
            'analytics_hint': analytics_hint,
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/interview/save', methods=['POST'])
def save_interview():
    """Save an interview session to the database."""
    data = request.get_json()
    user_id = data.get('user_id')
    if not user_id:
        return jsonify({'error': 'User not logged in'}), 401
    
    session_data = data.get('session_data', {})
    score = data.get('score', 0)
    company = data.get('company', '')
    interview_type = data.get('type', '')
    
    try:
        sess = InterviewSession(user_id=user_id, company=company, interview_type=interview_type, score=score)
        sess.set_data(session_data)
        db.session.add(sess)
        db.session.commit()
        return jsonify({'message': 'Interview saved successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ─── USER & AUTH ENDPOINTS ──────────────────────────────────────────

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
        
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400
        
    user = User(username=username)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'Registered successfully', 'user_id': user.id, 'username': user.username, 'resume_data': None})

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        return jsonify({'message': 'Logged in successfully', 'user_id': user.id, 'username': user.username, 'resume_data': user.get_resume()})
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/user/save-resume', methods=['POST'])
def save_resume():
    data = request.get_json()
    user_id = data.get('user_id')
    resume_data = data.get('resume_data')
    if not user_id:
        return jsonify({'error': 'User not logged in'}), 401
    user = User.query.get(user_id)
    if user:
        user.set_resume(resume_data)
        db.session.commit()
        return jsonify({'message': 'Resume saved'})
    return jsonify({'error': 'User not found'}), 404

@app.route('/api/user/history', methods=['GET'])
def get_history():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'User not logged in'}), 401
        
    sessions = InterviewSession.query.filter_by(user_id=user_id).order_by(InterviewSession.date.desc()).all()
    history = []
    for s in sessions:
        history.append({
            'id': s.id,
            'date': s.date.isoformat(),
            'company': s.company,
            'type': s.interview_type,
            'score': s.score,
            'data': s.get_data()
        })
    return jsonify({'history': history})


# ─── ANALYTICS ENDPOINT ─────────────────────────────────────────────

@app.route('/api/analytics/generate', methods=['POST'])
def generate_analytics():
    """Generate analytics from interview history."""
    data = request.get_json()
    history = data.get('history', [])

    try:
        result = analytics_agent.generate_report(history)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─── DAILY PLANNER ENDPOINT ─────────────────────────────────────────

@app.route('/api/planner/generate', methods=['POST'])
def generate_plan():
    """Generate daily preparation plan."""
    data = request.get_json()
    resume_data = data.get('resume_data', {})
    analytics = data.get('analytics', {})
    company = data.get('company', '')

    try:
        plan = planner_agent.generate_plan(resume_data, analytics, company)
        return jsonify(plan)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─── CODING SUGGESTIONS ENDPOINT ────────────────────────────────────

@app.route('/api/coding/suggestions', methods=['POST'])
def coding_suggestions():
    """Get personalized coding problem suggestions."""
    data = request.get_json()
    weak_areas = data.get('weak_areas', [])
    difficulty = data.get('difficulty', 'medium')

    try:
        result = coding_agent.get_suggestions(weak_areas, difficulty)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─── COMPANY PREP ENDPOINT ──────────────────────────────────────────

@app.route('/api/company/prepare', methods=['POST'])
def company_prepare():
    """Get company-specific preparation data."""
    data = request.get_json()
    company = data.get('company', '')
    resume_data = data.get('resume_data', {})

    if not company:
        return jsonify({'error': 'Company name required'}), 400

    try:
        result = company_agent.prepare(company, resume_data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─── HEALTH CHECK ───────────────────────────────────────────────────

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'agents': {
        'resume': 'active',
        'interview': 'active',
        'feedback': 'active',
        'coding': 'active',
        'company': 'active',
        'planner': 'active',
        'analytics': 'active',
    }})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
