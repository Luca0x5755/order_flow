# OrderFlow

OrderFlow 是一個 B2B 訂單管理系統，採用模組化架構設計，具備 FastAPI 後端與 React 前端。

## 前置需求

- **Python 3.12+**
- **uv**: 極速的 Python 套件安裝與解析工具。

## 安裝說明

1. **初始化環境**:
   確保您已安裝 `uv`。然後同步專案依賴：
   ```bash
   uv sync
   ```
   此指令會建立虛擬環境（預設為 `.venv`）並安裝 `pyproject.toml` 中列出的所有依賴套件。

## 使用說明

### 啟動後端伺服器

執行 FastAPI 開發伺服器：
```bash
uv run uvicorn backend.main:app --reload
```
API 服務將在 `http://localhost:8000` 運行。
API 文件 (Swagger UI) 可於 `http://localhost:8000/docs` 查看。

### 啟動前端伺服器

```bash
cd frontend
npm run dev
```

### 執行腳本

若要執行工具腳本：

```bash
# 建立資料庫資料表 (請先設定好 .env)
uv run scripts/create_tables.py

# 同步 Google Sheets
uv run scripts/sync_sheets.py
```

## 專案結構

```
OrderFlow/
├── frontend/           # Lovable React 前端專案
├── backend/            # FastAPI 後端
│   ├── auth/           # 認證模組
│   ├── admin/          # 後台管理模組
│   ├── crm/            # CRM 實作
│   ├── database.py     # 資料庫連線
│   └── main.py         # 應用程式進入點
├── scripts/            # 工具腳本
├── docs/               # 文件
└── pyproject.toml      # 專案設定與依賴
```

## 設定

將 `.env.example` 複製為 `.env` 並更新數值：
```bash
cp .env.example .env
```
請確保您已設定通用的 `DATABASE_URL` 與 Supabase 憑證。
