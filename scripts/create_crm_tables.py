"""
建立 CRM 資料表
執行此腳本以建立 customers 和 interactions 表
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database import engine, Base
from backend.models import Customer, Interaction

def create_crm_tables():
    """建立 CRM 相關資料表"""
    print("開始建立 CRM 資料表...")
    
    # 只建立 Customer 和 Interaction 表
    # 這會檢查是否已存在，如果不存在才建立
    Customer.__table__.create(bind=engine, checkfirst=True)
    Interaction.__table__.create(bind=engine, checkfirst=True)
    
    print("✓ customers 表建立完成")
    print("✓ interactions 表建立完成")
    print("\nCRM 資料表建立成功！")

if __name__ == "__main__":
    create_crm_tables()
