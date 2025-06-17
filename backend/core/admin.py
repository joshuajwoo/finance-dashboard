from django.contrib import admin
from .models import Account, Transaction, PlaidItem # Add PlaidItem to the import

# Register the new PlaidItem model
@admin.register(PlaidItem)
class PlaidItemAdmin(admin.ModelAdmin):
    """Admin options for the PlaidItem model."""
    # Customize which fields are displayed in the admin list view
    list_display = ('user', 'institution_name', 'item_id', 'created_at')
    # Add filters for easier navigation
    list_filter = ('user', 'institution_name')
    # Add a search bar
    search_fields = ('institution_name', 'user__username')

# Your existing model registrations
@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('plaid_item', 'name', 'account_type', 'current_balance', 'updated_at')
    list_filter = ('plaid_item__user', 'account_type')
    search_fields = ('name', 'plaid_item__user__username')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('date', 'account', 'name', 'amount', 'category')
    list_filter = ('account__plaid_item__user', 'account', 'date')
    search_fields = ('name', 'account__plaid_item__user__username', 'account__name')
    date_hierarchy = 'date'