from flask_restx import Resource

from configs import src.orchestrator.dify.package_config
from controllers.service_api import service_api_ns


@service_api_ns.route("/")
class IndexApi(Resource):
    def get(self):
        return {
            "welcome": "Dify OpenAPI",
            "api_version": "v1",
            "server_version": dify_config.project.version,
        }
