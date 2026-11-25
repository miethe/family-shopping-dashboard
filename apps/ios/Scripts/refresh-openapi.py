#!/usr/bin/env python3
"""Regenerate the iOS OpenAPI snapshot from a local FastAPI application import."""

import argparse
import json
import sys
from http import HTTPStatus
from pathlib import Path

IOS_DIRECTORY = Path(__file__).resolve().parents[1]
API_DIRECTORY = IOS_DIRECTORY.parents[1] / "services" / "api"
OUTPUT = IOS_DIRECTORY / "openapi.json"


def normalize(value, named_entries=False):
    """Drop server-side example prose while preserving routes and schema fields."""
    if isinstance(value, list):
        return [normalize(item) for item in value]
    if not isinstance(value, dict):
        return value

    schema_maps = {"properties", "patternProperties", "$defs", "dependentSchemas"}
    annotations = {"description", "example", "examples"}
    return {
        key: normalize(child, named_entries=key in schema_maps and not named_entries)
        for key, child in value.items()
        if named_entries or key not in annotations
    }


def contract_snapshot(openapi):
    snapshot = normalize(openapi)
    # OpenAPI requires a description on each response. Use the HTTP reason phrase
    # in place of the app's documentation prose.
    for path in snapshot["paths"].values():
        for operation in path.values():
            if not isinstance(operation, dict):
                continue
            for status, response in operation.get("responses", {}).items():
                if "$ref" not in response:
                    # Keep the snapshot stable across Python's HTTP 422 phrase change.
                    response["description"] = "Unprocessable Entity" if status == "422" else HTTPStatus(int(status)).phrase
    return snapshot


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Verify the snapshot is current.")
    args = parser.parse_args()

    # Generate the schema directly, without starting ASGI or opening a database connection.
    sys.dont_write_bytecode = True
    sys.path.insert(0, str(API_DIRECTORY))
    from app.main import app

    snapshot = json.dumps(contract_snapshot(app.openapi()), indent=2, sort_keys=True, ensure_ascii=False) + "\n"
    if args.check:
        if not OUTPUT.exists() or snapshot != OUTPUT.read_text(encoding="utf-8"):
            print(f"{OUTPUT.name} is stale. Run {Path(__file__).name} to regenerate it.", file=sys.stderr)
            return 1
        return 0

    OUTPUT.write_text(snapshot, encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
