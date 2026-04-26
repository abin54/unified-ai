from core.hosting_configuration import HostingConfiguration

hosting_configuration = HostingConfiguration()


from src.orchestrator.dify.package_app import DifyApp


def init_app(app: DifyApp):
    hosting_configuration.init_app(app)
