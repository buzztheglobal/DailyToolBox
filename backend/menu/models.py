import uuid # For unique IDs if needed, though Django's default PK is often fine
from django.db import models
from django.conf import settings # To link to User model
from django.utils import timezone # For datetime fields

# Define choices for Access Level (Example)
class AccessLevelChoices(models.TextChoices):
    PUBLIC = 'public', 'Public'
    AUTHENTICATED = 'authenticated', 'Authenticated'
    PREMIUM = 'premium', 'Premium'
    ADMIN = 'admin', 'Admin'
    # Add more as needed

# Define choices for Target (for links)
class TargetChoices(models.TextChoices):
    SELF = '_self', 'Same Window/Tab'
    BLANK = '_blank', 'New Window/Tab'

class MenuItem(models.Model):
    # Basic Menu Information
    title = models.CharField(max_length=255,default="New Menu Item", help_text="Display title for the menu item.")
    # Renamed 'parent' to 'parent_menu' for clarity, as used in admin.ModelAdmin
    parent_menu = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='children_menus', # Changed related_name for clarity
        help_text="For nested menu items (optional). Select a parent menu item."
    )
    url = models.CharField(
        max_length=500, # Increased max_length as URLs can be long
        blank=True,
        null=True,
        help_text="URL the menu item links to (e.g., /about, /products/electronics/, or https://example.com)."
    )
    order = models.IntegerField(default=0, help_text="Numerical order for display within its level or parent group.")
    icon = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="CSS class for an icon (e.g., 'fa fa-home', 'bi-gear')."
    )
    tool_domain = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Domain or category this menu item belongs to (e.g., 'SEO Tools', 'Image Editors')."
    )

    # Display & Behavior
    is_active = models.BooleanField(
        default=True,
        help_text="Determines if the menu item is generally active and usable."
    )
    is_visible = models.BooleanField(
        default=True,
        help_text="Controls if the menu item is shown in public facing navigation (even if active)."
    )
    is_dropdown = models.BooleanField(
        default=False,
        help_text="Indicates if this menu item is a dropdown parent itself."
    )
    is_external = models.BooleanField(
        default=False,
        help_text="If True, the URL is an external link."
    )
    target = models.CharField(
        max_length=10,
        choices=TargetChoices.choices,
        default=TargetChoices.SELF,
        help_text="How the link should open ('_self' for same tab, '_blank' for new tab)."
    )
    custom_css = models.TextField(
        blank=True,
        help_text="Apply custom CSS rules to this menu item for unique styling."
    )
    custom_js = models.TextField(
        blank=True,
        help_text="Execute custom JavaScript when this menu item is interacted with."
    )

    # Content & Promotion
    is_trending = models.BooleanField(
        default=False,
        help_text="Mark as trending for special display (e.g., 'Hot' badge)."
    )
    is_promoted = models.BooleanField(
        default=False,
        help_text="Promote this item for higher visibility."
    )
    is_featured = models.BooleanField(
        default=False,
        help_text="Mark as a featured item (e.g., on a homepage)."
    )
    is_hidden = models.BooleanField(
        default=False,
        help_text="Hide from public view but keep active (e.g., for internal testing)."
    )
    is_featured_image = models.BooleanField(
        default=False,
        help_text="Indicates if a featured image should be displayed with this menu item."
    )
    featured_image_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="URL for a featured image (e.g., for promotional banners)."
    )
    is_video = models.BooleanField(
        default=False,
        help_text="Indicates if this menu item is associated with a video."
    )
    video_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="URL for a video (e.g., YouTube, Vimeo)."
    )

    # SEO & Discoverability
    seo_title = models.CharField(
        max_length=255,
        blank=True,
        help_text="SEO-friendly title for search engines (if different from display title)."
    )
    seo_description = models.TextField(
        blank=True,
        help_text="SEO-friendly meta description for search engines."
    )
    is_searchable = models.BooleanField(
        default=True,
        help_text="Allow search engines to index this menu item's content."
    )
    is_cacheable = models.BooleanField(
        default=True,
        help_text="Allow caching of content related to this menu item for performance."
    )

    # Geographical & Analytics
    geo_location = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Target specific geographical regions (e.g., 'US', 'Europe')."
    )
    analytics_data = models.JSONField( # Use JSONField for flexible data
        blank=True,
        null=True,
        help_text="Store custom analytics data related to this menu item."
    )

    # Access Control
    access_level = models.CharField(
        max_length=50,
        choices=AccessLevelChoices.choices,
        default=AccessLevelChoices.PUBLIC,
        help_text="Required access level to view this menu item."
    )
    is_accessible = models.BooleanField(
        default=True,
        help_text="Globally control accessibility based on access_level."
    )

    # Publishing & Workflow
    is_draft = models.BooleanField(
        default=False,
        help_text="If True, this is a draft version."
    )
    draft_version = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Identifier for the draft version (e.g., 'v1.0-draft')."
    )
    is_published = models.BooleanField(
        default=False,
        help_text="If True, this menu item is live and published."
    )
    published_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Timestamp when the menu item was published."
    )
    published_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='menu_items_published',
        help_text="User who published this menu item."
    )
    is_scheduled = models.BooleanField(
        default=False,
        help_text="If True, this menu item is scheduled for future publication."
    )
    scheduled_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Timestamp when the menu item is scheduled to be published."
    )
    scheduled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='menu_items_scheduled',
        help_text="User who scheduled this menu item."
    )

    # Audit & Soft Delete
    created_at = models.DateTimeField(
        default=timezone.now, # Add default=timezone.now
        help_text="Timestamp when the menu item was created."
    )
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='menu_items_created',
        help_text="User who created this menu item."
    )
    updated_at = models.DateTimeField(auto_now=True, help_text="Timestamp when the menu item was last updated.")
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='menu_items_updated',
        help_text="User who last updated this menu item."
    )
    is_archived = models.BooleanField(
        default=False,
        help_text="If True, this menu item is archived (soft delete for historical purposes)."
    )
    archived_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Timestamp when the menu item was archived."
    )
    archived_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='menu_items_archived',
        help_text="User who archived this menu item."
    )
    is_deleted = models.BooleanField(
        default=False,
        help_text="If True, this menu item is soft-deleted (hidden from active view)."
    )
    deleted_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Timestamp when the menu item was soft-deleted."
    )
    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='menu_items_deleted',
        help_text="User who soft-deleted this menu item."
    )

    class Meta:
        ordering = ['parent_menu__order', 'parent_menu__title', 'order', 'title']
        verbose_name = "Menu Item"
        verbose_name_plural = "Menu Items"

    def __str__(self):
        return self.title

    # Override save method to set created_by/updated_by if user is available (more complex, often done via signals or custom admin save_model)
    # For simplicity, we'll rely on auto_now_add/auto_now and admin.ModelAdmin for created_by/updated_by.