"""
API views for the SAILSIH rake automation system.
Includes inline serializers, the greedy rake-formation engine,
and CRUD views for Stockyards, Orders, and Automation.
"""

import copy
from collections import defaultdict
from decimal import Decimal

from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order, Stockyard


# ────────────────────────────────────────────
#  Serializers
# ────────────────────────────────────────────

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


# ────────────────────────────────────────────
#  Automation Engine
# ────────────────────────────────────────────

# Mapping of product types to Indian Railways wagon types
WAGON_TYPE_MAP = {
    'Steel Coils': 'BCN',
    'Steel Plates': 'BOXN',
    'TMT Bars': 'BOXN',
    'Wire Rods': 'BOXN',
    'Structural Steel': 'BOST',
    'Steel Billets': 'BOXN',
    'Pig Iron': 'BOXN',
    'Cold Rolled Coils': 'BOXN',
}


def run_engine(stockyards, orders, constraints=None):
    """
    Greedy rake-formation algorithm.
    Groups rail orders by destination, sorts by priority/deadline,
    then greedily fills wagons from matching stockyard inventory.

    Args:
        stockyards: List of stockyard dicts (id, material, quantity).
        orders: List of order dicts (id, customer, product, quantity, ...).
        constraints: Optional dict with maxWagonsPerRake and maxWagonWeight.

    Returns:
        Dict with 'plan' (list of rake assignments) and 'utilization' (avg %).
    """
    constraints = constraints or {}
    max_wagons = constraints.get('maxWagonsPerRake', 43)
    max_weight = constraints.get('maxWagonWeight', 64)
    rake_capacity = max_wagons * max_weight

    # Deep-copy to avoid mutating originals
    stockyards = copy.deepcopy(stockyards)
    orders = copy.deepcopy(orders)

    # Convert Decimal quantities to float for arithmetic
    for item in stockyards + orders:
        if isinstance(item.get('quantity'), Decimal):
            item['quantity'] = float(item['quantity'])

    # Filter to rail-mode orders with a destination code
    rail_orders = [o for o in orders if o.get('mode') == 'rail' and o.get('destCode')]

    # Group orders by destination
    by_dest = defaultdict(list)
    for order in rail_orders:
        by_dest[order['destCode']].append(order)

    # Track remaining inventory and order demand
    inventory = {s['id']: s['quantity'] for s in stockyards}
    remaining = {o['id']: o['quantity'] for o in rail_orders}

    plan = []
    rake_count = 0

    for dest_code, dest_orders in by_dest.items():
        # Sort by priority (ascending) then deadline (earliest first)
        dest_orders.sort(key=lambda o: (o.get('priority', 2), o.get('deadline') or '9'))

        # Keep forming rakes while there are unfulfilled orders for this destination
        while any(remaining.get(o['id'], 0) > 0 for o in dest_orders):
            wagons = []
            total_load = 0.0
            order_ids = set()
            materials = set()
            sources = set()

            # Fill wagons greedily
            for _ in range(max_wagons):
                # Find the next order that has remaining demand and a matching stockyard
                best_order = next(
                    (o for o in dest_orders
                     if remaining.get(o['id'], 0) > 0
                     and any(s['material'] == o['product'] and inventory.get(s['id'], 0) > 0
                             for s in stockyards)),
                    None,
                )
                if not best_order:
                    break

                # Find a matching stockyard with available inventory
                source = next(
                    (s for s in stockyards
                     if s['material'] == best_order['product']
                     and inventory.get(s['id'], 0) > 0),
                    None,
                )
                if not source:
                    break

                # Load as much as possible (capped by wagon weight, demand, and inventory)
                load = min(max_weight, remaining[best_order['id']], inventory[source['id']])

                wagons.append({
                    'orderId': best_order['id'],
                    'product': best_order['product'],
                    'load': load,
                    'source': source['id'],
                    'destCode': dest_code,
                    'customerName': best_order['customer'],
                    'wagonType': WAGON_TYPE_MAP.get(best_order['product'], 'BOXN'),
                    'deadline': best_order.get('deadline'),
                })

                # Update trackers
                remaining[best_order['id']] -= load
                inventory[source['id']] -= load
                total_load += load
                order_ids.add(best_order['id'])
                materials.add(best_order['product'])
                sources.add(source['id'])

            if not wagons:
                break

            rake_count += 1
            plan.append({
                'rakeId': f'Rake-{rake_count}',
                'orderIds': list(order_ids),
                'source': list(sources)[0] if len(sources) == 1 else 'Multiple Stockyards',
                'destCode': dest_code,
                'material': list(materials)[0] if len(materials) == 1 else 'Mixed',
                'totalQuantity': total_load,
                'wagonsUsed': len(wagons),
                'totalWagons': max_wagons,
                'utilization': round(total_load / rake_capacity * 100),
                'wagons': wagons,
                'status': 'Automated',
            })

    avg_utilization = round(sum(p['utilization'] for p in plan) / len(plan)) if plan else 0
    return {'plan': plan, 'utilization': avg_utilization}


