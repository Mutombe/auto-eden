# core/search/signals.py
"""
Signals to keep Elasticsearch index in sync with database.
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
import logging

logger = logging.getLogger(__name__)

# Check if Elasticsearch is available
ELASTICSEARCH_ENABLED = False
try:
    from django_elasticsearch_dsl.signals import RealTimeSignalProcessor
    from .documents import VehicleDocument
    ELASTICSEARCH_ENABLED = True
except ImportError:
    logger.info("Elasticsearch not available, skipping document indexing")


if ELASTICSEARCH_ENABLED:
    from core.models import Vehicle

    @receiver(post_save, sender=Vehicle)
    def update_vehicle_document(sender, instance, **kwargs):
        """Update Elasticsearch document when vehicle is saved."""
        try:
            # Only index visible, verified vehicles
            if instance.is_visible and instance.verification_state == 'physical':
                VehicleDocument().update(instance)
                logger.debug(f"Updated Elasticsearch document for vehicle {instance.id}")
            else:
                # Remove from index if not visible/verified
                VehicleDocument().get(id=instance.id).delete()
                logger.debug(f"Removed vehicle {instance.id} from Elasticsearch index")
        except Exception as e:
            logger.warning(f"Failed to update Elasticsearch for vehicle {instance.id}: {e}")

    @receiver(post_delete, sender=Vehicle)
    def delete_vehicle_document(sender, instance, **kwargs):
        """Remove Elasticsearch document when vehicle is deleted."""
        try:
            VehicleDocument().get(id=instance.id).delete()
            logger.debug(f"Deleted Elasticsearch document for vehicle {instance.id}")
        except Exception as e:
            logger.warning(f"Failed to delete Elasticsearch document for vehicle {instance.id}: {e}")
