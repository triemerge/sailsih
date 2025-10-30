"""
API views for the SAILSIH rake automation system.
Includes inline serializers and CRUD views for Stockyards and Orders.
"""

from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order, Stockyard


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


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for the Order model. Exposes dest_code as 'destCode' for the frontend."""

    destCode = serializers.CharField(
        source='dest_code',
        required=False,
        allow_null=True,
        allow_blank=True,
    )

    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'product', 'quantity', 'priority',
            'deadline', 'mode', 'dest_code', 'destCode', 'status',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
        extra_kwargs = {
            'dest_code': {'required': False, 'allow_null': True},
            'id': {'required': False, 'allow_blank': True},
        }

    def to_representation(self, instance):
        """Include destCode alias in output."""
        data = super().to_representation(instance)
        data['destCode'] = data.get('dest_code')
        return data


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


def normalize_dest_code(data):
    """Convert frontend 'destCode' key to 'dest_code' for Django model compatibility."""
    data = data.copy()
    if 'destCode' in data and 'dest_code' not in data:
        data['dest_code'] = data.pop('destCode')
    return data


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


# --------------------------------------------
#  Views — Order CRUD
# --------------------------------------------

class OrderListCreate(APIView):
    """GET: List orders (filterable by status/priority). POST: Create a new order."""

    def get(self, request):
        queryset = Order.objects.all()

        # Optional filters
        if request.query_params.get('status'):
            queryset = queryset.filter(status=request.query_params['status'])
        priority = request.query_params.get('priority')
        if priority:
            try:
                queryset = queryset.filter(priority=int(priority))
            except ValueError:
                pass

        return ok(OrderSerializer(queryset.order_by('priority', 'deadline'), many=True).data)

    def post(self, request):
        serializer = OrderSerializer(data=normalize_dest_code(request.data))
        if not serializer.is_valid():
            return err(serializer.errors, 400)
        try:
            serializer.save()
            return ok(serializer.data, 201)
        except Exception as e:
            if 'unique' in str(e).lower():
                return err('Duplicate ID', 409)
            return err(str(e))


class OrderDetail(APIView):
    """GET / PUT / DELETE a single order by ID."""

    def get(self, request, pk):
        obj = get_object(Order, pk)
        if not obj:
            return err('Not found', 404)
        return ok(OrderSerializer(obj).data)

    def put(self, request, pk):
        obj = get_object(Order, pk)
        if not obj:
            return err('Not found', 404)
        serializer = OrderSerializer(obj, data=normalize_dest_code(request.data), partial=True)
        if serializer.is_valid():
            serializer.save()
            return ok(serializer.data)
        return err(serializer.errors, 400)

    def delete(self, request, pk):
        obj = get_object(Order, pk)
        if not obj:
            return err('Not found', 404)
        obj_id = obj.id
        obj.delete()
        return ok({'message': 'Deleted', 'id': obj_id})