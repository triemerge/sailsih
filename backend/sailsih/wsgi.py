"""
WSGI config for SAILSIH project.
Exposes the WSGI callable as a module-level variable named ``application``.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sailsih.settings')

application = get_wsgi_application()
