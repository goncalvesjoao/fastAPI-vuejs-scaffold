# Your_Project_Name Backend

## Tech Stack

- **Runtime:** Python 3.11+
- **Package management:** pip
- **API framework:** FastAPI
- **ASGI server:** Uvicorn
- **Persistence:** SQLModel on SQLite-compatible storage
- **Production database:** Turso/libSQL
- **Configuration:** pydantic-settings
- **HTTP/JWT support:** httpx plus Clerk token/JWKS verification

### Quality and Testing

- **Linting and formatting:** Ruff
- **Type checking:** ty
- **Tests:** pytest

## Prerequisites

- Python 3.11+

## Setup

```bash
python3.11 -m venv .venv
.venv/bin/python -m pip install --upgrade pip
.venv/bin/python -m pip install -e ".[dev]"
```

## Development

The project uses [pip](https://pip.pypa.io/) for dependency installation,
[Ruff](https://docs.astral.sh/ruff/) for linting and formatting,
[ty](https://docs.astral.sh/ty/) for static type checking, and
[pytest](https://docs.pytest.org/en/stable/) for automated tests. Repository
settings configure the same tools in **Zed** and **VS Code**.

```bash
.venv/bin/python -m your_project_name.app
```

Set `ENVIRONMENT=development` to enable Uvicorn reload through the app module.
The root `npm run backend:dev` script does this for local development.

### Database

The backend initializes SQLModel tables at startup. By default, dev and CI use
local libSQL through `DATABASE_URL=sqlite+libsql:///data/app.db`, which resolves
to `backend/data/app.db`.

For production Turso/libSQL, set:

```bash
DATABASE_URL=libsql://your-database-org.turso.io
DATABASE_AUTH_TOKEN=your-database-token
```

Leave `DATABASE_AUTH_TOKEN` unset or empty when the configured database does
not require auth.

### Lint

```bash
.venv/bin/python -m ruff check .
```

### Format

```bash
.venv/bin/python -m ruff format .
```

### Type-check

```bash
.venv/bin/python -m ty check
```

### Generate support files

The following command generates support files, like saving the OpenAPI schema to the `frontend` app, which is used to generate TypeScript types for the frontend.

```bash
.venv/bin/python scripts/generate_support_files.py
```

### Test

```bash
.venv/bin/python -m pytest
```

With test coverage:

```bash
.venv/bin/python -m pytest --cov-report=html --cov=your_project_name tests/
```
