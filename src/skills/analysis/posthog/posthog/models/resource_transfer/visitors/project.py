from django.db import models

from src.skills.analysis.posthog.models.resource_transfer.visitors.base import ResourceTransferVisitor


class ProjectVisitor(ResourceTransferVisitor, kind="Project", immutable=True, user_facing=False):
    @classmethod
    def get_model(cls) -> type[models.Model]:
        from src.skills.analysis.posthog.models import Project

        return Project
