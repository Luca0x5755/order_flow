import sys
import os
import datetime
import logging
from decimal import Decimal
from typing import List, Dict, Any
import time
from dotenv import load_dotenv
load_dotenv()

# Add the project root to the python path to allow imports from backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import gspread
from google.oauth2.service_account import Credentials
from sqlalchemy import func, and_
from sqlalchemy.orm import Session

from backend.database import SessionLocal
from backend.models import Order, OrderItem, User, Product

# Configuration
GOOGLE_CREDENTIALS_PATH = os.path.join("config", "google-credentials.json")
SPREADSHEET_ID = os.getenv("SPREADSHEET_ID")
if not SPREADSHEET_ID:
    logger.error("SPREADSHEET_ID not found in environment variables.")
    sys.exit(1)
SHEET_NAME_SUMMARY = "本週訂單摘要"
SHEET_NAME_STATS = "統計資訊"
MAX_RETRIES = 3

# Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def get_weekly_orders(db: Session) -> List[Order]:
    """Fetch orders for the current week (Monday to Sunday)."""
    today = datetime.date.today()
    start_of_week = today - datetime.timedelta(days=today.weekday())  # Monday
    end_of_week = start_of_week + datetime.timedelta(days=6)  # Sunday
    
    # Set time to 00:00:00 for start and 23:59:59 for end
    start_dt = datetime.datetime.combine(start_of_week, datetime.time.min)
    end_dt = datetime.datetime.combine(end_of_week, datetime.time.max)

    logger.info(f"Fetching orders from {start_dt} to {end_dt}")

    orders = db.query(Order).filter(
        and_(Order.order_date >= start_dt, Order.order_date <= end_dt)
    ).all()
    
    return orders

def connect_to_gsheet() -> gspread.Client:
    """Connect to Google Sheets API with retry logic."""
    scope = [
        "https://spreadsheets.google.com/feeds",
        "https://www.googleapis.com/auth/drive",
    ]
    
    for attempt in range(MAX_RETRIES):
        try:
            if not os.path.exists(GOOGLE_CREDENTIALS_PATH):
                raise FileNotFoundError(f"Credentials file not found at: {GOOGLE_CREDENTIALS_PATH}")
                
            creds = Credentials.from_service_account_file(GOOGLE_CREDENTIALS_PATH, scopes=scope)
            client = gspread.authorize(creds)
            return client
        except Exception as e:
            logger.warning(f"Connection attempt {attempt + 1} failed: {e}")
            if attempt == MAX_RETRIES - 1:
                logger.error("All connection attempts failed.")
                raise
            time.sleep(2)  # Wait before retry

def format_order_data(orders: List[Order]) -> List[List[Any]]:
    """Format orders into a list of lists for Google Sheets."""
    rows = []
    for order in orders:
        product_names = [item.product.name for item in order.items if item.product]
        items_str = ", ".join(product_names)
        
        # Ensure order_date is a datetime object before formatting
        order_date_str = ""
        if order.order_date:
            order_date_str = order.order_date.strftime("%Y-%m-%d %H:%M:%S")

        # Handle customer name safely
        customer_name = "Unknown"
        if order.user:
            # Prefer company name, fallback to username
            customer_name = order.user.company_name if order.user.company_name else order.user.username

        rows.append([
            order.order_number,
            order_date_str,
            customer_name,
            items_str,
            float(order.total_amount) if order.total_amount else 0.0,
            order.status
        ])
    return rows

def update_summary_sheet(sh: gspread.Spreadsheet, data: List[List[Any]]):
    """Update the summary sheet with new data."""
    try:
        worksheet = sh.worksheet(SHEET_NAME_SUMMARY)
    except gspread.WorksheetNotFound:
        worksheet = sh.add_worksheet(title=SHEET_NAME_SUMMARY, rows=100, cols=10)
        # Add headers if new sheet
        worksheet.append_row(["訂單編號", "訂單日期", "客戶名稱", "商品清單", "訂單金額", "訂單狀態"])

    # Clear old data (keep headers)
    # Assuming headers are in row 1
    if worksheet.row_count > 1:
        # Clear from row 2 to end
        # gspread clear isn't row specific usually, so careful. 
        # Easier to clear all and rewrite headers or just delete rows.
        # Let's clear range A2:F<End>
        worksheet.batch_clear([f"A2:F{worksheet.row_count}"])

    if not data:
        worksheet.update("A2", [["本週無訂單"]])
    else:
        worksheet.update(f"A2", data)

def update_stats_sheet(sh: gspread.Spreadsheet, orders: List[Order]):
    """Update the statistics sheet."""
    try:
        worksheet = sh.worksheet(SHEET_NAME_STATS)
    except gspread.WorksheetNotFound:
        worksheet = sh.add_worksheet(title=SHEET_NAME_STATS, rows=50, cols=5)

    total_orders = len(orders)
    total_amount = sum(float(o.total_amount) if o.total_amount else 0.0 for o in orders)
    
    # Count statuses
    status_counts = {}
    for order in orders:
        s = order.status or "Unknown"
        status_counts[s] = status_counts.get(s, 0) + 1

    # Prepare data
    stats_data = [
        ["統計項目", "數值"],
        ["總訂單數", total_orders],
        ["總金額", total_amount],
        [], # Empty row
        ["狀態", "數量"]
    ]
    
    for status, count in status_counts.items():
        stats_data.append([status, count])

    # Clear and update
    worksheet.clear()
    worksheet.update("A1", stats_data)

def main():
    logger.info("Starting weekly order export...")
    
    db = SessionLocal()
    try:
        # 1. Fetch Orders
        orders = get_weekly_orders(db)
        logger.info(f"Found {len(orders)} orders for the week.")

        # 2. Connect to Google Sheets
        try:
            client = connect_to_gsheet()
            sh = client.open_by_key(SPREADSHEET_ID)
        except Exception as e:
            logger.error(f"Failed to access Google Sheet: {e}")
            return

        # 3. Format Data
        formatted_data = format_order_data(orders)

        # 4. Update Sheets
        update_summary_sheet(sh, formatted_data)
        update_stats_sheet(sh, orders)
        
        logger.info("Export completed successfully.")

    except Exception as e:
        logger.error(f"Unexpected error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
