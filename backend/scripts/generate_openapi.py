import argparse
import json
from pathlib import Path

from your_project_name.app import app


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate support files")
    parser.add_argument(
        "--openapi-output",
        type=Path,
        default=Path("../frontend/openapi.json"),
        help="Output path for the OpenAPI JSON file",
    )

    args = parser.parse_args()

    schema = app.openapi()

    args.openapi_output.parent.mkdir(parents=True, exist_ok=True)
    args.openapi_output.write_text(json.dumps(schema, indent=2, ensure_ascii=False))

    print(f"OpenAPI docs written to: {args.openapi_output}")


if __name__ == "__main__":
    main()
