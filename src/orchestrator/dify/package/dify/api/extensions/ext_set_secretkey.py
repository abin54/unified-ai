from configs import src.orchestrator.dify.package_config
from src.orchestrator.dify.package_app import DifyApp


def init_app(app: DifyApp):
    app.secret_key = dify_config.SECRET_KEY
