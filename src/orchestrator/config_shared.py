import os
import torch

# GPU / Hardware Acceleration
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
if DEVICE == "cuda":
    print(f"--- GPU ACCELERATION ENABLED: {torch.cuda.get_device_name(0)} ---")
else:
    print("--- WARNING: CUDA NOT DETECTED. FALLING BACK TO CPU ---")

# LLM Configuration
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "tinyllama") # Optimized for local GPU memory

# Unified Tool Paths (Corrected for src/ structure)
TREND_RADAR_PATH = os.path.join("src", "skills", "analysis", "trend_radar")
STOCKSIGHT_PATH = os.path.join("src", "skills", "analysis", "stocksight")
RAG_ANYTHING_PATH = os.path.join("src", "memory", "rag_anything")
DIFY_PATH = os.path.join("src", "orchestrator", "dify")

# Memory Settings
CHROMA_DB_PATH = os.path.join("src", "memory", "chroma_db")
