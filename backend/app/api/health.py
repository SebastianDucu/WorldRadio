from fastapi import APIRouter

router = APIRouter(tags=["salud"])


@router.get("/health")
async def health() -> dict[str, str]:
    """El frontend lo llama al abrir para «despertar» el servidor gratuito."""
    return {"status": "ok"}
