from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
import json
from app.core.logging import logger

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info("websocket_client_connected", active_connections=len(self.active_connections))

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info("websocket_client_disconnected", active_connections=len(self.active_connections))

    async def broadcast(self, message: dict):
        if not self.active_connections:
            return
            
        json_msg = json.dumps(message)
        logger.debug("websocket_broadcast", message=message, recipients=len(self.active_connections))
        
        for connection in self.active_connections.copy():
            try:
                await connection.send_text(json_msg)
            except Exception as e:
                logger.error("websocket_broadcast_error", error=str(e))
                self.disconnect(connection)

manager = ConnectionManager()

@router.websocket("/ws/alerts")
async def websocket_alerts_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We don't expect the client to send much, but we need to keep the connection alive
            data = await websocket.receive_text()
            logger.debug("websocket_message_received", data=data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
