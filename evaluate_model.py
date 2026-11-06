"""
LeafGuard AI – Academic Model Evaluation Script Wrapper
Department of Electronics and Communication Engineering (ECE) Major Project

Executes test set predictions and performance visualizations across all models.
"""

import argparse
from evaluation.evaluate_models import run_full_evaluation

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Evaluate LeafGuard AI Models & Generate Graphs")
    parser.add_argument("--species_model", default="models/species_model.keras")
    parser.add_argument("--disease_model", default="models/disease_model.keras")
    parser.add_argument("--species_test", default="dataset/test")
    parser.add_argument("--disease_test", default="dataset/disease_test")
    parser.add_argument("--results_dir", default="results")
    args = parser.parse_args()

    run_full_evaluation(
        species_model_path=args.species_model,
        disease_model_path=args.disease_model,
        species_test_dir=args.species_test,
        disease_test_dir=args.disease_test,
        results_dir=args.results_dir
    )
