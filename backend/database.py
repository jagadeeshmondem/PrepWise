import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import json

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    resume_data = db.Column(db.Text, nullable=True) # JSON blob of resume
    interviews = db.relationship('InterviewSession', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def set_resume(self, data_dict):
        self.resume_data = json.dumps(data_dict)

    def get_resume(self):
        return json.loads(self.resume_data) if self.resume_data else None

class InterviewSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    company = db.Column(db.String(100), nullable=True)
    interview_type = db.Column(db.String(50), nullable=True)
    score = db.Column(db.Float, nullable=True) # Average score
    data = db.Column(db.Text, nullable=False) # JSON blob of history

    def set_data(self, data_dict):
        self.data = json.dumps(data_dict)

    def get_data(self):
        return json.loads(self.data)
