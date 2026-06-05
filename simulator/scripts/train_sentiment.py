import os
import numpy as np
import pandas as pd

from datasets import Dataset
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TRAIN_PATH = os.path.join(BASE_DIR, "data", "processed", "train.csv")
VAL_PATH = os.path.join(BASE_DIR, "data", "processed", "val.csv")
TEST_PATH = os.path.join(BASE_DIR, "data", "processed", "test.csv")
OUTPUT_DIR = os.path.join(BASE_DIR, "outputs", "kr-finbert-sc-sentiment")

MODEL_NAME = "snunlp/KR-FinBert-SC"

ID2LABEL = {
    0: "negative",
    1: "neutral",
    2: "positive",
}
LABEL2ID = {v: k for k, v in ID2LABEL.items()}


def load_csv(path: str) -> pd.DataFrame:
    if not os.path.exists(path):
        return pd.DataFrame(columns=["text", "label"])

    df = pd.read_csv(path)
    if "text" not in df.columns or "label" not in df.columns:
        raise ValueError(f"{path} 에 text 또는 label 컬럼이 없습니다.")

    df = df[["text", "label"]].copy()
    df["text"] = df["text"].fillna("").astype(str).str.strip()
    df["label"] = df["label"].astype(int)
    df = df[df["text"].str.len() > 0].reset_index(drop=True)
    return df


def df_to_dataset(df: pd.DataFrame) -> Dataset:
    return Dataset.from_pandas(df, preserve_index=False)


def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=-1)

    accuracy = float((preds == labels).mean())

    # sklearn 없이 macro F1 직접 계산
    f1_scores = []
    for class_id in sorted(ID2LABEL.keys()):
        tp = np.sum((preds == class_id) & (labels == class_id))
        fp = np.sum((preds == class_id) & (labels != class_id))
        fn = np.sum((preds != class_id) & (labels == class_id))

        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0

        if precision + recall == 0:
            f1 = 0.0
        else:
            f1 = 2 * precision * recall / (precision + recall)

        f1_scores.append(f1)

    f1_macro = float(np.mean(f1_scores))

    return {
        "accuracy": accuracy,
        "f1_macro": f1_macro,
    }


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    train_df = load_csv(TRAIN_PATH)
    val_df = load_csv(VAL_PATH)
    test_df = load_csv(TEST_PATH)

    if len(train_df) == 0:
        raise ValueError("train.csv가 비어 있습니다.")
    if len(val_df) == 0:
        raise ValueError("val.csv가 비어 있습니다.")

    print(f"train size: {len(train_df)}")
    print(f"val size:   {len(val_df)}")
    print(f"test size:  {len(test_df)}")

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

    train_ds = df_to_dataset(train_df)
    val_ds = df_to_dataset(val_df)
    test_ds = df_to_dataset(test_df) if len(test_df) > 0 else None

    def tokenize_fn(batch):
        return tokenizer(
            batch["text"],
            truncation=True,
            padding="max_length",
            max_length=256,
        )

    train_ds = train_ds.map(tokenize_fn, batched=True)
    val_ds = val_ds.map(tokenize_fn, batched=True)
    if test_ds is not None:
        test_ds = test_ds.map(tokenize_fn, batched=True)

    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=3,
        id2label=ID2LABEL,
        label2id=LABEL2ID,
    )

    args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        eval_strategy="epoch",
        save_strategy="epoch",
        logging_strategy="epoch",
        learning_rate=2e-5,
        per_device_train_batch_size=4,
        per_device_eval_batch_size=4,
        num_train_epochs=5,
        weight_decay=0.01,
        load_best_model_at_end=True,
        metric_for_best_model="f1_macro",
        greater_is_better=True,
        save_total_limit=2,
        report_to="none",
    )

    trainer = Trainer(
        model=model,
        args=args,
        train_dataset=train_ds,
        eval_dataset=val_ds,
        processing_class=tokenizer,
        compute_metrics=compute_metrics,
    )

    trainer.train()

    print("\n[VAL EVAL]")
    val_metrics = trainer.evaluate(val_ds)
    print(val_metrics)

    if test_ds is not None and len(test_df) > 0:
        print("\n[TEST EVAL]")
        test_metrics = trainer.evaluate(test_ds)
        print(test_metrics)

    trainer.save_model(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)

    print(f"\n저장 완료: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()