# ────────────────────────────────────────────
#  Helpers
# ────────────────────────────────────────────

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


def fetch_engine_data():
    """
    Fetch stockyards and rail orders from the database,
    formatted for the automation engine.
    """
    stockyards = list(Stockyard.objects.values('id', 'material', 'quantity'))
    orders = list(
        Order.objects.filter(mode='rail')
        .order_by('priority', 'deadline')
        .values('id', 'customer', 'product', 'quantity', 'priority', 'deadline', 'mode', 'dest_code')
    )
    # Add destCode alias expected by the engine
    orders = [{**o, 'destCode': o['dest_code']} for o in orders]
    return stockyards, orders


def normalize_dest_code(data):
    """Convert frontend 'destCode' key to 'dest_code' for Django model compatibility."""
    data = data.copy()
    if 'destCode' in data and 'dest_code' not in data:
        data['dest_code'] = data.pop('destCode')
    return data


# ────────────────────────────────────────────
#  Views — Stockyard CRUD
# ────────────────────────────────────────────

class StockyardListCreate(APIView):
    """GET: List all stockyards. POST: Create a new stockyard."""

    def get(self, request):
        stockyards = Stockyard.objects.only('id', 'material', 'quantity', 'location', 'created_at', 'updated_at').order_by('id')
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


# ────────────────────────────────────────────
#  Views — Order CRUD
# ────────────────────────────────────────────

class OrderListCreate(APIView):
    """GET: List orders (filterable by status/priority). POST: Create a new order."""

    def get(self, request):
        queryset = Order.objects.only(
            'id', 'customer', 'product', 'quantity', 'priority',
            'deadline', 'mode', 'dest_code', 'status', 'created_at', 'updated_at',
        )

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


# ────────────────────────────────────────────
#  Views — Automation Engine
# ────────────────────────────────────────────

class AutomateView(APIView):
    """POST: Run the rake-formation engine with optional constraints."""

    def post(self, request):
        try:
            constraints = request.data.get('constraints', {})

            max_wagons = constraints.get('maxWagonsPerRake', 43)
            max_weight = constraints.get('maxWagonWeight', 64)
            if not isinstance(max_wagons, (int, float)) or not (1 <= max_wagons <= 200):
                return err('maxWagonsPerRake must be between 1 and 200', 400)
            if not isinstance(max_weight, (int, float)) or not (1 <= max_weight <= 200):
                return err('maxWagonWeight must be between 1 and 200', 400)

            stockyards, orders = fetch_engine_data()

            result = run_engine(stockyards, orders, {
                'maxWagonsPerRake': int(max_wagons),
                'maxWagonWeight': int(max_weight),
            })

            automated_ids = {oid for rake in result['plan'] for oid in rake['orderIds']}

            return ok({
                'success': True,
                'plan': result['plan'],
                'utilization': result['utilization'],
                'summary': {
                    'totalRakes': len(result['plan']),
                    'ordersProcessed': len(automated_ids),
                    'averageUtilization': result['utilization'],
                },
            })
        except Exception as e:
            return err(str(e))


class AutomatePreview(APIView):
    """GET: Preview automation results without persisting changes."""

    def get(self, request):
        try:
            stockyards, orders = fetch_engine_data()

            max_wagons = int(request.query_params.get('maxWagonsPerRake', 43))
            max_weight = int(request.query_params.get('maxWagonWeight', 64))
            max_wagons = max(1, min(max_wagons, 200))
            max_weight = max(1, min(max_weight, 200))

            result = run_engine(stockyards, orders, {
                'maxWagonsPerRake': max_wagons,
                'maxWagonWeight': max_weight,
            })

            return ok({
                'preview': True,
                'plan': result['plan'],
                'utilization': result['utilization'],
                'summary': {
                    'totalRakes': len(result['plan']),
                    'pendingOrders': len(orders),
                    'stockyardCount': len(stockyards),
                },
            })
        except Exception as e:
            return err(str(e))
