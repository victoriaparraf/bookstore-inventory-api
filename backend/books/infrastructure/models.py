from django.db import models

class BookORM(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    isbn = models.CharField(max_length=13, unique=True)
    cost_usd = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price_local = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock_quantity = models.PositiveIntegerField()
    category = models.CharField(max_length=100)
    supplier_country = models.CharField(max_length=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = "books"
        db_table = "books"
        constraints = [
            models.CheckConstraint(condition=models.Q(cost_usd__gt=0), name="book_cost_usd_gt_0"),
        ]