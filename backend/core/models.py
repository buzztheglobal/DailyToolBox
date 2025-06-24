# backend/core/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone # Import timezone for auto_now_add/auto_now

# Get the custom user model (if defined) or Django's default User
User = get_user_model()

# Define choices for access_level
ACCESS_LEVEL_CHOICES = [
    ('public', 'Public (Accessible by all)'),
    ('registered', 'Registered (Accessible by logged-in users)'),
    ('admin', 'Admin (Accessible by staff/admin users only)'),
    ('private', 'Private (Accessible by specific users/groups)'),
]

class MenuItem(models.Model):
    """
    Comprehensive model for menu items in a Single Page Application (SPA).
    Designed for nested menus, SEO, GEO, analytics, and content management features.
    """
    # Core Menu Fields
    parent_menu = models.ForeignKey(
        'self',
        on_delete=models.CASCADE, # If parent is deleted, children are also deleted
        null=True,
        blank=True,
        related_name='dropdown_items', # Access children via parent.dropdown_items
        help_text="Select a parent menu item for nested navigation."
    )
    title = models.CharField(
        max_length=100,
        unique=True, # Ensure unique titles for main navigation consistency
        help_text="The display title of the menu item."
    )
    url = models.CharField(
        max_length=255, # Increased length for longer URLs
        blank=True,
        null=True,
        help_text="The URL path for the menu item (e.g., /tools/calc or https://example.com)."
    )
    order = models.IntegerField(
        default=0,
        help_text="Order in which menu items appear (lower numbers first)."
    )
    icon = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Optional icon class or name (e.g., 'fa-calculator' or 'material-symbols-light:calculator')."
    )

    # Display & Behavior Flags
    is_active = models.BooleanField(
        default=True,
        help_text="Determines if the menu item is currently active and usable."
    )
    is_visible = models.BooleanField(
        default=True,
        help_text="Controls visibility in the sidebar/navigation (can be active but hidden)."
    )
    is_external = models.BooleanField(
        default=False,
        help_text="If true, the URL links to an external website."
    )
    target = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        default='_self',
        choices=[('_self', 'Same Window/Tab'), ('_blank', 'New Window/Tab')],
        help_text="Specifies where to open the linked document (_self, _blank, etc.)."
    )
    is_dropdown = models.BooleanField(
        default=False,
        help_text="Indicates if this menu item is designed to contain dropdown sub-items."
    )

    # Content Management & Promotional Flags
    tool_domain = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Specific domain or category for the tool/convertor (e.g., 'calculator', 'converter')."
    )
    is_trending = models.BooleanField(
        default=False,
        help_text="Highlights this menu item as currently trending."
    )
    is_promoted = models.BooleanField(
        default=False,
        help_text="Marks this menu item for special promotion/visibility."
    )
    is_featured = models.BooleanField(
        default=False,
        help_text="Indicates if the menu item is a featured item (e.g., on homepage)."
    )
    is_hidden = models.BooleanField(
        default=False,
        help_text="If true, the menu item is hidden from public view regardless of 'is_visible'."
    )
    is_draft = models.BooleanField(
        default=False,
        help_text="If true, the menu item is in draft state and not yet published."
    )
    draft_version = models.IntegerField(
        default=1,
        help_text="Version number for draft content."
    )
    is_published = models.BooleanField(
        default=True,
        help_text="Indicates if the menu item has been published."
    )
    published_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when the menu item was published."
    )
    published_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL, # User can be deleted without deleting menu item
        null=True,
        blank=True,
        related_name='published_menu_items',
        help_text="User who last published this menu item."
    )
    is_scheduled = models.BooleanField(
        default=False,
        help_text="If true, the menu item is scheduled for future publication."
    )
    scheduled_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when the menu item is scheduled to be published."
    )
    scheduled_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='scheduled_menu_items',
        help_text="User who scheduled this menu item."
    )
    is_featured_image = models.BooleanField(
        default=False,
        help_text="Indicates if a featured image is associated with this menu item."
    )
    featured_image_url = models.URLField(
        max_length=500, # Increased length for URLs
        blank=True,
        null=True,
        help_text="URL of the featured image for the menu item."
    )
    is_video = models.BooleanField(
        default=False,
        help_text="Indicates if a video is associated with this menu item."
    )
    video_url = models.URLField(
        max_length=500, # Increased length for URLs
        blank=True,
        null=True,
        help_text="URL of the associated video for the menu item."
    )


    # SEO & Discoverability
    seo_title = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="SEO-friendly title for search engines (e.g., HTML <title> tag)."
    )
    seo_description = models.TextField( # Use TextField for longer descriptions
        blank=True,
        null=True,
        help_text="SEO-friendly description for search engines (e.g., meta description)."
    )
    is_searchable = models.BooleanField(
        default=True,
        help_text="Indicates if this menu item should be indexed by search engines."
    )
    is_cacheable = models.BooleanField(
        default=True,
        help_text="Indicates if content related to this menu item can be cached for performance."
    )

    # Geographical Targeting
    geo_location = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Geographical location or target audience for the menu item (e.g., 'USA', 'Europe')."
    )

    # Analytics & Tracking
    analytics_data = models.JSONField(
        blank=True,
        null=True,
        help_text="Flexible JSON field for storing analytical data or custom attributes."
    )

    # Custom Styling & Scripting
    custom_css = models.TextField( # Use TextField for potential larger CSS snippets
        blank=True,
        null=True,
        help_text="Custom CSS class or inline styles for specific menu item rendering."
    )
    custom_js = models.TextField( # Use TextField for potential JavaScript snippets
        blank=True,
        null=True,
        help_text="Custom JavaScript to be executed with this menu item (use with caution)."
    )

    # Access Control
    access_level = models.CharField(
        max_length=50,
        choices=ACCESS_LEVEL_CHOICES,
        default='public',
        help_text="Defines who can access this menu item."
    )
    is_accessible = models.BooleanField(
        default=True,
        help_text="Overall accessibility flag (e.g., temporary disable for maintenance)."
    )

    # Audit & Soft Delete
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_menu_items',
        help_text="User who created this menu item."
    )
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_menu_items',
        help_text="User who last updated this menu item."
    )
    is_archived = models.BooleanField(
        default=False,
        help_text="If true, the menu item is archived (soft delete)."
    )
    archived_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when the menu item was archived."
    )
    archived_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='archived_menu_items',
        help_text="User who archived this menu item."
    )
    is_deleted = models.BooleanField(
        default=False,
        help_text="If true, the menu item is marked as deleted (soft delete)."
    )
    deleted_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when the menu item was deleted."
    )
    deleted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='deleted_menu_items',
        help_text="User who deleted this menu item."
    )

    class Meta:
        ordering = ['order', 'title'] # Order by 'order' then 'title'
        verbose_name = "Menu Item"
        verbose_name_plural = "Menu Items"

    def __str__(self):
        # Improve string representation for nested items
        if self.parent_menu:
            return f"{self.parent_menu.title} > {self.title}"
        return self.title

    def save(self, *args, **kwargs):
        """Override save to handle timestamps and publication/archive logic."""
        if self.is_published and not self.published_at:
            self.published_at = timezone.now()
        if self.is_archived and not self.archived_at:
            self.archived_at = timezone.now()
        if self.is_deleted and not self.deleted_at:
            self.deleted_at = timezone.now()
        super().save(*args, **kwargs)

