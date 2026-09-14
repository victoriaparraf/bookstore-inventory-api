from abc import ABC, abstractmethod
from dataclasses import dataclass
from decimal import Decimal


@dataclass(frozen=True)
class ExchangeRate:
    rate: Decimal
    source: str  # "live" si viene de la API externa, "fallback" si es la tasa por defecto


class ExchangeRateService(ABC):

    @abstractmethod
    def get_exchange_rate(self, target_currency: str) -> ExchangeRate:
        """
        Obtiene la tasa de cambio actual USD 
        Debe retornar una tasa por defecto si el proveedor externo falla
        y lanzar error si tampoco existe tasa por defecto
        """
        pass
