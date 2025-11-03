"""
API URL routes for stockyards, orders, and automation endpoints.
"""

from django.urls import path

from . import views

urlpatterns = [
    # Stockyard CRUD
    path('stockyards/', views.StockyardListCreate.as_view()),
    path('stockyards/<str:pk>/', views.StockyardDetail.as_view()),

    # Order CRUD
    path('orders/', views.OrderListCreate.as_view()),
    path('orders/<str:pk>/', views.OrderDetail.as_view()),

    # Automation engine
    path('automate/', views.AutomateView.as_view()),
    path('automate/preview/', views.AutomatePreview.as_view()),
]
