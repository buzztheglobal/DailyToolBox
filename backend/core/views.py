# backend/core/views.py
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import MenuItem
from .serializers import MenuItemSerializer


class MenuItemsListView(APIView):
    """
    API View to fetch all active, visible, and published top-level menu items,
    including their nested dropdown items, structured for the frontend navbar.
    """
    def get(self, request, format=None):
        # Filter for top-level menu items (those without a parent_menu) that are:
        # - active
        # - visible
        # - published
        # - NOT hidden, archived, or deleted
        top_level_items = MenuItem.objects.filter(
            parent_menu__isnull=True,
            is_active=True,
            is_visible=True,
            is_published=True,
            is_hidden=False,
            is_archived=False,
            is_deleted=False
        ).order_by('order') # Order them by the 'order' field

        navbar_menu_data = []

        for item in top_level_items:
            # Serialize the top-level item using the main serializer.
            # Due to the 'dropdown_items' field in MenuItemSerializer, this will automatically
            # include the nested sub-items if 'is_dropdown' is true for the current item.
            item_data = MenuItemSerializer(item).data

            # The frontend expects 'dropdown' key and 'items' for nested items.
            # Adjusting structure for frontend compatibility.
            if item_data.get('is_dropdown') and item_data.get('dropdown_items'):
                # If it's a dropdown and has items, rename 'dropdown_items' to 'items'
                item_data['items'] = item_data.pop('dropdown_items')
            else:
                # If it's not a dropdown or has no sub-items, remove the dropdown-related keys
                item_data.pop('dropdown_items', None) # Remove if present
                item_data.pop('is_dropdown', None)    # Remove if present

            navbar_menu_data.append(item_data)

        # Construct the final response structure as per your frontend's expected JSON
        response_data = {
            "navbar": {
                "brandName": "DailyToolbox",
                "menuItems": navbar_menu_data,
                "searchBar": True,
                "loginAvatar": True,
                "darkModeToggle": True
            }
        }
        return Response(response_data)


class ProtectedView(APIView):
    permission_classes = [IsAuthenticated] # Requires authentication

    def get(self, request):
        """
        Returns a protected message, demonstrating successful Firebase token authentication.
        """
        return Response({
            "message": f"Hello, {request.user.username}! This is a protected area. "
                       f"Your Firebase UID is {request.user.username}. "
                       f"You are authenticated via Django with Firebase token."
        })