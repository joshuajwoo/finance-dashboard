from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, permissions
from .serializers import UserSerializer, TransactionSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.exceptions import ApiException
from django.http import JsonResponse
import json
from .models import PlaidItem, Account, Transaction
from datetime import datetime, timedelta
import plaid
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

class ProtectedDataView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        content = {
            'message': f'Hello, {request.user.username}! This is protected data.',
            'user_id': request.user.id,
            'user_email': request.user.email,
        }
        return Response(content)

class CreateLinkTokenView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            if not settings.PLAID_CLIENT:
                raise Exception("Plaid client is not configured. Check environment variables.")
            plaid_request = LinkTokenCreateRequest(
                user=LinkTokenCreateRequestUser(client_user_id=str(request.user.id)),
                client_name=settings.APP_NAME,
                products=settings.PLAID_PRODUCTS,
                country_codes=settings.PLAID_COUNTRY_CODES,
                language='en',
            )
            response = settings.PLAID_CLIENT.link_token_create(plaid_request)
            return Response(response.to_dict())
        except ApiException as e:
            error_response = json.loads(e.body)
            return JsonResponse({'error': error_response}, status=e.status)
        except Exception as e:
            return JsonResponse({'error': 'A generic server error occurred.'}, status=500)

class SetAccessTokenView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        public_token = request.data.get('public_token')
        institution_metadata = request.data.get('institution', {})
        institution_id = institution_metadata.get('institution_id')
        institution_name = institution_metadata.get('name', 'Unknown Institution')
        if not public_token or not institution_id:
            return Response({'error': 'Public token or institution ID not provided.'}, status=400)
        if PlaidItem.objects.filter(user=request.user, institution_id=institution_id).exists():
            return Response({'error': f'You have already linked an account from {institution_name}.'}, status=409)
        try:
            exchange_response = settings.PLAID_CLIENT.item_public_token_exchange({'public_token': public_token})
            access_token = exchange_response['access_token']
            item_id = exchange_response['item_id']
            plaid_item = PlaidItem.objects.create(
                user=request.user,
                access_token=access_token,
                item_id=item_id,
                institution_name=institution_name,
                institution_id=institution_id
            )
            try:
                accounts_response = settings.PLAID_CLIENT.accounts_get({'access_token': access_token})
                for account_data in accounts_response['accounts']:
                    Account.objects.create(
                        plaid_item=plaid_item,
                        plaid_account_id=account_data['account_id'],
                        name=account_data['name'],
                        mask=account_data['mask'],
                        account_type=account_data['type'],
                        account_subtype=account_data['subtype'],
                        current_balance=account_data['balances']['current'],
                        available_balance=account_data['balances']['available'],
                        currency_code=account_data['balances']['iso_currency_code']
                    )
                return Response({'message': f"Access token for {institution_name} saved and accounts created successfully."}, status=201)
            except ApiException as e:
                return JsonResponse({'error': 'Could not fetch accounts, but item was linked.'}, status=207)
        except ApiException as e:
            error_response = json.loads(e.body)
            return JsonResponse({'error': error_response}, status=e.status)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

class TransactionsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        plaid_items = PlaidItem.objects.filter(user=request.user)
        if not plaid_items.exists():
            return Response({'error': 'No bank accounts linked.'}, status=404)
        try:
            end_date_str = request.query_params.get('end_date', datetime.now().date().isoformat())
            start_date_str = request.query_params.get('start_date', (datetime.now().date() - timedelta(days=30)).isoformat())
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            print(f"Fetching transactions from {start_date} to {end_date}")
            for item in plaid_items:
                access_token = item.access_token
                plaid_request = {"access_token": access_token, "start_date": start_date, "end_date": end_date}
                response = settings.PLAID_CLIENT.transactions_get(plaid_request)
                for plaid_transaction in response['transactions']:
                    try:
                        account = Account.objects.get(plaid_account_id=plaid_transaction['account_id'])
                        Transaction.objects.update_or_create(
                            plaid_transaction_id=plaid_transaction['transaction_id'],
                            defaults={
                                'account': account,
                                'name': plaid_transaction['name'],
                                'amount': plaid_transaction['amount'],
                                'iso_currency_code': plaid_transaction['iso_currency_code'],
                                'date': plaid_transaction['date'],
                                'pending': plaid_transaction['pending'],
                            }
                        )
                    except Account.DoesNotExist:
                        print(f"Skipping transaction because account {plaid_transaction['account_id']} not found.")
            user_accounts = Account.objects.filter(plaid_item__in=plaid_items)
            all_transactions = Transaction.objects.filter(
                account__in=user_accounts, date__gte=start_date, date__lte=end_date
            ).order_by('-date')
            serializer = TransactionSerializer(all_transactions, many=True)
            return Response(serializer.data) # Return the data directly
        except ApiException as e:
            error_response = json.loads(e.body)
            return JsonResponse({'error': error_response}, status=e.status)
        except Exception as e:
            print(f"An unexpected error occurred in TransactionsView: {e}")
            return JsonResponse({'error': str(e)}, status=500)