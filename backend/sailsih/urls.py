"""
Root URL configuration for the SAILSIH project.
Routes: /admin, /api/health, /api/*
"""

from datetime import datetime

from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health_check(request):
    """Simple health check endpoint returning status and timestamp."""
    return JsonResponse({
        'status': 'ok',
        'ts': datetime.now().isoformat()
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check),
    path('api/', include('api.urls')),
]
