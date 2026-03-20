from motor.motor_asyncio import AsyncIOMotorCollection
from app.database.mongodb import db
from app.models.risk_model import Risk
from typing import Dict, List

class RiskRepository:
    async def get_collection(self) -> AsyncIOMotorCollection:
        return db.db["risks"]

    async def create(self, risk: Risk) -> Risk:
        col = await self.get_collection()
        risk_dict = risk.model_dump(exclude={"id"})
        result = await col.insert_one(risk_dict)
        risk.id = str(result.inserted_id)
        return risk

    async def get_by_scan(self, scan_id: str) -> List[Risk]:
        col = await self.get_collection()
        cursor = col.find({"scan_id": scan_id})
        risks = []
        async for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            # Ensure compatibility with both old and new data if needed, 
            # but here we focus on alignment with the new model.
            risks.append(Risk(**doc))
        return risks

    async def get_summary(self, user_id: str) -> Dict[str, int]:
        col = await self.get_collection()
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {
                "_id": "$severity",
                "count": {"$sum": 1}
            }}
        ]
        cursor = col.aggregate(pipeline)
        
        counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
        async for doc in cursor:
            severity = doc["_id"].lower()
            if severity in counts:
                counts[severity] = doc["count"]
        
        return counts

    async def update(self, risk_id: str, update_data: Dict) -> bool:
        from bson import ObjectId
        col = await self.get_collection()
        result = await col.update_one(
            {"_id": ObjectId(risk_id)},
            {"$set": update_data}
        )
        return result.modified_count > 0

    async def get_by_user(self, user_id: str) -> List[dict]:
        col = await self.get_collection()
        cursor = col.find({"user_id": user_id})
        risks = []
        async for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            risks.append(doc)
        return risks

risk_repo = RiskRepository()
