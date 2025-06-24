# backend/core/admin.py
from django.contrib import admin
from .models import MenuItem
from django.utils import timezone # Import timezone for auto-setting timestamps

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'parent_menu', 'url', 'order', 'is_dropdown', 'is_active',
        'is_visible', 'is_trending', 'is_promoted', 'is_featured', 'access_level',
        'is_published', 'published_at', 'created_at', 'updated_at',
        'is_deleted', 'is_archived',
    )
    list_filter = (
        'is_active', 'is_visible', 'is_dropdown', 'is_trending', 'is_promoted',
        'is_featured', 'is_hidden', 'is_draft', 'is_published', 'is_scheduled',
        'is_external', 'is_accessible', 'is_searchable', 'is_cacheable',
        'is_archived', 'is_deleted', 'access_level', 'parent_menu',
    )
    search_fields = ('title', 'url', 'seo_title', 'seo_description', 'tool_domain', 'geo_location')
    ordering = ('parent_menu__order', 'parent_menu__title', 'order', 'title') # Order by parent, then order, then title
    
    # Group fields into logical sections for better readability in the admin change form
    fieldsets = (
        (None, { # Basic Menu Information
            'fields': ('title', 'parent_menu', 'url', 'order', 'icon', 'tool_domain')
        }),
        ('Display & Behavior', {
            'fields': (
                'is_active', 'is_visible', 'is_dropdown', 'is_external', 'target',
                'custom_css', 'custom_js'
            ),
            'description': "Control how the menu item appears and behaves in the UI."
        }),
        ('Content & Promotion', {
            'fields': (
                'is_trending', 'is_promoted', 'is_featured', 'is_hidden',
                'is_featured_image', 'featured_image_url', 'is_video', 'video_url',
            ),
            'description': "Flags for marketing, visibility, and rich content."
        }),
        ('SEO & Discoverability', {
            'fields': ('seo_title', 'seo_description', 'is_searchable', 'is_cacheable'),
            'description': "Optimize for search engines and performance."
        }),
        ('Geographical & Analytics', {
            'fields': ('geo_location', 'analytics_data'),
            'description': "Target specific regions or store custom analytics."
        }),
        ('Access Control', {
            'fields': ('access_level', 'is_accessible'),
            'description': "Define user access permissions for this menu item."
        }),
        ('Publishing & Workflow', {
            'fields': (
                'is_draft', 'draft_version', 'is_published', 'published_at', 'published_by',
                'is_scheduled', 'scheduled_at', 'scheduled_by',
            ),
            'description': "Manage content workflow states (draft, published, scheduled)."
        }),
        ('Audit & Soft Delete', {
            'fields': (
                'created_at', 'created_by', 'updated_at', 'updated_by',
                'is_archived', 'archived_at', 'archived_by',
                'is_deleted', 'deleted_at', 'deleted_by',
            ),
            'classes': ('collapse',), # Make this section collapsible for cleaner UI
            'description': "Audit trail and soft deletion management for data integrity."
        }),
    )

    # These fields are automatically managed by Django or save_model, and typically not edited manually
   # readonly_fields = (
  #      'created_at', 'updated_at', 'published_at', 'archived_at', 'deleted_at',
        # Do NOT include created_by, updated_by, published_by, archived_by, deleted_by, scheduled_by
        # in readonly_fields if you want them to be auto-populated by save_model.
        # Django admin will handle their display automatically when populated.
  #  )

    # Override save_model to automatically set created_by, updated_by, and handle timestamp logic
    def save_model(self, request, obj, form, change):
        # Set created_by only when the object is first created
        if not obj.pk:
            obj.created_by = request.user
        
        # Always set updated_by when the object is saved
        obj.updated_by = request.user
        
        # Handle specific timestamp logic based on boolean flags for publishing, archiving, and deleting
        if obj.is_published and not obj.published_at:
            obj.published_at = timezone.now()
        elif not obj.is_published and obj.published_at: # If 'is_published' is unchecked, clear timestamp
            obj.published_at = None
            
        if obj.is_archived and not obj.archived_at:
            obj.archived_at = timezone.now()
        elif not obj.is_archived and obj.archived_at: # If 'is_archived' is unchecked, clear timestamp
            obj.archived_at = None

        if obj.is_deleted and not obj.deleted_at:
            obj.deleted_at = timezone.now()
        elif not obj.is_deleted and obj.deleted_at: # If 'is_deleted' is unchecked, clear timestamp
            obj.deleted_at = None

        # Call the superclass's save_model method to actually save the object
        super().save_model(request, obj, form, change)

