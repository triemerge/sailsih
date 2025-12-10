"""
Database models for the SAILSIH rake automation system.
- Stockyard: Material inventory at a rail stockyard location.
- Order: Customer dispatch order (rail / road).
"""

import uuid

from django.db import models


class Stockyard(models.Model):
    """Represents a stockyard holding a specific material."""

    id = models.CharField(max_length=50, primary_key=True)
    material = models.CharField(max_length=100)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    location = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'stockyards'
        ordering = ['id']
        indexes = [
            models.Index(fields=['material'], name='idx_stockyard_material'),
        ]

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"SY-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.id} - {self.material} ({self.quantity} MT)"


class Order(models.Model):
    """Represents a customer order for material dispatch."""

    PRIORITY_CHOICES = [
        (1, 'P1'),
        (2, 'P2'),
        (3, 'P3'),
    ]
    MODE_CHOICES = [
        ('rail', 'Rail'),
        ('road', 'Road'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('automated', 'Automated'),
        ('completed', 'Completed'),
    ]

    id = models.CharField(max_length=50, primary_key=True)
    customer = models.CharField(max_length=200)
    product = models.CharField(max_length=100)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=2)
    deadline = models.DateField(blank=True, null=True)
    mode = models.CharField(max_length=10, choices=MODE_CHOICES, default='rail')
    dest_code = models.CharField(max_length=20, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'orders'
        ordering = ['priority', 'deadline']
        indexes = [
            models.Index(fields=['priority', 'deadline'], name='idx_order_priority_deadline'),
            models.Index(fields=['mode', 'dest_code'], name='idx_order_mode_dest'),
            models.Index(fields=['status'], name='idx_order_status'),
        ]

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.id} - {self.customer} ({self.quantity} MT {self.product})"
