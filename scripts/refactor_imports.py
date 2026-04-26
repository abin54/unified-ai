import os
import re

def refactor_imports(directory):
    # Mapping of legacy package names to new unified paths
    rules = [
        (r'import agent\.core', 'import src.orchestrator.core'),
        (r'from agent\.core', 'from src.orchestrator.core'),
        (r'import agent\.tools', 'import src.skills.ml'),
        (r'from agent\.tools', 'from src.skills.ml'),
        (r'import raganything', 'import src.memory.rag_anything'),
        (r'from raganything', 'from src.memory.rag_anything'),
        (r'import lightrag', 'import src.memory.lightrag'),
        (r'from lightrag', 'from src.memory.lightrag'),
        (r'import claude-context', 'import src.memory.claude_context'),
        (r'from claude-context', 'from src.memory.claude_context'),
        (r'import deep_ep', 'import src.skills.ml.deep_ep'),
        (r'from deep_ep', 'from src.skills.ml.deep_ep'),
        (r'import autogpt', 'import src.skills.agents.autogpt'),
        (r'from autogpt', 'from src.skills.agents.autogpt'),
        (r'import TrendRadar', 'import src.skills.analysis.trend_radar'),
        (r'from TrendRadar', 'from src.skills.analysis.trend_radar'),
        (r'import stocksight', 'import src.skills.analysis.stocksight'),
        (r'from stocksight', 'from src.skills.analysis.stocksight'),
        (r'import dify', 'import src.orchestrator.dify.package'),
        (r'from dify', 'from src.orchestrator.dify.package'),
        (r'import posthog', 'import src.skills.analysis.posthog'),
        (r'from posthog', 'from src.skills.analysis.posthog'),
        (r'import manifest', 'import src.shared.manifest'),
        (r'from manifest', 'from src.shared.manifest'),
        (r'import hermes', 'import src.skills.agents.hermes'),
        (r'from hermes', 'from src.skills.agents.hermes'),
        (r'import deeptutor', 'import src.skills.ml.deeptutor'),
        (r'from deeptutor', 'from src.skills.ml.deeptutor'),
        (r'import claude_code', 'import src.skills.agents.claude_code'),
        (r'from claude_code', 'from src.skills.agents.claude_code'),
        (r'import gstack', 'import src.skills.coding.gstack'),
        (r'from gstack', 'from src.skills.coding.gstack'),
        (r'import openclaw', 'import src.skills.agents.openclaw'),
        (r'from openclaw', 'from src.skills.agents.openclaw'),
        (r'import modules', 'import src.skills.ml.vision.stable_diffusion.modules'),
        (r'from modules', 'from src.skills.ml.vision.stable_diffusion.modules'),
        (r'import hexstrike', 'import src.skills.security.hexstrike'),
        (r'import hexstrike', 'import src.skills.security.hexstrike'),
        (r'import hexstrike', 'import src.skills.security.hexstrike'),
        (r'from hexstrike', 'from src.skills.security.hexstrike'),
        (r'from agent\.config', 'from src.orchestrator.config'),
        (r'from agent\.utils', 'from src.orchestrator.utils'),
        (r'from agent\.context_manager', 'from src.orchestrator.context_manager'),
    ]

    compiled_rules = [(re.compile(p), r) for p, r in rules]

    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    
                    new_content = content
                    for pattern, replacement in compiled_rules:
                        new_content = pattern.sub(replacement, new_content)
                    
                    if new_content != content:
                        with open(path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Refactored {path}")
                except Exception as e:
                    print(f"Error refactoring {path}: {e}")

if __name__ == "__main__":
    refactor_imports('src')
    print("Master refactor complete.")
