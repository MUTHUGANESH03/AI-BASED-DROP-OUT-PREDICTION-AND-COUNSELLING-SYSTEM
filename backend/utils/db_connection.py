# backend/utils/db_connection.py
from pymongo import MongoClient
import os

# --- Configuration ---
# NOTE: Replace with your actual credentials/environment variable in production
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DATABASE_NAME = "student_success_db"

try:
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    
    # Optional: Test connection (will throw error if connection fails)
    client.admin.command('ping') 
    print(f"Successfully connected to MongoDB: {DATABASE_NAME}")

except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    # In a real app, you might raise an exception or handle gracefully
    db = None 

def get_student_collection():
    """Returns the students collection."""
    if db:
        return db['students']
    return None

def get_interventions_collection():
    """Returns the interventions collection."""
    if db:
        return db['interventions']
    return None

def get_quizzes_collection():
    """Returns the quizzes collection."""
    if db:
        return db['quizzes']
    return None