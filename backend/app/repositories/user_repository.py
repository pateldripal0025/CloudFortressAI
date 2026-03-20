from typing import Optional
from motor.motor_asyncio import AsyncIOMotorCollection
from app.models.user_model import User
from app.database.mongodb import db

class UserRepository:
    async def get_collection(self) -> AsyncIOMotorCollection:
        return db.db["users"]

    async def get_by_email(self, email: str) -> Optional[User]:
        col = await self.get_collection()
        user_data = await col.find_one({"email": email})
        if user_data:
            user_data["id"] = str(user_data.pop("_id"))
            return User(**user_data)
        return None

    async def create(self, user: User) -> User:
        col = await self.get_collection()
        user_dict = user.model_dump(exclude={"id"})
        result = await col.insert_one(user_dict)
        user.id = str(result.inserted_id)
        return user

user_repo = UserRepository()
