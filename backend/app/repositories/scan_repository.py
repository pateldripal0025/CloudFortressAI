from motor.motor_asyncio import AsyncIOMotorCollection
from app.models.scan_model import Scan
from app.database.mongodb import db
from typing import List, Optional
from bson import ObjectId

class ScanRepository:
    async def get_collection(self) -> AsyncIOMotorCollection:
        return db.db["scans"]

    async def create(self, scan: Scan) -> Scan:
        col = await self.get_collection()
        scan_dict = scan.model_dump(exclude={"id"})
        result = await col.insert_one(scan_dict)
        scan.id = str(result.inserted_id)
        return scan

    async def update(self, scan_id: str, update_data: dict) -> bool:
        col = await self.get_collection()
        result = await col.update_one(
            {"_id": ObjectId(scan_id)},
            {"$set": update_data}
        )
        return result.modified_count > 0

    async def get_by_user(self, user_id: str) -> List[Scan]:
        col = await self.get_collection()
        cursor = col.find({"user_id": user_id}).sort("started_at", -1)
        scans = []
        async for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            scans.append(Scan(**doc))
        return scans

scan_repo = ScanRepository()
