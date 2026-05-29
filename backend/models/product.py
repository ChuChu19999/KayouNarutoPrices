from decimal import Decimal
from typing import TYPE_CHECKING, Optional
from sqlalchemy import BigInteger, CheckConstraint, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.config import get_database_schema
from core.database import Base

if TYPE_CHECKING:
    from models.product_image import ProductImage


class Product(Base):
    """Модель продукта Kayou Naruto (соответствует sql/001_create_products.sql)."""

    __tablename__ = "products"
    __table_args__ = (
        CheckConstraint("price >= 0", name="products_price_nonneg"),
        CheckConstraint(
            "product_url ~* '^https://'", name="products_product_url_https"
        ),
        {"schema": get_database_schema()},
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, index=True)
    product_url: Mapped[str] = mapped_column(Text, nullable=False)

    image: Mapped[Optional["ProductImage"]] = relationship(
        back_populates="product",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="selectin",
    )
