# backend/core/models.py
from django.db import models
from django.contrib.auth.models import User

# It's good practice to have a separate model for the Plaid Item,
# which represents the login to a financial institution.
# An Item can have multiple accounts (e.g., checking, savings).
class PlaidItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    access_token = models.CharField(max_length=255, unique=True)
    item_id = models.CharField(max_length=255, unique=True)
    institution_name = models.CharField(max_length=255, null=True, blank=True)
    institution_id = models.CharField(max_length=255, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.institution_name} ({self.item_id})"


# Your existing Account model, now modified to link to a PlaidItem.
class Account(models.Model):
    # Instead of user, we link to the PlaidItem, which is linked to the user.
    plaid_item = models.ForeignKey(PlaidItem, on_delete=models.CASCADE, related_name='accounts', null=True)
    # This is Plaid's unique ID for the specific account (e.g., checking account).
    plaid_account_id = models.CharField(max_length=255, unique=True, null=True)

    # --- Fields from before, some now populated from Plaid ---
    name = models.CharField(max_length=255) # e.g., "Plaid Checking"
    mask = models.CharField(max_length=10, null=True) # e.g., "0000"
    account_type = models.CharField(max_length=100, null=True, blank=True) # e.g., "depository"
    account_subtype = models.CharField(max_length=100, null=True, blank=True) # e.g., "checking"
    current_balance = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    available_balance = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency_code = models.CharField(max_length=3, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        # We need to handle the case where plaid_item might be null initially
        user_info = self.plaid_item.user.username if self.plaid_item else "N/A"
        return f"{user_info} - {self.name}"
class Transaction(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='transactions')
    plaid_transaction_id = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=500)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    iso_currency_code = models.CharField(max_length=3, null=True, blank=True)
    date = models.DateField()
    # The category from Plaid is a list, so JSONField is a good choice.
    category = models.JSONField(null=True, blank=True) 
    pending = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.date} - {self.name} - {self.amount}"

    class Meta:
        ordering = ['-date'] # Show newest transactions first by default