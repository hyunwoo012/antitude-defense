import os
import sys
import torch

from transformers import AutoTokenizer, AutoModelForSequenceClassification

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "outputs", "kr-finbert-sc-sentiment")

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


def predict(text: str, tokenizer, model, device):
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

    result = {
        "label": pred_label,
        "negative": float(probs[0].item()),
        "neutral": float(probs[1].item()),
        "positive": float(probs[2].item()),
    }
    return result


def main():
    tokenizer, model, device = load_model()

    if len(sys.argv) >= 2:
        text = " ".join(sys.argv[1:]).strip()
    else:
        text = input("뉴스 문장을 입력하세요:\n").strip()

    if not text:
        print("입력 텍스트가 비어 있습니다.")
        return

    result = predict(text, tokenizer, model, device)

    print("\n[예측 결과]")
    print(f"label    : {result['label']}")
    print(f"negative : {result['negative']:.4f}")
    print(f"neutral  : {result['neutral']:.4f}")
    print(f"positive : {result['positive']:.4f}")


if __name__ == "__main__":
    main()