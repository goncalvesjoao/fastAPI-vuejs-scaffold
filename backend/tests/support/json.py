from typing import Any


def pick(data: dict[str, Any], *keys: str) -> dict[str, Any]:
    return {key: data[key] for key in keys}
