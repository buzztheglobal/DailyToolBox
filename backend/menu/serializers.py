from rest_framework import serializers
from .models import MenuItem, AccessLevelChoices, TargetChoices # Import new choices

class MenuItemSerializer(serializers.ModelSerializer):
    # If you want to include nested children in the API response:
    children_menus = serializers.SerializerMethodField() # Renamed to match model's related_name

    class Meta:
        model = MenuItem
        # List all fields you want to expose via the API
        fields = [
            'id', 'title', 'parent_menu', 'url', 'order', 'icon', 'tool_domain',
            'is_active', 'is_visible', 'is_dropdown', 'is_external', 'target',
            'custom_css', 'custom_js',
            'is_trending', 'is_promoted', 'is_featured', 'is_hidden',
            'is_featured_image', 'featured_image_url', 'is_video', 'video_url',
            'seo_title', 'seo_description', 'is_searchable', 'is_cacheable',
            'geo_location', 'analytics_data',
            'access_level', 'is_accessible',
            'is_draft', 'draft_version', 'is_published', 'published_at',
            'is_scheduled', 'scheduled_at',
            'created_at', 'updated_at',
            'is_archived', 'archived_at',
            'is_deleted', 'deleted_at',
            # Note: Fields like created_by, updated_by (FK to User) usually aren't sent as raw IDs
            # If you need user details, you'd serialize them (e.g., created_by_username = serializers.CharField(source='created_by.username'))
            # For simplicity, we are not exposing FK user fields directly for now.
            'children_menus', # Ensure the method field is also in fields
        ]
        # read_only_fields = ['id', 'created_at', 'updated_at', 'published_at', 'scheduled_at', 'archived_at', 'deleted_at']
        # You might also make all the 'by' fields read-only if they're set by the system

    def get_children_menus(self, obj):
        # Recursively serialize children if they exist
        # Filter for active children and order them
        if obj.children_menus.exists(): # Use children_menus here
            return MenuItemSerializer(obj.children_menus.filter(is_active=True).order_by('order', 'title'), many=True).data
        return []