import os
from src.skills.ml.vision.stable_diffusion.modules import paths


def preload(parser):
    parser.add_argument("--scunet-models-path", type=str, help="Path to directory with ScuNET model file(s).", default=os.path.join(paths.models_path, 'ScuNET'))
