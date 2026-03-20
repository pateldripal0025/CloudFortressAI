import asyncio, traceback
from app.repositories.risk_repository import risk_repo
from app.database.mongodb import connect_to_mongo
async def test():
    try:
        await connect_to_mongo()
        rs = await risk_repo.get_by_user('test@user.com')
        print(rs)
    except Exception as e:
        print(traceback.format_exc())
asyncio.run(test())
