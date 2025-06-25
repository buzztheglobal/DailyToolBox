# backend/core/serializers.py
from rest_framework import serializers
from .models import MenuItem

class DropdownMenuItemSerializer(serializers.ModelSerializer):
    """
    Serializer for nested dropdown menu items.
    Exposes only relevant fields for a sub-item in a dropdown.
    """
    class Meta:
        model = MenuItem
        fields = ['id', 'title', 'url', 'icon', 'is_external', 'target', 'is_active', 'is_visible']


class MenuItemSerializer(serializers.ModelSerializer):
    """
    Comprehensive serializer for main menu items, including nested dropdowns.
    Also includes read-only fields for related user names from audit fields.
    """
    # Use the nested serializer for dropdown_items (which corresponds to related_name in the model)
    dropdown_items = DropdownMenuItemSerializer(many=True, read_only=True)
    
    # Read-only fields to display username instead of user ID for audit/relationship fields
    created_by_name = serializers.CharField(source='created_by.username', read_only=True, allow_null=True)
    updated_by_name = serializers.CharField(source='updated_by.username', read_only=True, allow_null=True)
    published_by_name = serializers.CharField(source='published_by.username', read_only=True, allow_null=True)
    archived_by_name = serializers.CharField(source='archived_by.username', read_only=True, allow_null=True)
    deleted_by_name = serializers.CharField(source='deleted_by.username', read_only=True, allow_null=True)
    scheduled_by_name = serializers.CharField(source='scheduled_by.username', read_only=True, allow_null=True)


    class Meta:
        model = MenuItem
        fields = [
            'id', 'parent_menu', 'title', 'url', 'order', 'icon',
            'is_active', 'is_visible', 'is_external', 'target', 'is_dropdown',
            'tool_domain', 'is_trending', 'is_promoted', 'is_featured', 'is_hidden',
            'is_draft', 'draft_version', 'is_published', 'published_at', 'published_by_name',
            'is_scheduled', 'scheduled_at', 'scheduled_by_name',
            'is_featured_image', 'featured_image_url', 'is_video', 'video_url',
            'seo_title', 'seo_description', 'is_searchable', 'is_cacheable',
            'geo_location', 'analytics_data', 'custom_css', 'custom_js',
            'access_level', 'is_accessible',
            'created_at', 'created_by_name', 'updated_at', 'updated_by_name',
            'is_archived', 'archived_at', 'archived_by_name',
            'is_deleted', 'deleted_at', 'deleted_by_name',
            'dropdown_items', # This will include the nested items from DropdownMenuItemSerializer
        ]

