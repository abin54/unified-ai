"""Chat channels module with plugin architecture."""

from src.skills.ml.deeptutor.tutorbot.channels.base import BaseChannel
from src.skills.ml.deeptutor.tutorbot.channels.manager import ChannelManager

__all__ = ["BaseChannel", "ChannelManager"]
