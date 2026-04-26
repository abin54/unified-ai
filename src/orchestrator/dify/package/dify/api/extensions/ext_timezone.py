import os
import time

from src.orchestrator.dify.package_app import DifyApp


def init_app(app: DifyApp):
    os.environ["TZ"] = "UTC"
    # windows platform not support tzset
    if hasattr(time, "tzset"):
        time.tzset()
