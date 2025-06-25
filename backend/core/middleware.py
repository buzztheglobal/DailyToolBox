# backend/core/middleware.py
from django.contrib.auth import authenticate, login
from django.conf import settings
import re

class FirebaseAuthenticationMiddleware:
    """
    Custom middleware to authenticate users based on a Firebase ID token
    sent in the 'Authorization' header (Bearer Token).
    Applies to specific API paths.
    """
    def __init__(self, get_response):
        self.get_response = get_response
        # Define API paths that require Firebase authentication
        # Example: only /api/protected/ needs Firebase auth
        self.firebase_auth_paths = [
            re.compile(r'^/api/protected/$'),
            # Add other paths that require Firebase auth here
        ]

    def __call__(self, request):
        # Check if the current request path requires Firebase authentication
        requires_firebase_auth = False
        for pattern in self.firebase_auth_paths:
            if pattern.match(request.path_info):
                requires_firebase_auth = True
                break

        if requires_firebase_auth:
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                firebase_id_token = auth_header.split(' ')[1]
                user = authenticate(request, firebase_id_token=firebase_id_token)
                if user:
                    request.user = user
                    login(request, user) # Maintain session
                else:
                    # Authentication failed: clear user
                    request.user = None
            else:
                # No token or invalid format: clear user
                request.user = None

        response = self.get_response(request)
        return response