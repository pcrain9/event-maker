import bcrypt
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.user import User
from backend.schema.user import AdminUserCreate, AdminUserUpdate


class AdminUserValidationError(Exception):
    pass


def _normalize_username(raw_username: str) -> str:
    username = raw_username.strip()
    if not username:
        raise AdminUserValidationError("Username cannot be empty")
    return username


async def _find_user_by_username_ci(db: AsyncSession, username: str) -> User | None:
    normalized = _normalize_username(username)
    query = select(User).where(func.lower(User.username) == normalized.lower())
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def _find_admin_by_id(db: AsyncSession, user_id: int) -> User | None:
    query = select(User).where(User.id == user_id, User.role == "admin")
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def list_admin_users(db: AsyncSession) -> list[User]:
    query = select(User).where(User.role == "admin").order_by(User.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


async def create_admin_user(db: AsyncSession, payload: AdminUserCreate) -> User:
    username = _normalize_username(payload.username)

    existing = await _find_user_by_username_ci(db, username)
    if existing:
        raise AdminUserValidationError("Username already exists")

    hashed_password = bcrypt.hashpw(
        payload.password.encode("utf-8"),
        bcrypt.gensalt(),
    ).decode("utf-8")

    user = User(
        username=username,
        hashed_password=hashed_password,
        full_name=payload.full_name,
        is_active=payload.is_active,
        role="admin",
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def update_admin_user(db: AsyncSession, user_id: int, payload: AdminUserUpdate) -> User | None:
    user = await _find_admin_by_id(db, user_id)
    if not user:
        return None

    if payload.username is not None:
        updated_username = _normalize_username(payload.username)
        existing = await _find_user_by_username_ci(db, updated_username)
        if existing and existing.id != user.id:
            raise AdminUserValidationError("Username already exists")
        user.username = updated_username

    if payload.full_name is not None:
        user.full_name = payload.full_name

    if payload.is_active is not None:
        user.is_active = payload.is_active

    if payload.new_password is not None:
        if not payload.current_password:
            raise AdminUserValidationError(
                "Current password is required to set a new password"
            )

        is_valid_current_password = bcrypt.checkpw(
            payload.current_password.encode("utf-8"),
            user.hashed_password.encode("utf-8"),
        )
        if not is_valid_current_password:
            raise AdminUserValidationError("Current password is incorrect")

        user.hashed_password = bcrypt.hashpw(
            payload.new_password.encode("utf-8"),
            bcrypt.gensalt(),
        ).decode("utf-8")

    await db.commit()
    await db.refresh(user)
    return user


async def delete_admin_user(db: AsyncSession, user_id: int, acting_admin_id: int) -> bool:
    user = await _find_admin_by_id(db, user_id)
    if not user:
        return False

    if user.id == acting_admin_id:
        raise AdminUserValidationError("You cannot delete your own admin account")

    if user.is_active:
        query = select(func.count()).select_from(User).where(
            User.role == "admin",
            User.is_active,
        )
        result = await db.execute(query)
        active_admin_count = result.scalar_one()
        if active_admin_count <= 1:
            raise AdminUserValidationError("Cannot delete the last active admin")

    await db.delete(user)
    await db.commit()
    return True
