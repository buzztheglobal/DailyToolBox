# backend/core/backends.py
from django.contrib.auth.models import User
from firebase_admin import auth

class FirebaseAuthenticationBackend:
    """
    Custom Django authentication backend to authenticate users
    based on Firebase ID tokens.
    """
    def authenticate(self, request, firebase_id_token=None):
        if not firebase_id_token:
            return None

        try:
            # Verify the Firebase ID token
            decoded_token = auth.verify_id_token(firebase_id_token)
            uid = decoded_token['uid']
            email = decoded_token.get('email') # Get email if available

            # Find or create a Django user
            # In a real app, you might want more sophisticated user linking
            user, created = User.objects.get_or_create(username=uid)
            if created:
                user.email = email if email else f"{uid}@firebase.local"
                user.set_unusable_password() # Firebase handles passwords
                user.save()
            elif email and user.email != email:
                user.email = email
                user.save()

            return user
        except Exception as e:
            # Log the error (e.g., invalid token, expired token)
            print(f"Firebase authentication failed: {e}")
            return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None