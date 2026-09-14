from rest_framework import serializers


class BookSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    title = serializers.CharField(max_length=255)
    author = serializers.CharField(max_length=255)
    # Se admiten guiones/espacios (ej. 978-84-376-0494-7); el dominio valida y normaliza
    isbn = serializers.CharField(max_length=20)
    cost_usd = serializers.DecimalField(max_digits=10, decimal_places=2)
    # Precio de venta en bolívares (VES). Solo lo modifica el endpoint calculate-price
    selling_price_local = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    stock_quantity = serializers.IntegerField(min_value=0)
    category = serializers.CharField(max_length=100)
    supplier_country = serializers.RegexField(
        regex=r"^[A-Za-z]{2}$",
        error_messages={"invalid": "Debe ser un código de país de 2 letras (ej. VE, ES)."},
    )
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)


class CategorySearchQuerySerializer(serializers.Serializer):
    category = serializers.CharField(max_length=100)


class LowStockQuerySerializer(serializers.Serializer):
    threshold = serializers.IntegerField(min_value=0, default=10)


class PriceCalculationResponseSerializer(serializers.Serializer):
    book_id = serializers.IntegerField()
    cost_usd = serializers.DecimalField(max_digits=10, decimal_places=2)
    exchange_rate = serializers.DecimalField(max_digits=18, decimal_places=6)  
    cost_local = serializers.DecimalField(max_digits=18, decimal_places=2) 
    margin_percentage = serializers.IntegerField()
    selling_price_local = serializers.DecimalField(max_digits=18, decimal_places=2)  
    currency = serializers.CharField(max_length=3)  
    rate_source = serializers.CharField()
    calculation_timestamp = serializers.DateTimeField(format="%Y-%m-%dT%H:%M:%SZ")
