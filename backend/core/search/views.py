# core/search/views.py
"""
Search views using Elasticsearch.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

# Check if Elasticsearch is available
ELASTICSEARCH_ENABLED = False
try:
    from elasticsearch_dsl import Q
    from .documents import VehicleDocument
    ELASTICSEARCH_ENABLED = True
except ImportError:
    logger.warning("Elasticsearch not available, using database search")


class VehicleSearchView(APIView):
    """
    Advanced vehicle search with Elasticsearch.
    Falls back to database search if Elasticsearch is not available.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '')
        make = request.query_params.get('make')
        model = request.query_params.get('model')
        min_year = request.query_params.get('min_year')
        max_year = request.query_params.get('max_year')
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        fuel_type = request.query_params.get('fuel_type')
        body_type = request.query_params.get('body_type')
        location = request.query_params.get('location')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 12))

        if ELASTICSEARCH_ENABLED:
            return self._elasticsearch_search(
                query, make, model, min_year, max_year,
                min_price, max_price, fuel_type, body_type,
                location, page, page_size
            )
        else:
            return self._database_search(
                query, make, model, min_year, max_year,
                min_price, max_price, fuel_type, body_type,
                location, page, page_size
            )

    def _elasticsearch_search(
        self, query, make, model, min_year, max_year,
        min_price, max_price, fuel_type, body_type,
        location, page, page_size
    ):
        """Perform search using Elasticsearch."""
        search = VehicleDocument.search()

        # Build query
        must_queries = []
        filter_queries = []

        # Full-text search
        if query:
            must_queries.append(
                Q('multi_match',
                  query=query,
                  fields=['make^3', 'model^3', 'description', 'location'],
                  fuzziness='AUTO',
                  prefix_length=2)
            )

        # Filters
        if make:
            filter_queries.append(Q('match', make__raw=make))
        if model:
            filter_queries.append(Q('match', model__raw=model))
        if min_year:
            filter_queries.append(Q('range', year={'gte': int(min_year)}))
        if max_year:
            filter_queries.append(Q('range', year={'lte': int(max_year)}))
        if min_price:
            filter_queries.append(Q('range', price={'gte': float(min_price)}))
        if max_price:
            filter_queries.append(Q('range', price={'lte': float(max_price)}))
        if fuel_type:
            filter_queries.append(Q('term', fuel_type=fuel_type))
        if body_type:
            filter_queries.append(Q('term', body_type=body_type))
        if location:
            filter_queries.append(Q('match', location=location))

        # Only show visible and verified vehicles
        filter_queries.append(Q('term', is_visible=True))
        filter_queries.append(Q('term', verification_state='physical'))

        # Build final query
        if must_queries:
            search = search.query('bool', must=must_queries, filter=filter_queries)
        elif filter_queries:
            search = search.query('bool', filter=filter_queries)

        # Pagination
        start = (page - 1) * page_size
        search = search[start:start + page_size]

        # Execute search
        response = search.execute()

        # Format results
        results = []
        for hit in response:
            results.append({
                'id': hit.meta.id,
                'make': hit.make,
                'model': hit.model,
                'year': hit.year,
                'price': hit.price,
                'mileage': hit.mileage,
                'fuel_type': hit.fuel_type,
                'body_type': hit.body_type,
                'location': hit.location,
                'owner': hit.owner,
                'score': hit.meta.score,
            })

        return Response({
            'count': response.hits.total.value,
            'results': results,
            'page': page,
            'page_size': page_size,
            'total_pages': (response.hits.total.value + page_size - 1) // page_size,
        })

    def _database_search(
        self, query, make, model, min_year, max_year,
        min_price, max_price, fuel_type, body_type,
        location, page, page_size
    ):
        """Fallback to database search when Elasticsearch is unavailable."""
        from django.db.models import Q as DjangoQ
        from core.models import Vehicle
        from core.serializers import VehicleListSerializer

        queryset = Vehicle.objects.filter(
            is_visible=True,
            verification_state='physical'
        ).select_related('owner')

        # Full-text search
        if query:
            queryset = queryset.filter(
                DjangoQ(make__icontains=query) |
                DjangoQ(model__icontains=query) |
                DjangoQ(description__icontains=query) |
                DjangoQ(location__icontains=query)
            )

        # Filters
        if make:
            queryset = queryset.filter(make__iexact=make)
        if model:
            queryset = queryset.filter(model__iexact=model)
        if min_year:
            queryset = queryset.filter(year__gte=min_year)
        if max_year:
            queryset = queryset.filter(year__lte=max_year)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        if fuel_type:
            queryset = queryset.filter(fuel_type__iexact=fuel_type)
        if body_type:
            queryset = queryset.filter(body_type__iexact=body_type)
        if location:
            queryset = queryset.filter(location__icontains=location)

        # Count and paginate
        total = queryset.count()
        start = (page - 1) * page_size
        queryset = queryset.order_by('-created_at')[start:start + page_size]

        serializer = VehicleListSerializer(queryset, many=True)

        return Response({
            'count': total,
            'results': serializer.data,
            'page': page,
            'page_size': page_size,
            'total_pages': (total + page_size - 1) // page_size,
        })


class VehicleAutocompleteView(APIView):
    """Autocomplete suggestions for vehicle search."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '')
        if len(query) < 2:
            return Response({'suggestions': []})

        if ELASTICSEARCH_ENABLED:
            return self._elasticsearch_autocomplete(query)
        else:
            return self._database_autocomplete(query)

    def _elasticsearch_autocomplete(self, query):
        """Get autocomplete suggestions from Elasticsearch."""
        search = VehicleDocument.search()

        # Use suggest feature
        search = search.suggest(
            'make_suggest',
            query,
            completion={
                'field': 'make.suggest',
                'fuzzy': {'fuzziness': 'AUTO'},
                'size': 5
            }
        ).suggest(
            'model_suggest',
            query,
            completion={
                'field': 'model.suggest',
                'fuzzy': {'fuzziness': 'AUTO'},
                'size': 5
            }
        )

        response = search.execute()

        suggestions = set()
        for option in response.suggest.make_suggest[0].options:
            suggestions.add(option.text)
        for option in response.suggest.model_suggest[0].options:
            suggestions.add(option.text)

        return Response({'suggestions': list(suggestions)[:10]})

    def _database_autocomplete(self, query):
        """Fallback autocomplete using database."""
        from core.models import Vehicle

        # Get distinct makes and models matching query
        makes = Vehicle.objects.filter(
            make__icontains=query,
            is_visible=True,
            verification_state='physical'
        ).values_list('make', flat=True).distinct()[:5]

        models = Vehicle.objects.filter(
            model__icontains=query,
            is_visible=True,
            verification_state='physical'
        ).values_list('model', flat=True).distinct()[:5]

        suggestions = list(set(list(makes) + list(models)))[:10]
        return Response({'suggestions': suggestions})
