from django.core.cache import cache
from .models import FeatureFlag

class FeatureFlagService:
    @staticmethod
    def is_enabled(school, key):
        return FeatureFlagService.get_all_flags(school.pk).get(key, False)

    @staticmethod
    def get_all_flags(school_id):
        cache_key = f"school:{school_id}:feature-flags"
        value = cache.get(cache_key)
        if value is None:
            value = {flag.feature_key: flag.is_enabled for flag in FeatureFlag.objects.filter(school_id=school_id)}
            cache.set(cache_key, value, 300)
        return value
