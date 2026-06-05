import os
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

LABELED_CSV = os.path.join(BASE_DIR, "data", "labeled", "korean_fin_news_labeled.csv")
PREDICTED_CSV = os.path.join(BASE_DIR, "data", "processed", "korean_fin_news_predicted.csv")
OUTPUT_CSV = os.path.join(BASE_DIR, "data", "processed", "comparison_results.csv")

VALID_LABELS = {"negative", "neutral", "positive"}


def main():
    if not os.path.exists(LABELED_CSV):
        raise FileNotFoundError(f"라벨링 파일이 없습니다: {LABELED_CSV}")

    if not os.path.exists(PREDICTED_CSV):
        raise FileNotFoundError(f"예측 결과 파일이 없습니다: {PREDICTED_CSV}")

    labeled_df = pd.read_csv(LABELED_CSV)
    predicted_df = pd.read_csv(PREDICTED_CSV)

    required_labeled_cols = {"id", "text", "sentiment"}
    required_pred_cols = {"id", "predicted_sentiment"}

    if not required_labeled_cols.issubset(labeled_df.columns):
        raise ValueError(f"라벨링 파일에 필요한 컬럼이 없습니다: {required_labeled_cols}")

    if not required_pred_cols.issubset(predicted_df.columns):
        raise ValueError(f"예측 파일에 필요한 컬럼이 없습니다: {required_pred_cols}")

    labeled_df["sentiment"] = labeled_df["sentiment"].fillna("").astype(str).str.strip().str.lower()
    predicted_df["predicted_sentiment"] = predicted_df["predicted_sentiment"].fillna("").astype(str).str.strip().str.lower()

    # exclude 제거 및 유효 라벨만 비교
    labeled_df = labeled_df[labeled_df["sentiment"].isin(VALID_LABELS)].copy()
    predicted_df = predicted_df[predicted_df["predicted_sentiment"].isin(VALID_LABELS)].copy()

    merged = pd.merge(
        labeled_df[["id", "text", "sentiment"]],
        predicted_df[["id", "predicted_sentiment", "negative_score", "neutral_score", "positive_score"]],
        on="id",
        how="inner"
    )

    if merged.empty:
        raise ValueError("비교 가능한 데이터가 없습니다. id 또는 라벨 컬럼을 확인하세요.")

    merged["is_correct"] = merged["sentiment"] == merged["predicted_sentiment"]

    total = len(merged)
    correct = int(merged["is_correct"].sum())
    wrong = total - correct
    accuracy = correct / total if total > 0 else 0.0

    os.makedirs(os.path.dirname(OUTPUT_CSV), exist_ok=True)
    merged.to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")

    print("\n[비교 결과]")
    print(f"전체 비교 개수 : {total}")
    print(f"정답 개수      : {correct}")
    print(f"오답 개수      : {wrong}")
    print(f"정확도         : {accuracy:.4f}")

    print("\n[오답 사례]")
    wrong_df = merged[~merged["is_correct"]].copy()

    if wrong_df.empty:
        print("오답 없음")
    else:
        for _, row in wrong_df.iterrows():
            text_preview = str(row["text"])[:80].replace("\n", " ")
            print("-" * 60)
            print(f"id            : {row['id']}")
            print(f"수동 라벨      : {row['sentiment']}")
            print(f"자동 예측      : {row['predicted_sentiment']}")
            print(f"negative_score: {row.get('negative_score', None)}")
            print(f"neutral_score : {row.get('neutral_score', None)}")
            print(f"positive_score: {row.get('positive_score', None)}")
            print(f"text preview  : {text_preview}...")

    print(f"\n비교 결과 CSV 저장 완료: {OUTPUT_CSV}")


if __name__ == "__main__":
    main()