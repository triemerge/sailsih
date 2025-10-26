"""
API views for the SAILSIH rake automation system.
Includes inline serializers and CRUD views for Stockyards.
"""

from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Stockyard


# --------------------------------------------
#  Serializers
# --------------------------------------------

class StockyardSerializer(serializers.ModelSerializer):
    """Serializer for the Stockyard model."""

    class Meta:
        model = Stockyard
        fields = [
            'id', 'material', 'quantity', 'location',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
        extra_kwargs = {'id': {'required': False, 'allow_blank': True}}


# --------------------------------------------
#  Helpers
# --------------------------------------------

def ok(data, code=200):
    """Return a success Response."""
    return Response(data, status=code)


def err(message, code=500):
    """Return an error Response."""
    return Response({'error': message}, status=code)


def get_object(model, pk):
    """Fetch a model instance by PK, or return None."""
    if not pk or len(str(pk)) > 50:
        return None
    try:
        return model.objects.get(pk=pk)
    except model.DoesNotExist:
        return None


# --------------------------------------------
#  Views — Stockyard CRUD
# --------------------------------------------

class StockyardListCreate(APIView):
    """GET: List all stockyards. POST: Create a new stockyard."""

    def get(self, request):
        stockyards = Stockyard.objects.order_by('id')
        return ok(StockyardSerializer(stockyards, many=True).data)

    def post(self, request):
        serializer = StockyardSerializer(data=request.data)
        if not serializer.is_valid():
            return err(serializer.errors, 400)
        try:
            serializer.save()
            return ok(serializer.data, 201)
        except Exception as e:
            if 'unique' in str(e).lower():
                return err('Duplicate ID', 409)
            return err(str(e))


class StockyardDetail(APIView):
    """GET / PUT / DELETE a single stockyard by ID."""

    def get(self, request, pk):
        obj = get_object(Stockyard, pk)
        if not obj:
            return err('Not found', 404)
        return ok(StockyardSerializer(obj).data)

    def put(self, request, pk):
        obj = get_object(Stockyard, pk)
        if not obj:
            return err('Not found', 404)
        serializer = StockyardSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return ok(serializer.data)
        return err(serializer.errors, 400)

    def delete(self, request, pk):
        obj = get_object(Stockyard, pk)
        if not obj:
            return err('Not found', 404)
        obj_id = obj.id
        obj.delete()
        return ok({'message': 'Deleted', 'id': obj_id})