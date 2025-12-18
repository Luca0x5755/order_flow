# OrderFlow

OrderFlow is a B2B order management system designed with a modular architecture, featuring a FastAPI backend and a React frontend.

## Prerequisites

- **Python 3.12+**
- **uv**: An extremely fast Python package installer and resolver.

## Installation

1. **Initialize the Environment**:
   Ensure you have `uv` installed. Then, sync the project dependencies:
   ```bash
   uv sync
   ```
   This command creates a virtual environment (defaulting to `.venv`) and installs all dependencies listed in `pyproject.toml`.

## Usage

### Starting the Backend Server

To run the FastAPI development server:
```bash
uv run uvicorn backend.main:app --reload
```
The API will be available at `http://localhost:8000`.
API Documentation (Swagger UI) will be at `http://localhost:8000/docs`.

### Running Scripts

To distribute or run utility scripts (like the Google Sheets sync):
```bash
uv run scripts/sync_sheets.py
```

## Project Structure

```
OrderFlow/
├── frontend/           # Lovable React Project
├── backend/            # FastAPI Backend
│   ├── auth/           # Authentication Module
│   ├── admin/          # Admin Management Module
│   ├── crm/            # CRM Implementation
│   ├── database.py     # Database Connection
│   └── main.py         # App Entry Point
├── scripts/            # Utility Scripts
├── docs/               # Documentation
└── pyproject.toml      # Project Configuration & Dependencies
```

## Configuration

Copy `.env.example` to `.env` and update the values:
```bash
cp .env.example .env
```
Ensure you have set your generic `DATABASE_URL` and Supabase credentials.
