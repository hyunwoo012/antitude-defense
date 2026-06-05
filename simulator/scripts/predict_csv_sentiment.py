import os
import torch
import pandas as pd

from transformers import AutoTokenizer, AutoModelForSequenceClassification

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_DIR = os.path.join(BASE_DIR, "outputs", "kr-finbert-sc-sentiment")
INPUT_CSV = os.path.join(BASE_DIR, "data", "raw", "korean_fin_news_raw.csv")
OUTPUT_CSV = os.path.join(BASE_DIR, "data", "processed", "korean_fin_news_predicted.csv")

ID2LABEL = {
    0: "negative",
    1: "neutral",
    2: "positive",
}


def load_model():
    if not os.path.exists(MODEL_DIR):
        raise FileNotFoundError(f"학습된 모델 폴더가 없습니다: {MODEL_DIR}")

    tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    model.eval()

    return tokenizer, model, device


def predict_text(text: str, tokenizer, model, device):
    encoded = tokenizer(
        text,
        truncation=True,
        padding="max_length",
        max_length=256,
        return_tensors="pt"
    )
    encoded = {k: v.to(device) for k, v in encoded.items()}

    with torch.no_grad():
        outputs = model(**encoded)
        probs = torch.softmax(outputs.logits, dim=-1).squeeze(0)

    pred_id = int(torch.argmax(probs).item())
    pred_label = ID2LABEL[pred_id]

    return {
        "predicted_sentiment": pred_label,
        "negative_score": float(probs[0].item()),
        "neutral_score": float(probs[1].item()),
        "positive_score": float(probs[2].item()),
    }


def main():
    if not os.path.exists(INPUT_CSV):
        raise FileNotFoundError(f"입력 CSV가 없습니다: {INPUT_CSV}")

    os.makedirs(os.path.dirname(OUTPUT_CSV), exist_ok=True)

    tokenizer, model, device = load_model()

    df = pd.read_csv(INPUT_CSV)

    if "text" not in df.columns:
        raise ValueError("입력 CSV에 'text' 컬럼이 없습니다.")

    df["text"] = df["text"].fillna("").astype(str).str.strip()

    predicted_labels = []
    negative_scores = []
    neutral_scores = []
    positive_scores = []

    for idx, text in enumerate(df["text"], start=1):
        if not text:
            predicted_labels.append("")
            negative_scores.append(None)
            neutral_scores.append(None)
            positive_scores.append(None)
            continue

        result = predict_text(text, tokenizer, model, device)

        predicted_labels.append(result["predicted_sentiment"])
        negative_scores.append(result["negative_score"])
        neutral_scores.append(result["neutral_score"])
        positive_scores.append(result["positive_score"])

        print(f"[{idx}/{len(df)}] 예측 완료 -> {result['predicted_sentiment']}")

    df["predicted_sentiment"] = predicted_labels
    df["negative_score"] = negative_scores
    df["neutral_score"] = neutral_scores
    df["positive_score"] = positive_scores

    df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")

    print("\n저장 완료")
    print(f"출력 파일: {OUTPUT_CSV}")


if __name__ == "__main__":
    main()