from django.contrib import admin
from .models import MenuItem, AccessLevelChoices, TargetChoices # Import new choices

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
    raw_id_fields = ('parent_menu', 'published_by', 'scheduled_by', 'created_by', 'updated_by', 'archived_by', 'deleted_by') # Added all ForeignKey fields

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

    # Read-only fields for audit trail in admin
    readonly_fields = (
        'created_at', 'created_by', 'updated_at', 'updated_by',
        'archived_at', 'archived_by', 'deleted_at', 'deleted_by',
        'published_at', 'published_by', 'scheduled_at', 'scheduled_by',
    )

    # Override save_model to automatically set 'created_by' and 'updated_by'
    # This requires 'request' object, which is available in save_model
    def save_model(self, request, obj, form, change):
        if not obj.pk:  # Only set created_by for new objects
            obj.created_by = request.user
        obj.updated_by = request.user # Always set updated_by on save
        super().save_model(request, obj, form, change)


admin.site.register(MenuItem, MenuItemAdmin)