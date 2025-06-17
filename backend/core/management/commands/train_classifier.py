import pandas as pd
from django.conf import settings
from django.core.management.base import BaseCommand
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline
import joblib
import os

class Command(BaseCommand):
    help = 'Trains the transaction classifier model.'

    def handle(self, *args, **options):
        self.stdout.write("Starting transaction classifier training...")

        # Define the path to the sample data and the model file
        # This assumes the script is run from the 'manage.py' directory (the backend root)
        data_path = os.path.join(settings.BASE_DIR, 'core', 'management', 'commands', 'sample_transactions.csv')
        model_path = os.path.join(settings.BASE_DIR, 'core', 'ml_models')

        # Create the model directory if it doesn't exist
        os.makedirs(model_path, exist_ok=True)
        model_file = os.path.join(model_path, 'transaction_classifier.joblib')

        # 1. Load the data using pandas
        try:
            df = pd.read_csv(data_path)
            self.stdout.write(f"Successfully loaded {len(df)} training examples.")
        except FileNotFoundError:
            self.stderr.write(self.style.ERROR(f"Training data not found at {data_path}"))
            return

        # Prepare the data
        X = df['name']  # The transaction names (features)
        y = df['category']  # The categories (labels)

        # 2. Create a machine learning pipeline
        # TfidfVectorizer: Converts text into numerical feature vectors.
        # LinearSVC: A Support Vector Machine classifier, good for text.
        pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(stop_words='english')),
            ('clf', LinearSVC()),
        ])

        # 3. Train the model
        self.stdout.write("Training model...")
        pipeline.fit(X, y)
        self.stdout.write(self.style.SUCCESS("Model training complete."))

        # 4. Save the trained model to a file
        joblib.dump(pipeline, model_file)
        self.stdout.write(self.style.SUCCESS(f"Model saved to {model_file}"))