"""Admin registration for Stockyard and Order models."""

from django.contrib import admin

from .models import Order, Stockyard

admin.site.register(Stockyard)
admin.site.register(Order)
