import logging
from decimal import Decimal, InvalidOperation
from typing import Optional
import requests
from django.conf import settings
from books.domain.exceptions import ExchangeRateUnavailableError
from books.domain.services import ExchangeRate, ExchangeRateService

logger = logging.getLogger(__name__)

class ExternalExchangeRateAdapter(ExchangeRateService):
    """
    Obtiene la tasa USD 
    Si la API falla, usa DEFAULT_EXCHANGE_RATE de settings como tasa por defecto.
    """

    def __init__(self, api_url: Optional[str] = None, timeout: float = 5) -> None:
        self._api_url = api_url or settings.EXCHANGE_RATE_API_URL
        self._timeout = timeout

    def get_exchange_rate(self, target_currency: Optional[str] = None) -> ExchangeRate:
        target_currency = (target_currency or settings.LOCAL_CURRENCY).upper()

        live_rate = self._fetch_live_rate(target_currency)

        if live_rate is not None:
            return ExchangeRate(rate=live_rate, currency=target_currency, source="live")

        fallback_rate = self._get_fallback_rate(target_currency)

        if fallback_rate is None:
            raise ExchangeRateUnavailableError(
                f"No hay tasa de cambio disponible para {target_currency}: "
                "el servicio externo falló y no existe tasa por defecto."
            )
        return ExchangeRate(rate=fallback_rate, currency=target_currency, source="fallback")

    def _fetch_live_rate(self, target_currency: str) -> Optional[Decimal]:
        """Consulta la API externa. Devuelve None ante cualquier fallo"""

        try:
            response = requests.get(self._api_url, timeout=self._timeout)
            response.raise_for_status()
            rate = Decimal(str(response.json()["rates"][target_currency]))
        except requests.RequestException as exc:
            # Timeout, error de red o status != 2xx
            logger.warning("Fallo al consultar la API de cambio: %s", exc)
            return None
        except (ValueError, KeyError, TypeError, InvalidOperation) as exc:
            # JSON inválido, moneda inexistente o tasa no numérica
            logger.warning("Respuesta inválida de la API de cambio para %s: %s", target_currency, exc)
            return None

        if rate <= 0:
            logger.warning("La API devolvió una tasa no válida para %s: %s", target_currency, rate)
            return None

        return rate

    def _get_fallback_rate(self, target_currency: str) -> Optional[Decimal]:
        """Tasa por defecto configurada para la moneda local (VES)"""

        if target_currency != settings.LOCAL_CURRENCY.upper():
            return None

        try:
            rate = Decimal(str(settings.DEFAULT_EXCHANGE_RATE))
        except (InvalidOperation, ValueError):
            logger.error("DEFAULT_EXCHANGE_RATE no es un número válido: %s", settings.DEFAULT_EXCHANGE_RATE)
            return None

        return rate if rate > 0 else None
