"""
LLM utility — API integration restoring Groq + LLaMA 3 70B for maximum intelligence.
Provides a centralized interface for all agents to call the Groq api for blazing fast open-source models.
Includes auto-retry with exponential backoff and fallback models.
"""
import os
import json
import time
from groq import Groq
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the backend directory (parent of agents/)
_env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(_env_path)

GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')

# Fallback model chain for Groq
MODEL_CHAIN = [
    'llama-3.3-70b-versatile',
    'llama3-70b-8192',
    'llama3-8b-8192',
    'mixtral-8x7b-32768',
]

MAX_RETRIES = 3
RETRY_DELAY = 6  # seconds

# Initialize the client
client = None
if GROQ_API_KEY and GROQ_API_KEY != 'your_groq_api_key_here':
    client = Groq(api_key=GROQ_API_KEY)
    print(f"[LLM] OK - Groq API Client Restored (Intelligence mode activated!)")
else:
    print("[LLM] WARNING - No API key found. Set GROQ_API_KEY in backend/.env")


def _call_with_retry(call_fn, model_name=None):
    """
    Call the Groq API with retry logic and fallback models.
    call_fn(model) -> response
    """
    models_to_try = [model_name] if model_name else []
    for m in MODEL_CHAIN:
        if m not in models_to_try:
            models_to_try.append(m)

    last_error = None
    for model in models_to_try:
        for attempt in range(MAX_RETRIES):
            try:
                return call_fn(model)
            except Exception as e:
                error_str = str(e)
                last_error = e
                # Handle rate limits or connection errors
                if '429' in error_str or 'RateLimit' in error_str or 'ConnectionError' in error_str:
                    if attempt < MAX_RETRIES - 1:
                        wait = RETRY_DELAY * (attempt + 1)
                        print(f"[LLM] Rate limited on {model}, retrying in {wait}s (attempt {attempt+1}/{MAX_RETRIES})")
                        time.sleep(wait)
                    else:
                        print(f"[LLM] Rate limit exhausted on {model}, trying next model...")
                        break  # Break inner loop, try next model
                else:
                    raise  # Non-rate-limit error, raise immediately

    raise last_error  # All models exhausted


def generate_json(prompt, agent_type=None, model_name='llama-3.3-70b-versatile'):
    """
    Generate a highly intelligent personalized response from Groq and parse it as JSON.
    Auto-retries on rate limits and tries fallback models.
    """
    if not client:
        return {'error': 'High intelligence mode requires an API key. Set GROQ_API_KEY in backend/.env'}

    try:
        def call_fn(model):
            return client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a cutting-edge expert AI agent for technical interviews. Provide ultra-personalized, contextual insight deeply related to the candidate's resume variables."
                    },
                    {
                        "role": "user",
                        "content": prompt + "\n\nIMPORTANT: You must respond ONLY with a valid JSON object matching the requested schema. Do not include markdown code blocks or any other text before/after the JSON."
                    }
                ],
                model=model,
                temperature=0.7,
                response_format={"type": "json_object"}
            )

        response = _call_with_retry(call_fn, model_name)
        text = response.choices[0].message.content.strip()
        
        return json.loads(text)
        
    except json.JSONDecodeError as e:
        print("[LLM Error] JSON parsing failed: ", e)
        # Fallback manual parsing if Groq outputs code blocks
        try:
            start = text.find('{')
            end = text.rfind('}') + 1
            if start != -1 and end > start:
                return json.loads(text[start:end])
                
            start = text.find('[')
            end = text.rfind(']') + 1
            if start != -1 and end > start:
                return json.loads(text[start:end])
        except:
            pass
            
        return {'error': f'Failed to parse JSON response: {text}'}
        
    except Exception as e:
        error_msg = str(e)
        if '429' in error_msg or 'RateLimit' in error_msg:
            return {
                'error': 'API quota exhausted on Groq. Please try again later or check your dashboard.'
            }
        return {'error': error_msg}


def generate_text(prompt, model_name='llama-3.3-70b-versatile'):
    """Generate a high IQ plain text response from Groq."""
    if not client:
        return 'Error: Groq API key not configured. Set GROQ_API_KEY in backend/.env'

    try:
        def call_fn(model):
            return client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=model,
                temperature=0.7
            )

        response = _call_with_retry(call_fn, model_name)
        return response.choices[0].message.content.strip()
    except Exception as e:
        error_msg = str(e)
        if '429' in error_msg or 'RateLimit' in error_msg:
            return 'Error: API quota exhausted on Groq. Try again later.'
        return f"Error: {error_msg}"
