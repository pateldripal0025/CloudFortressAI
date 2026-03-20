# Helper functions for the backend foundation

def format_id(id_obj) -> str:
    """Format MongoDB ObjectId to string."""
    return str(id_obj) if id_obj else None
