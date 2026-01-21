# core/search/documents.py
"""
Elasticsearch document definitions for indexing vehicles.
"""
from django_elasticsearch_dsl import Document, Index, fields
from django_elasticsearch_dsl.registries import registry
from django.conf import settings

from core.models import Vehicle

# Define the index
vehicles_index = Index('vehicles')
vehicles_index.settings(
    number_of_shards=1,
    number_of_replicas=0
)


@registry.register_document
class VehicleDocument(Document):
    """
    Elasticsearch document for Vehicle model.
    Enables full-text search, fuzzy matching, and autocomplete.
    """

    # Main fields
    make = fields.TextField(
        attr='make',
        fields={
            'raw': fields.KeywordField(),
            'suggest': fields.CompletionField(),
        }
    )
    model = fields.TextField(
        attr='model',
        fields={
            'raw': fields.KeywordField(),
            'suggest': fields.CompletionField(),
        }
    )
    year = fields.IntegerField()
    vin = fields.KeywordField()
    mileage = fields.TextField()
    price = fields.FloatField()
    proposed_price = fields.FloatField()
    listing_type = fields.KeywordField()
    verification_state = fields.KeywordField()
    fuel_type = fields.KeywordField()
    transmission = fields.KeywordField()
    body_type = fields.KeywordField()
    location = fields.TextField(
        fields={
            'raw': fields.KeywordField(),
        }
    )
    description = fields.TextField()
    created_at = fields.DateField()
    is_visible = fields.BooleanField()

    # Nested owner field
    owner = fields.ObjectField(
        properties={
            'id': fields.IntegerField(),
            'username': fields.TextField(),
            'email': fields.KeywordField(),
        }
    )

    class Index:
        name = 'vehicles'
        settings = {
            'number_of_shards': 1,
            'number_of_replicas': 0,
            'analysis': {
                'analyzer': {
                    'autocomplete': {
                        'tokenizer': 'autocomplete',
                        'filter': ['lowercase']
                    },
                    'autocomplete_search': {
                        'tokenizer': 'lowercase'
                    }
                },
                'tokenizer': {
                    'autocomplete': {
                        'type': 'edge_ngram',
                        'min_gram': 2,
                        'max_gram': 10,
                        'token_chars': ['letter', 'digit']
                    }
                }
            }
        }

    class Django:
        model = Vehicle
        fields = []  # Explicitly defined above

        # Don't auto-update index for non-visible or non-verified vehicles
        def get_queryset(self):
            return super().get_queryset().filter(
                is_visible=True,
                verification_state='physical'
            ).select_related('owner')

    def prepare_owner(self, instance):
        """Prepare nested owner data."""
        return {
            'id': instance.owner.id,
            'username': instance.owner.username,
            'email': instance.owner.email,
        }

    def prepare_price(self, instance):
        """Return price or proposed price."""
        return float(instance.price or instance.proposed_price or 0)
