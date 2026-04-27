"""
Analytics & Learning Loop Agent
Tracks performance trends, identifies weak areas,
and continuously improves recommendations.
"""


class AnalyticsAgent:
    """Agent responsible for performance analytics and adaptive learning."""

    def get_hint(self, feedback, history):
        """Generate quick analytics hints from the latest feedback."""
        weak_areas = set()
        weaknesses = feedback.get('weaknesses', [])

        # Extract weak area categories from weaknesses
        keyword_map = {
            'data structure': 'Data Structures',
            'algorithm': 'Algorithms',
            'system design': 'System Design',
            'sql': 'DBMS',
            'database': 'DBMS',
            'os': 'Operating Systems',
            'network': 'Computer Networks',
            'oop': 'OOP Concepts',
            'object oriented': 'OOP Concepts',
            'communication': 'Communication Skills',
            'clarity': 'Communication Skills',
            'depth': 'Technical Depth',
            'example': 'Use of Examples',
            'specific': 'Specificity',
            'structure': 'Answer Structure',
            'time complexity': 'Time Complexity Analysis',
            'space complexity': 'Space Complexity Analysis',
            'edge case': 'Edge Case Handling',
            'trade-off': 'Design Trade-offs',
            'behavioral': 'Behavioral Skills',
            'star': 'STAR Method',
        }

        for weakness in weaknesses:
            weakness_lower = weakness.lower()
            for keyword, area in keyword_map.items():
                if keyword in weakness_lower:
                    weak_areas.add(area)

        # If no specific areas matched, add the raw weaknesses
        if not weak_areas and weaknesses:
            weak_areas.update(weaknesses[:3])

        # Focus recommendation based on score trend
        scores = [
            entry.get('feedback', {}).get('score', 5)
            for entry in history
            if entry.get('feedback')
        ]
        scores.append(feedback.get('score', 5))

        focus = ""
        if len(scores) >= 3:
            recent_avg = sum(scores[-3:]) / 3
            if recent_avg < 5:
                focus = "Focus on fundamentals. Review core concepts before attempting harder questions."
            elif recent_avg < 7:
                focus = "Good progress! Focus on depth and specificity in your answers."
            else:
                focus = "Excellent performance! Challenge yourself with harder questions and system design."
        else:
            focus = "Keep practicing to establish a performance baseline."

        return {
            'weak_areas': list(weak_areas),
            'focus_recommendation': focus,
        }

    def generate_report(self, history):
        """Generate a comprehensive analytics report from interview history."""
        if not history:
            return {
                'total_sessions': 0,
                'total_questions': 0,
                'average_score': 0,
                'score_trend': [],
                'weak_areas': [],
                'strong_areas': [],
                'category_breakdown': {},
            }

        all_questions = []
        for session in history:
            qs = session.get('questions', [])
            all_questions.extend(qs)

        scores = [
            q.get('feedback', {}).get('score', 0)
            for q in all_questions
            if q.get('feedback')
        ]

        avg_score = sum(scores) / len(scores) if scores else 0

        # Aggregate strengths & weaknesses
        strength_counts = {}
        weakness_counts = {}
        for q in all_questions:
            fb = q.get('feedback', {})
            for s in fb.get('strengths', []):
                strength_counts[s] = strength_counts.get(s, 0) + 1
            for w in fb.get('weaknesses', []):
                weakness_counts[w] = weakness_counts.get(w, 0) + 1

        top_strengths = sorted(strength_counts.items(), key=lambda x: -x[1])[:5]
        top_weaknesses = sorted(weakness_counts.items(), key=lambda x: -x[1])[:5]

        # Score by session
        score_trend = []
        for i, session in enumerate(history):
            qs = session.get('questions', [])
            s_scores = [q.get('feedback', {}).get('score', 0) for q in qs if q.get('feedback')]
            avg = sum(s_scores) / len(s_scores) if s_scores else 0
            score_trend.append({
                'session': i + 1,
                'score': round(avg, 1),
                'type': session.get('type', 'general'),
            })

        return {
            'total_sessions': len(history),
            'total_questions': len(all_questions),
            'average_score': round(avg_score, 1),
            'score_trend': score_trend,
            'strong_areas': [s[0] for s in top_strengths],
            'weak_areas': [w[0] for w in top_weaknesses],
            'category_breakdown': {
                s.get('type', 'general'): len(s.get('questions', []))
                for s in history
            },
        }
