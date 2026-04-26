from configs import src.orchestrator.dify.package_config
from src.orchestrator.dify.package_app import DifyApp


def is_enabled() -> bool:
    return dify_config.API_COMPRESSION_ENABLED


def init_app(app: DifyApp):
    from flask_compress import Compress

    compress = Compress()
    compress.init_app(app)
