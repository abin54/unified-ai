from core.extension.extension import Extension
from src.orchestrator.dify.package_app import DifyApp


def init_app(app: DifyApp):
    code_based_extension.init()


code_based_extension = Extension()
