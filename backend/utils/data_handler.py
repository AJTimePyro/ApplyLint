from typing import Any

from pydantic import BaseModel


def serialize(value: Any) -> Any:
    if isinstance(value, BaseModel):
        return value.model_dump(mode="json")

    if isinstance(value, dict):
        return {
            key: serialize(item)
            for key, item in value.items()
        }

    if isinstance(value, list):
        return [serialize(item) for item in value]

    return value
