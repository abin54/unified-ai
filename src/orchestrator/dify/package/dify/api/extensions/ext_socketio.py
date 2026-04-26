import socketio  # type: ignore[reportMissingTypeStubs]

from configs import src.orchestrator.dify.package_config

sio = socketio.Server(async_mode="gevent", cors_allowed_origins=dify_config.CONSOLE_CORS_ALLOW_ORIGINS)
