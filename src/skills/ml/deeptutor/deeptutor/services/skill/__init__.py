"""Skill service: load user-authored SKILL.md files and inject them into the chat system prompt."""

from src.skills.ml.deeptutor.services.skill.service import SkillService, get_skill_service

__all__ = ["SkillService", "get_skill_service"]
