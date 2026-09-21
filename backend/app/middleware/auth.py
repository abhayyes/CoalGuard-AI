import logging
from collections.abc import Callable
from typing import Any
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.mine_assignment import MineAssignment
from app.models.user import User, UserRole

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)


def verify_supabase_token(token: str) -> dict[str, Any]:
    """Verify Supabase JWT token and return payload."""
    try:
        # If jwt secret is provided, verify signature
        if settings.supabase_jwt_secret:
            payload = jwt.decode(
                token,
                settings.supabase_jwt_secret,
                algorithms=["HS256"],
                audience="authenticated",
                options={"verify_aud": False},
            )
            return payload
        else:
            # Decode unverified if in development and no secret set
            payload = jwt.get_unverified_claims(token)
            return payload
    except JWTError as e:
        logger.error(f"JWT verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """FastAPI dependency: Authenticate user from Supabase JWT and load user from DB."""
    if not credentials:
        # If in development mode and no token, try to find an admin or create test user
        if settings.is_development:
            stmt = select(User).where(User.is_active == True)  # noqa: E712
            result = await db.execute(stmt)
            user = result.scalars().first()
            if user:
                request.state.user = user
                return user

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = verify_supabase_token(token)

    supabase_uid = payload.get("sub")
    email = payload.get("email")

    if not supabase_uid and not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token claims",
        )

    # Find user by supabase_uid or email
    stmt = select(User).where(
        (User.supabase_uid == supabase_uid) | (User.email == email)
    )
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user:
        # If user exists in Supabase Auth but not in our DB yet, auto-provision in development
        if settings.is_development and email:
            user = User(
                supabase_uid=supabase_uid or str(UUID(int=0)),
                email=email,
                full_name=payload.get("user_metadata", {}).get("full_name", email.split("@")[0]),
                role=UserRole.admin,
                is_active=True,
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found in system",
            )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    request.state.user = user
    return user


def require_role(*allowed_roles: UserRole | str) -> Callable:
    """Dependency factory that checks if current user has one of the allowed roles."""
    roles = [r.value if isinstance(r, UserRole) else str(r) for r in allowed_roles]

    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role = current_user.role.value if isinstance(current_user.role, UserRole) else str(current_user.role)
        if user_role not in roles and user_role != UserRole.admin.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of roles {roles}",
            )
        return current_user

    return role_checker


async def get_user_mine_ids(db: AsyncSession, user_id: str | UUID) -> list[str]:
    """Retrieve list of mine IDs assigned to a user."""
    user_id_str = str(user_id)
    stmt = select(MineAssignment.mine_id).where(MineAssignment.user_id == user_id_str)
    result = await db.execute(stmt)
    return [str(mid) for mid in result.scalars().all()]


def check_mine_access(user: User, mine_id: str | UUID, user_mine_ids: list[str]) -> bool:
    """Check if a user has access to a specific mine."""
    role_str = user.role.value if isinstance(user.role, UserRole) else str(user.role)
    if role_str in [UserRole.admin.value, UserRole.corporate.value, UserRole.regulatory.value]:
        return True
    return str(mine_id) in [str(m) for m in user_mine_ids]
