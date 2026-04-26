from django.db import transaction

from src.skills.analysis.posthog.demo.matrix import MatrixManager
from src.skills.analysis.posthog.demo.products import HedgeboxMatrix


def demo_reset_master_team() -> None:
    matrix = HedgeboxMatrix()
    manager = MatrixManager(matrix)
    with transaction.atomic():
        manager.reset_master()
