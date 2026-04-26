import asyncio
import os
import sys

# Add src to sys.path
sys.path.append(os.getcwd())

from src.skills.ml.papers_tool import _op_search

async def main():
    print("Searching for security vulnerability scanner papers...")
    # Mocking args for search operation
    args = {"query": "security vulnerability scanner", "operation": "search"}
    limit = 5
    result = await _op_search(args, limit)
    
    if result.get("isError"):
        print(f"Error: {result.get('formatted')}")
    else:
        print(result.get("formatted"))

if __name__ == "__main__":
    asyncio.run(main())
