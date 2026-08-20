from sqlalchemy.orm import DeclarativeBase

from db.database import AsyncSessionLocal


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
