# backend/core/urls.py
from django.urls import path
from .views import MenuItemsListView, ProtectedView


urlpatterns = [
    path('menu-items/', MenuItemsListView.as_view(), name='menu_items_list'),
    path('protected/', ProtectedView.as_view(), name='protected_view'),
    # You can add more URL patterns for other API endpoints in your 'core' app here.
]
