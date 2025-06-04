from fastapi import FastAPI, APIRouter, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import List
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import StatusCheck as DBStatusCheck, get_session, init_db

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Pydantic Models for API
class StatusCheckBase(BaseModel):
    client_name: str

class StatusCheckCreate(StatusCheckBase):
    pass

class StatusCheckResponse(StatusCheckBase):
    id: str
    timestamp: datetime

    class Config:
        from_attributes = True

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheckResponse)
async def create_status_check(
    input: StatusCheckCreate,
    session: AsyncSession = Depends(get_session)
):
    db_status = DBStatusCheck(client_name=input.client_name)
    session.add(db_status)
    await session.commit()
    return db_status

@api_router.get("/status", response_model=List[StatusCheckResponse])
async def get_status_checks(
    session: AsyncSession = Depends(get_session)
):
    result = await session.execute(select(DBStatusCheck))
    status_checks = result.scalars().all()
    return list(status_checks)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await init_db()
