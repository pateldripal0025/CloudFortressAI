from motor.motor_asyncio import AsyncIOMotorCollection
from app.database.mongodb import db
from app.models.notification_model import Notification
from typing import List, Dict

class NotificationRepository:
    async def get_collection(self) -> AsyncIOMotorCollection:
        return db.db["notifications"]

    async def create(self, notification: Notification) -> Notification:
        col = await self.get_collection()
        notif_dict = notification.model_dump(exclude={"id"})
        result = await col.insert_one(notif_dict)
        notification.id = str(result.inserted_id)
        return notification

    async def get_all(self, limit: int = 20) -> List[dict]:
        col = await self.get_collection()
        cursor = col.find().sort("created_at", -1).limit(limit)
        notifications = []
        async for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            notifications.append(doc)
        return notifications

    async def get_unread_count(self) -> int:
        col = await self.get_collection()
        return await col.count_documents({"read": False})

    async def mark_as_read(self, notification_id: str) -> bool:
        from bson import ObjectId
        col = await self.get_collection()
        result = await col.update_one(
            {"_id": ObjectId(notification_id)},
            {"$set": {"read": True}}
        )
        return result.modified_count > 0

    async def clear_all(self) -> bool:
        col = await self.get_collection()
        result = await col.delete_many({})
        return result.deleted_count > 0

notification_repo = NotificationRepository()
