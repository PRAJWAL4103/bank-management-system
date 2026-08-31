"""
MongoDB connection and utilities for the bank management system.
"""
from pymongo import MongoClient
from django.conf import settings
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# MongoDB connection setup
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
MONGO_DB_NAME = os.getenv('MONGO_DB_NAME', 'bank_management')

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # Test connection
    client.admin.command('ping')
    db = client[MONGO_DB_NAME]
    print(f"[OK] Connected to MongoDB: {MONGO_DB_NAME}")
except Exception as e:
    print(f"[WARNING] MongoDB connection warning: {e}")
    print(f"  Ensure MongoDB is running at: {MONGO_URI}")
    db = None


def get_db():
    """Get MongoDB database instance"""
    if db is None:
        raise Exception("MongoDB connection not established. Please check your connection string in .env file")
    return db


def get_collection(collection_name):
    """Get a specific collection from MongoDB"""
    if db is None:
        raise Exception("MongoDB connection not established")
    return db[collection_name]


def close_connection():
    """Close MongoDB connection"""
    if client:
        client.close()
        print("MongoDB connection closed")
