from django.core.management.base import BaseCommand
from django.conf import settings
from core.models import Transaction
import joblib
import os

class Command(BaseCommand):
    help = 'Categorizes uncategorized transactions using the trained model.'

    def handle(self, *args, **options):
        self.stdout.write("Starting transaction categorization...")

        # Define the path to the saved model
        model_path = os.path.join(settings.BASE_DIR, 'core', 'ml_models', 'transaction_classifier.joblib')

        # 1. Load the trained model
        try:
            model = joblib.load(model_path)
            self.stdout.write("Successfully loaded the classifier model.")
        except FileNotFoundError:
            self.stderr.write(self.style.ERROR("Model file not found. Please train the classifier first by running 'python manage.py train_classifier'."))
            return

        # 2. Find all transactions that are not yet categorized
        # We check for category being null or an empty list if you use JSONField
        uncategorized_transactions = Transaction.objects.filter(category__isnull=True)
        
        if not uncategorized_transactions.exists():
            self.stdout.write(self.style.SUCCESS("No uncategorized transactions found."))
            return
            
        self.stdout.write(f"Found {uncategorized_transactions.count()} uncategorized transactions. Predicting categories...")

        # 3. Loop through transactions, predict, and update
        updated_count = 0
        for transaction in uncategorized_transactions:
            # The model expects a list of strings for prediction
            predicted_category_array = model.predict([transaction.name])
            
            # The result is an array, so we take the first element
            predicted_category = predicted_category_array[0]
            
            # To match Plaid's format, we save it as a list with one item
            transaction.category = [predicted_category]
            transaction.save()
            updated_count += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully categorized and updated {updated_count} transactions."))